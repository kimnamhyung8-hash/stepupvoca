
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyC_w8ZvzIebOd8-QAz7Fygwr80bpVAQ0Uo",
    authDomain: "vocaquest-login.firebaseapp.com",
    projectId: "vocaquest-login",
    storageBucket: "vocaquest-login.firebasestorage.app",
    messagingSenderId: "543717611236",
    appId: "1:543717611236:web:05e278df171d0e47d33ef1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function countUsers() {
    try {
        const snap = await getDocs(collection(db, 'users'));
        console.log(`TOTAL USERS IN vocaquest-login: ${snap.size}`);
        snap.docs.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().nickname || doc.data().email}`);
        });
    } catch (e) {
        console.error("ERROR FETCHING USERS:", e.message);
    }
}

countUsers();
