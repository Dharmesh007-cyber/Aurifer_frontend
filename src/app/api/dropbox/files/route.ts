import { NextRequest, NextResponse } from 'next/server';
import { DropboxService } from '@/lib/dropbox-service';

// GET /api/dropbox/files - Get indexed files + folder list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const folderName = searchParams.get('folderName') || undefined;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const files = DropboxService.getFiles(userId, folderName);
    const folders = DropboxService.getFolders(userId);

    return NextResponse.json({ files, folders });
  } catch (error) {
    console.error('[API] GET /api/dropbox/files error:', error);
    return NextResponse.json({ error: 'Failed to get files' }, { status: 500 });
  }
}
