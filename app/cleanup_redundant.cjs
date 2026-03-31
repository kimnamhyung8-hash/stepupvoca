
const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./target_key.json');
// Handle multi-line private key correctly
if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function cleanUp() {
    const oldUid = 'E1u816p9z1fXwLIn6xLx7u1v9XF3';
    const newUid = 'OSEmWw3pM1eVogForanuseo0frz2';
    const email = 'idouhak1@gmail.com';

    console.log(`Cleaning up email: ${email}`);
    
    // Delete the old redundant document
    try {
        await db.collection('users').doc(oldUid).delete();
        console.log(`[SUCCESS] Deleted redundant doc: ${oldUid}`);
    } catch (e) {
        console.log(`[IGNORE] Failed to delete ${oldUid}: ${e.message}`);
    }

    // Ensure the current one is admin
    try {
        await db.collection('users').doc(newUid).update({
            isAdmin: true,
            email: email // explicitly set email just in case
        });
        console.log(`[SUCCESS] Verified admin status for: ${newUid}`);
    } catch (e) {
        console.log(`[WARNING] Failed to update ${newUid}: ${e.message}`);
    }
}

cleanUp().then(() => {
    console.log("Cleanup process finished.");
    process.exit(0);
}).catch(err => {
    console.error("Cleanup process error:", err);
    process.exit(1);
});
