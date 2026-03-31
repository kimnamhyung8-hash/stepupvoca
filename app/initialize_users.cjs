
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./target_key.json');

// Ensure the private key is properly formatted (replace double escaped newlines)
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const authData = JSON.parse(fs.readFileSync('./users_auth_check.json', 'utf8'));

async function initializeUsers() {
  console.log(`Starting initialization for ${authData.users.length} users...`);
  
  let count = 0;
  for (const user of authData.users) {
    const uid = user.localId;
    const email = user.email;
    const displayName = user.displayName || email.split('@')[0];
    
    // Default user data
    const userData = {
      uid: uid,
      email: email,
      nickname: displayName,
      nickname_lower: displayName.toLowerCase(),
      level: 1,
      points: 0,
      exp: 0,
      currentSkin: 'default',
      mySkins: ['default'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
      isAdmin: email === 'idouhak1@gmail.com' || email === 'kimnamhyung8@gmail.com'
    };

    try {
      // Use set with {merge: true} to avoid overwriting existing data if any
      await db.collection('users').doc(uid).set(userData, { merge: true });
      console.log(`[OK] Initialized: ${email} (${uid})`);
      count++;
    } catch (e) {
      console.error(`[FAIL] ${email}:`, e.message);
    }
  }

  console.log(`\nDONE: ${count} users initialized.`);
  process.exit(0);
}

initializeUsers().catch(console.error);
