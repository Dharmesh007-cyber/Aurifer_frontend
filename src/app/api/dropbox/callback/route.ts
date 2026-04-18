import { NextRequest, NextResponse } from 'next/server';
import { DropboxService } from '@/lib/dropbox-service';

// OAuth2 callback handler
// Dropbox redirects here after user authorizes the app
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle error from Dropbox
    if (error) {
      return NextResponse.redirect(new URL('/dashboard?dropbox_error=access_denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?dropbox_error=no_code', request.url));
    }

    // Get userId from state parameter (in production, decode and verify state)
    // For now, we'll use a fixed userId (should come from session/state)
    const userId = 'user-123'; // TODO: Extract from state or session

    // Handle OAuth callback
    const success = await DropboxService.handleOAuthCallback(code, userId);

    if (success) {
      // Redirect back to dashboard with success message
      return NextResponse.redirect(new URL('/dashboard?dropbox=connected', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard?dropbox_error=failed', request.url));
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/dashboard?dropbox_error=unknown', request.url));
  }
}
