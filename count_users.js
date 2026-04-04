import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC_w8ZvzIebOd8-QAz7Fygwr80bpVAQ0Uo",
    authDomain: "vocaquest-login.firebaseapp.com",
    projectId: "vocaquest-login",
    storageBucket: "vocaquest-login.firebasestorage.app",
    messagingSenderId: "543717611236",
    appId: "1:543717611236:web:05e278df171d0e47d33ef1",
    measurementId: "G-242XFK3TG2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function countUsers() {
    try {
        const snap = await getDocs(collection(db, 'users'));
        console.log(`TOTAL_USERS: ${snap.size}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

countUsers();
