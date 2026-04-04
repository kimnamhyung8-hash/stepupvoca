
const admin = require('firebase-admin');
const fs = require('fs');

const sourceKey = require('./source_key.json');
const targetKey = require('./target_key.json');

// Fix potential \n issues in private_key (redundant if JSON is perfect but safe)
sourceKey.private_key = sourceKey.private_key.replace(/\\n/g, '\n');
targetKey.private_key = targetKey.private_key.replace(/\\n/g, '\n');

const sourceApp = admin.initializeApp({
  credential: admin.credential.cert(sourceKey)
}, 'source');

const targetApp = admin.initializeApp({
  credential: admin.credential.cert(targetKey)
}, 'target');

const sourceDb = sourceApp.firestore();
const targetDb = targetApp.firestore();
const targetAuth = targetApp.auth();

async function migrate() {
  console.log('Starting migration...');
  
  // 1. Get all Auth users from target to create a mapping {email -> uid}
  console.log('Fetching target Auth users...');
  const targetUsersMap = new Map(); // email -> uid
  let pageToken;
  do {
    const result = await targetAuth.listUsers(1000, pageToken);
    result.users.forEach(u => {
      if (u.email) targetUsersMap.set(u.email.toLowerCase(), u.uid);
    });
    pageToken = result.pageToken;
  } while (pageToken);
  
  console.log(`Target Auth users loaded: ${targetUsersMap.size}`);

  // 2. Fetch all users from source Firestore
  console.log('Fetching source Firestore users...');
  const sourceSnap = await sourceDb.collection('users').get();
  console.log(`Source Firestore users found: ${sourceSnap.size}`);

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (const doc of sourceSnap.docs) {
    const data = doc.data();
    const sourceUid = doc.id;
    const email = (data.email || '').toLowerCase();

    // Determine target UID
    let targetUid = targetUsersMap.get(email);
    
    if (!targetUid) {
      console.log(`[SKIP] No target Auth user for email: ${email} (Source UID: ${sourceUid})`);
      skipCount++;
      continue;
    }

    try {
      // Prepare data for target (merge/overwrite)
      const targetData = {
        ...data,
        uid: targetUid, // Ensure UID matches target Auth
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        sourceUid: sourceUid // Keep original UID for reference
      };

      // Handle nickname_lower if missing
      if (targetData.nickname && !targetData.nickname_lower) {
        targetData.nickname_lower = targetData.nickname.toLowerCase();
      }

      await targetDb.collection('users').doc(targetUid).set(targetData, { merge: true });
      console.log(`[OK] Migrated ${email} -> ${targetUid}`);
      successCount++;
    } catch (err) {
      console.error(`[FAIL] Error migrating ${email}:`, err.message);
      failCount++;
    }
  }

  console.log('\nMigration Summary:');
  console.log(`- Success: ${successCount}`);
  console.log(`- Skipped (No Auth): ${skipCount}`);
  console.log(`- Failed: ${failCount}`);
  
  process.exit(0);
}

migrate().catch(err => {
  console.error('CRITICAL ERROR:', err);
  process.exit(1);
});
