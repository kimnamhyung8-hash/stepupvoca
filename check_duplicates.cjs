
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // assuming this exists or I'll try to find the key

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function checkDuplicates() {
    const email = 'idouhak1@gmail.com';
    const snapshot = await db.collection('users').where('email', '==', email).get();
    
    console.log(`Found ${snapshot.size} users with email: ${email}`);
    snapshot.forEach(doc => {
        console.log('---');
        console.log('ID (UID):', doc.id);
        console.log('Data:', JSON.stringify(doc.data(), null, 2));
    });
}

checkDuplicates().catch(console.error);
