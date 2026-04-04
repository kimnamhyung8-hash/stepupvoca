const admin = require("firebase-admin");
const serviceAccount = require("./target_key.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const checkBucket = async (name) => {
   try {
     const [exists] = await admin.storage().bucket(name).exists();
     console.log(`Bucket ${name} exists: ${exists}`);
   } catch(e) {
     console.error(`Error checking ${name}:`, e.message);
   }
}

async function run() {
  await checkBucket('vocaquest-7ebea.appspot.com');
  await checkBucket('vocaquest-7ebea.firebasestorage.app');
  process.exit(0);
}
run();
