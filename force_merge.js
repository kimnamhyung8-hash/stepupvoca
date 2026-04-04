
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

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

async function forceMerge() {
    const email = 'idouhak1@gmail.com';
    const realUid = 'OSEmWw3pM1eVogForanuseo0frz2';
    const oldUid = 'E1u816p9z1fXwLIn6xLx7u1v9XF3';

    console.log("--- Account Unification Started ---");

    // 1. Delete the ghost "Lee Dou Hak" entry with old ID
    try {
        await deleteDoc(doc(db, 'users', oldUid));
        console.log(`[1] Deleted legacy account: ${oldUid} (Lee Dou Hak)`);
    } catch (e) {
        console.log(`[SKIP] Legacy account not found or already deleted.`);
    }

    // 2. Find any other docs with this email that aren't the real one and delete them
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
        if (d.id !== realUid) {
            await deleteDoc(doc(db, 'users', d.id));
            console.log(`[2] Deleted duplicate email entry: ${d.id}`);
        }
    }

    // 3. Fix the "vocaadmin" entry to have the email and admin flag
    try {
        await updateDoc(doc(db, 'users', realUid), {
            email: email,
            nickname: 'vocaadmin',
            isAdmin: true
        });
        console.log(`[3] Updated real account ${realUid} with email and admin status.`);
    } catch (e) {
        console.log(`[ERROR] Could not update real account: ${e.message}`);
    }

    console.log("--- Unification Finished ---");
}

forceMerge().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
