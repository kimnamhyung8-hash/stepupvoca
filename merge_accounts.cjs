
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./target_key.json');
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function mergeAccounts() {
    const oldUid = 'E1u816p9z1fXwLIn6xLx7u1v9XF3';
    const newUid = 'OSEmWw3pM1eVogForanuseo0frz2';
    
    console.log(`Starting merge: ${oldUid} -> ${newUid}`);
    
    // 1. Check if old document exists
    const oldRef = db.collection('users').doc(oldUid);
    const oldSnap = await oldRef.get();
    
    if (oldSnap.exists) {
        console.log(`Old account found. Data:`, oldSnap.data());
        
        // In this case, we'll just delete the old one because the new one is already active
        // and has the updated nickname "vocaadmin".
        await oldRef.delete();
        console.log(`Deleted redundant old record: ${oldUid}`);
    } else {
        console.log(`Old account ${oldUid} not found. Nothing to delete.`);
    }

    // 2. Ensure new account is marked as admin
    const newRef = db.collection('users').doc(newUid);
    await newRef.set({ isAdmin: true }, { merge: true });
    console.log(`Ensured admin status for: ${newUid}`);
}

mergeAccounts().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
