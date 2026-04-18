import { NextRequest, NextResponse } from 'next/server';
import { DropboxService } from '@/lib/dropbox-service';

// POST /api/dropbox/files/sync - Manually trigger file sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const success = await DropboxService.indexFiles(userId);

    if (success) {
      const files = DropboxService.getFiles(userId);
      const folders = DropboxService.getFolders(userId);
      return NextResponse.json({
        message: 'Files synced successfully',
        files,
        folders,
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to sync files. Check server logs for Dropbox API details.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API] POST /api/dropbox/files/sync error:', error);
    return NextResponse.json({ error: 'Failed to sync files' }, { status: 500 });
  }
}
