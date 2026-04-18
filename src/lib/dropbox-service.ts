interface DropboxConnection {
  userId: string;
  accessToken: string;
  refreshToken: string;
  connectedAt: Date;
  lastSyncedAt?: Date;
}

interface DropboxFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  modifiedAt: Date;
  folderName: string;
  projectId?: string;
}

// Use globalThis so data survives Next.js HMR module reloads in dev mode
const g = globalThis as any;
if (!g.__dropboxConnections) g.__dropboxConnections = new Map<string, DropboxConnection>();
if (!g.__dropboxFiles) g.__dropboxFiles = new Map<string, DropboxFile[]>();

const connections: Map<string, DropboxConnection> = g.__dropboxConnections;
const files: Map<string, DropboxFile[]> = g.__dropboxFiles;

function extractTopLevelFolder(pathDisplay: string): string {
  const parts = pathDisplay.replace(/^\//, '').split('/');
  return parts.length > 1 ? parts[0] : 'Root';
}

export class DropboxService {
  private static readonly DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID || '';
  private static readonly DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET || '';
  private static readonly DROPBOX_REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || '';

  static getAuthUrl(): string {
    return (
      `https://www.dropbox.com/oauth2/authorize` +
      `?client_id=${this.DROPBOX_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(this.DROPBOX_REDIRECT_URI)}` +
      `&token_access_type=offline`
    );
  }

  static async handleOAuthCallback(code: string, userId: string): Promise<boolean> {
    try {
      const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: this.DROPBOX_CLIENT_ID,
          client_secret: this.DROPBOX_CLIENT_SECRET,
          redirect_uri: this.DROPBOX_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.text();
        console.error('[Dropbox] Token exchange failed:', tokenResponse.status, errBody);
        return false;
      }

      const tokens = await tokenResponse.json();
      console.log('[Dropbox] Token exchange success, account_id:', tokens.account_id);

      connections.set(userId, {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        connectedAt: new Date(),
      });

      // Don't index files here — the team Dropbox can be huge and would
      // block the callback redirect for minutes. The dashboard will
      // trigger a sync automatically when it detects empty files.
      return true;
    } catch (error) {
      console.error('[Dropbox] OAuth callback error:', error);
      return false;
    }
  }

  static disconnect(userId: string): boolean {
    connections.delete(userId);
    files.delete(userId);
    return true;
  }

  static isConnected(userId: string): boolean {
    return connections.has(userId);
  }

  static getConnectionInfo(userId: string) {
    const connection = connections.get(userId);
    if (!connection) return null;
    return {
      connected: true,
      connectedAt: connection.connectedAt,
      lastSyncedAt: connection.lastSyncedAt,
    };
  }

  private static async _getRootNamespaceId(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        console.error('[Dropbox] get_current_account failed:', response.status);
        return null;
      }
      const account = await response.json();
      const rootNs = account.root_info?.root_namespace_id;
      const homeNs = account.root_info?.home_namespace_id;
      console.log('[Dropbox] Account type:', account.account_type?.['.tag'],
        '| root_namespace:', rootNs, '| home_namespace:', homeNs);
      // If root and home differ, this is a team account — use the root namespace
      if (rootNs && rootNs !== homeNs) {
        return rootNs;
      }
      return null;
    } catch (error) {
      console.error('[Dropbox] _getRootNamespaceId error:', error);
      return null;
    }
  }

  static async indexFiles(userId: string): Promise<boolean> {
    const connection = connections.get(userId);
    if (!connection) {
      console.error('[Dropbox] indexFiles: no connection for user', userId);
      return false;
    }

    try {
      const rootNamespaceId = await this._getRootNamespaceId(connection.accessToken);

      const baseHeaders: Record<string, string> = {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      };
      if (rootNamespaceId) {
        baseHeaders['Dropbox-API-Path-Root'] = JSON.stringify({
          '.tag': 'root',
          root: rootNamespaceId,
        });
        console.log('[Dropbox] Using team root namespace:', rootNamespaceId);
      }

      // Step 1: List root to discover top-level folders
      const rootResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
        method: 'POST',
        headers: baseHeaders,
        body: JSON.stringify({
          path: '',
          recursive: false,
          include_deleted: false,
        }),
      });

      if (!rootResponse.ok) {
        const errBody = await rootResponse.text();
        console.error('[Dropbox] list_folder (root) failed:', rootResponse.status, errBody);
        return false;
      }

      const rootData = await rootResponse.json();
      const topFolders = (rootData.entries || []).filter((e: any) => e['.tag'] === 'folder');
      const rootFiles = (rootData.entries || []).filter((e: any) => e['.tag'] === 'file');
      console.log('[Dropbox] Root has', topFolders.length, 'folders and', rootFiles.length, 'files');

      const allFiles: DropboxFile[] = [];
      this._processEntries(rootFiles, allFiles);

      // Step 2: List each top-level folder (non-recursive, one level deep)
      // to keep the sync fast. Cap at 20 folders.
      const foldersToScan = topFolders.slice(0, 20);
      for (const folder of foldersToScan) {
        try {
          const folderPath = folder.path_display || folder.path_lower;
          console.log('[Dropbox] Scanning folder:', folderPath);

          let cursor: string | null = null;
          let hasMore = true;

          const folderResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: baseHeaders,
            body: JSON.stringify({
              path: folderPath,
              recursive: true,
              include_deleted: false,
              limit: 500,
            }),
          });

          if (!folderResponse.ok) {
            console.error('[Dropbox] list_folder failed for', folderPath, ':', folderResponse.status);
            continue;
          }

          let folderData = await folderResponse.json();
          this._processEntries(folderData.entries || [], allFiles);
          cursor = folderData.cursor;
          hasMore = folderData.has_more;

          // Paginate within this folder, but cap at 5 pages to stay fast
          let pages = 0;
          while (hasMore && cursor && pages < 5) {
            const contResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder/continue', {
              method: 'POST',
              headers: baseHeaders,
              body: JSON.stringify({ cursor }),
            });
            if (!contResponse.ok) break;
            folderData = await contResponse.json();
            this._processEntries(folderData.entries || [], allFiles);
            cursor = folderData.cursor;
            hasMore = folderData.has_more;
            pages++;
          }
        } catch (folderErr) {
          console.error('[Dropbox] Error scanning folder:', folder.name, folderErr);
        }
      }

      files.set(userId, allFiles);
      connection.lastSyncedAt = new Date();

      console.log(`[Dropbox] Indexed ${allFiles.length} files for user ${userId}`);
      if (allFiles.length > 0) {
        console.log('[Dropbox] Sample files:', allFiles.slice(0, 5).map(f => f.path));
        const folderSet = new Set(allFiles.map(f => f.folderName));
        console.log('[Dropbox] Folders found:', Array.from(folderSet));
      }

      return true;
    } catch (error) {
      console.error('[Dropbox] indexFiles error:', error);
      return false;
    }
  }

  private static _processEntries(entries: any[], target: DropboxFile[]) {
    for (const entry of entries) {
      // Only index actual files, skip folders and deleted entries
      if (entry['.tag'] !== 'file') continue;

      target.push({
        id: entry.id,
        name: entry.name,
        path: entry.path_display || entry.path_lower,
        size: entry.size || 0,
        type: entry.name.split('.').pop()?.toUpperCase() || 'FILE',
        modifiedAt: entry.server_modified ? new Date(entry.server_modified) : new Date(),
        folderName: extractTopLevelFolder(entry.path_display || entry.path_lower || ''),
      });
    }
  }

  static getFiles(userId: string, folderName?: string): DropboxFile[] {
    const userFiles = files.get(userId) || [];
    if (folderName && folderName !== 'all') {
      return userFiles.filter(f => f.folderName === folderName);
    }
    return userFiles;
  }

  static getFolders(userId: string): string[] {
    const userFiles = files.get(userId) || [];
    const folderSet = new Set(userFiles.map(f => f.folderName));
    return Array.from(folderSet).sort();
  }

  static async getFileDownloadUrl(userId: string, filePath: string): Promise<string | null> {
    try {
      const connection = connections.get(userId);
      if (!connection) return null;

      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
          'Dropbox-API-Arg': JSON.stringify({ path: filePath }),
        },
      });

      return response.url;
    } catch (error) {
      console.error('[Dropbox] getFileDownloadUrl error:', error);
      return null;
    }
  }
}
