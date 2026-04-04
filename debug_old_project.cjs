
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, limit } = require("firebase/firestore");

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

async function check() {
    try {
        console.log("Checking vocaquest-login / users...");
        const snap = await getDocs(collection(db, 'users'));
        console.log(`TOTAL_FOUND_IN_OLD: ${snap.size}`);
        
        if (snap.size > 0) {
            console.log("SAMPLE_DATA:");
            snap.docs.slice(0, 3).forEach(doc => {
                console.log(JSON.stringify({id: doc.id, ...doc.data()}));
            });
        }
        process.exit(0);
    } catch (e) {
        console.error("DEBUG ERROR:", e.message);
        process.exit(1);
    }
}
check();
