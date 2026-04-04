
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyBillXmxfj_vSWODqO-21uBgEuoi_1drGA",
    authDomain: "vocaquest-7ebea.firebaseapp.com",
    projectId: "vocaquest-7ebea",
    storageBucket: "vocaquest-7ebea.firebasestorage.app",
    messagingSenderId: "806999527929",
    appId: "1:806999527929:web:da34566d0b4cd1b4b12d28",
    measurementId: "G-HBEEWQH8SZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
    try {
        console.log("Checking vocaquest-7ebea / users...");
        const snap = await getDocs(collection(db, 'users'));
        console.log(`TOTAL_FOUND: ${snap.size}`);
        snap.docs.forEach((doc, idx) => {
            const d = doc.data();
            console.log(`[${idx}] ID: ${doc.id}, NICK: ${d.nickname}, EMAIL: ${d.email}`);
        });
        process.exit(0);
    } catch (e) {
        console.error("DEBUG ERROR:", e.message);
        process.exit(1);
    }
}
check();
