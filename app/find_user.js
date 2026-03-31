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

async function findUser() {
    const targetEmail = 'kimnamhyung8@gmail.com';
    try {
        const snap = await getDocs(collection(db, 'users'));
        console.log(`Searching for: ${targetEmail}`);
        let found = false;
        snap.forEach(doc => {
            const data = doc.data();
            if (data.email === targetEmail) {
                console.log(`FOUND_USER: ${doc.id}`);
                console.log(JSON.stringify(data, null, 2));
                found = true;
            }
        });
        if (!found) {
            console.log('USER_NOT_FOUND');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

findUser();
