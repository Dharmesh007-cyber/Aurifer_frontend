import { NextRequest, NextResponse } from 'next/server';
import { DropboxService } from '@/lib/dropbox-service';

// GET /api/dropbox/status - Check connection status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const connectionInfo = DropboxService.getConnectionInfo(userId);

    return NextResponse.json({
      connected: connectionInfo !== null,
      ...connectionInfo,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}

// POST /api/dropbox/connect - Initiate OAuth connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, code } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // If code is provided, handle OAuth callback
    if (code) {
      const success = await DropboxService.handleOAuthCallback(code, userId);
      
      if (success) {
        return NextResponse.json({ 
          message: 'Dropbox connected successfully',
          connected: true 
        });
      } else {
        return NextResponse.json({ 
          error: 'Failed to connect Dropbox' 
        }, { status: 500 });
      }
    }

    // Otherwise, return OAuth URL
    const authUrl = DropboxService.getAuthUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect' }, { status: 500 });
  }
}

// DELETE /api/dropbox/disconnect - Disconnect Dropbox
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const success = DropboxService.disconnect(userId);

    if (success) {
      return NextResponse.json({ message: 'Dropbox disconnected successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}
