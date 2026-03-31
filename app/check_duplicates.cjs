
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

async function checkDuplicates() {
    const email = 'idouhak1@gmail.com';
    const snapshot = await db.collection('users').where('email', '==', email).get();
    
    console.log(`Found ${snapshot.size} users with email: ${email}`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log('---');
        console.log('ID (UID):', doc.id);
        console.log('Nickname:', data.nickname);
        console.log('Level:', data.level);
        console.log('Is Admin:', data.isAdmin);
        console.log('Created At:', data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 'N/A');
    });
}

checkDuplicates().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
