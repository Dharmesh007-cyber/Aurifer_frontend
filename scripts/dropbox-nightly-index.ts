#!/usr/bin/env node
/**
 * Nightly Dropbox File Indexing Cron Job
 * 
 * This script runs every night (e.g., 2:00 AM) to:
 * 1. Fetch all active Dropbox connections
 * 2. Index all files from each connected Dropbox account
 * 3. Store updated file metadata in database
 * 
 * Setup:
 * - Add to crontab: 0 2 * * * /usr/bin/node /path/to/dropbox-nightly-index.js
 * - Or use Vercel Cron: Add to vercel.json
 * - Or use GitHub Actions scheduled workflow
 */

import { DropboxService } from '../src/lib/dropbox-service';

// Mock function to get all users with active Dropbox connections
// In production, this would query your database
async function getUsersWithDropboxConnections(): Promise<string[]> {
  // TODO: Replace with actual database query
  // Example: const users = await prisma.dropboxConnection.findMany({ where: { active: true } });
  return ['user-1', 'user-2', 'user-3']; // Mock user IDs
}

async function runNightlyIndexing() {
  console.log('🔄 Starting nightly Dropbox file indexing...');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  const users = await getUsersWithDropboxConnections();
  console.log(`👥 Found ${users.length} user(s) with Dropbox connections`);

  let successCount = 0;
  let failureCount = 0;

  for (const userId of users) {
    try {
      console.log(`\n📁 Indexing files for user: ${userId}`);
      
      const success = await DropboxService.indexFiles(userId);
      
      if (success) {
        successCount++;
        console.log(`✅ Successfully indexed files for user ${userId}`);
      } else {
        failureCount++;
        console.error(`❌ Failed to index files for user ${userId}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      failureCount++;
      console.error(`❌ Error processing user ${userId}:`, error);
    }
  }

  console.log('\n📊 Indexing Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log(`   📝 Total: ${users.length}`);
  console.log(`\n✨ Nightly indexing completed at: ${new Date().toISOString()}`);
}

// Run the indexing
runNightlyIndexing().catch(error => {
  console.error('💥 Fatal error in nightly indexing:', error);
  process.exit(1);
});
