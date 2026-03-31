import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBillXmxfj_vSWODqO-21uBgEuoi_1drGA",
    authDomain: "vocaquest-7ebea.firebaseapp.com",
    projectId: "vocaquest-7ebea",
    storageBucket: "vocaquest-7ebea.firebasestorage.app",
    messagingSenderId: "806999527929",
    appId: "1:806999527929:web:da34566d0b4cd1b4b12d28",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
    try {
        console.log("Trying to sign in anonymously...");
        const userCredential = await signInAnonymously(auth);
        console.log("Signed in anonymously! UID:", userCredential.user.uid);
        
        console.log("Trying to add a test post...");
        await addDoc(collection(db, "community_posts"), {
            category: "TEST",
            title: "TEST",
            content: "TEST",
            authorId: "bot_" + userCredential.user.uid,
            authorName: "Test",
            authorAvatar: "",
            createdAt: serverTimestamp(),
            viewCount: 0,
            commentCount: 0,
        });
        console.log("Success! Anonymous auth handles writes.");
    } catch(e) {
        console.error("Auth or Write failed:", e);
    }
    process.exit(0);
}
test();
