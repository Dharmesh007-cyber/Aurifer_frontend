# Dropbox Integration Setup Guide

## 🎯 Overview

This integration provides:
- ✅ OAuth2 authentication with Dropbox
- ✅ Persistent connection (stays connected until user disconnects)
- ✅ Nightly automatic file indexing via cron job
- ✅ Manual sync on demand
- ✅ File browsing and filtering by project
- ✅ Disconnect option anytime

---

## 📋 Prerequisites

### 1. Create Dropbox App

1. Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose:
   - Scoped access
   - Full Dropbox access (or app folder)
4. App name: `AURIFER-tax-integration`
5. Note down:
   - App key (Client ID)
   - App secret (Client Secret)

### 2. Configure OAuth2 Redirect URI

In your Dropbox app settings, add:
```
http://localhost:3000/api/dropbox/callback
```

For production:
```
https://yourdomain.com/api/dropbox/callback
```

### 3. Set Environment Variables

Create `.env.local` file:

```env
DROPBOX_CLIENT_ID=your_app_key_here
DROPBOX_CLIENT_SECRET=your_app_secret_here
DROPBOX_REDIRECT_URI=http://localhost:3000/api/dropbox/callback
```

---

## 🔧 Backend Setup

### API Routes Created

1. **`/api/dropbox`** (route.ts)
   - `GET` - Check connection status
   - `POST` - Initiate OAuth or handle callback
   - `DELETE` - Disconnect Dropbox

2. **`/api/dropbox/files`** (files/route.ts)
   - `GET` - Get indexed files
   - `POST` - Manual sync trigger

### Service Layer

**`src/lib/dropbox-service.ts`**

Main service handling:
- OAuth2 flow
- File indexing
- Connection management
- File retrieval

---

## 🔄 OAuth2 Flow

### Step 1: User Clicks "Connect Dropbox"
```
Frontend → POST /api/dropbox → Returns authUrl
Frontend → Redirects to Dropbox
```

### Step 2: User Authorizes App
```
Dropbox → Redirects to /api/dropbox/callback?code=XXX
```

### Step 3: Backend Exchanges Code for Tokens
```
Backend → POST https://api.dropboxapi.com/oauth2/token
Backend → Stores tokens (connection persisted)
Backend → Runs initial file indexing
Backend → Redirects to dashboard
```

### Step 4: Connection Persists
- Connection stored in backend
- Works across sessions
- Only removed when user disconnects

---

## ⏰ Nightly Indexing (Cron Job)

### Option 1: Vercel Cron (Recommended for Vercel deployment)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/dropbox-index",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Create `/api/cron/dropbox-index/route.ts`:
```typescript
import { DropboxService } from '@/lib/dropbox-service';

export async function GET() {
  // Get all users with connections
  // Run indexing for each
  return Response.json({ success: true });
}
```

### Option 2: Node.js Script

Run manually or via system cron:
```bash
# Run at 2 AM daily
0 2 * * * cd /path/to/project && npx tsx scripts/dropbox-nightly-index.ts
```

### Option 3: GitHub Actions

Create `.github/workflows/dropbox-index.yml`:
```yaml
name: Nightly Dropbox Indexing
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC
jobs:
  index:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npx tsx scripts/dropbox-nightly-index.ts
```

---

## 🗄️ Database Schema (For Production)

When ready to use a real database (Prisma + PostgreSQL):

```prisma
model DropboxConnection {
  id           String   @id @default(uuid())
  userId       String   @unique
  accessToken  String
  refreshToken String
  connectedAt  DateTime @default(now())
  lastSyncedAt DateTime?
  active       Boolean  @default(true)
}

model DropboxFile {
  id          String @id @default(uuid())
  dropboxId   String @unique
  userId      String
  name        String
  path        String
  size        Int
  type        String
  modifiedAt  DateTime
  projectId   String?
  indexedAt   DateTime @default(now())
  
  @@index([userId])
  @@index([projectId])
}
```

---

## 🔒 Security Considerations

1. **Token Storage**
   - Encrypt access tokens in database
   - Never expose tokens to frontend
   - Implement token refresh logic

2. **OAuth2 State Parameter**
   - Add CSRF protection with state parameter
   - Verify state on callback

3. **Rate Limiting**
   - Implement rate limiting on API routes
   - Respect Dropbox API limits

4. **User Authorization**
   - Verify user is authenticated before accessing routes
   - Validate userId matches authenticated user

---

## 🧪 Testing

### Test OAuth Flow
```bash
# 1. Start dev server
npm run dev

# 2. Visit dashboard settings
# 3. Click "Connect Dropbox"
# 4. Authorize in Dropbox
# 5. Verify redirect back and file list appears
```

### Test Manual Sync
```bash
curl -X POST http://localhost:3000/api/dropbox/files/sync \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'
```

### Test Disconnect
```bash
curl -X DELETE http://localhost:3000/api/dropbox \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'
```

---

## 📊 How It Works

### Connection Lifecycle
```
User connects → OAuth2 → Tokens stored → Initial indexing
                                      ↓
                            Nightly cron job runs
                                      ↓
                        Files re-indexed → Database updated
                                      ↓
                        Frontend fetches indexed files
```

### File Access
```
Frontend requests files → Backend checks connection
                                      ↓
                        Returns indexed files from DB
                        (NOT live from Dropbox)
                                      ↓
                        Fast, cached response
```

---

## 🚀 Production Deployment

1. **Set environment variables** in your hosting platform
2. **Configure production redirect URI** in Dropbox app
3. **Set up cron job** for nightly indexing
4. **Add database** (PostgreSQL + Prisma recommended)
5. **Implement token refresh** logic
6. **Add monitoring** for failed syncs
7. **Set up alerts** for connection errors

---

## 🐛 Troubleshooting

### "Dropbox not connected" error
- Check if OAuth flow completed successfully
- Verify tokens are stored in backend
- Check browser console for errors

### Files not appearing
- Run manual sync to trigger indexing
- Check cron job logs
- Verify Dropbox API permissions

### OAuth redirect fails
- Verify redirect URI matches exactly in Dropbox settings
- Check for typos in environment variables
- Ensure HTTPS in production

---

## 📞 Support

For issues or questions:
1. Check console logs for error messages
2. Verify environment variables are set
3. Test OAuth flow in development first
4. Review Dropbox API documentation

---

**Built for AURIFER.tax** - Professional Tax & Legal Assistant
