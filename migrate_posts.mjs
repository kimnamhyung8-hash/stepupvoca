import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

async function migrateCategories() {
    console.log("Starting Migration...");
    const snap = await getDocs(collection(db, "community_posts"));
    
    let updatedCount = 0;
    const oldCategories = [
        'GLOBAL', 'KR', 'JP', 'VN', 'CN', 'TW', 
        'CULTURE', 'FRIENDS', 'EXPERIENCE', 
        'APP_CERT', 'NOTICE', 'GENERAL'
    ];

    for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (oldCategories.includes(data.category)) {
            try {
                // Determine target -> For now map all legacy to 'FREE' as requested, except maybe NOTICE.
                let targetCategory = 'FREE';
                if (data.category === 'NOTICE') targetCategory = 'PROMO';
                if (data.category === 'APP_CERT') targetCategory = 'STUDY';
                if (data.category === 'FRIENDS') targetCategory = 'EXCHANGE';
                if (data.category === 'CULTURE') targetCategory = 'MEDIA';

                await updateDoc(doc(db, "community_posts", docSnap.id), {
                    category: targetCategory
                });
                updatedCount++;
                console.log(`Updated post \${docSnap.id} from \${data.category} to \${targetCategory}`);
            } catch (err) {
                console.error(`Failed to update \${docSnap.id}:`, err);
            }
        }
    }
    console.log(`Migration Complete! Total updated: \${updatedCount}`);
    process.exit(0);
}

migrateCategories();
