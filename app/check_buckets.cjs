// Firebase Admin으로 스토리지 버킷 목록 조회
const admin = require("firebase-admin");

// 서비스 계정 없이 Application Default Credentials 시도
try {
  const sa = require("./target_key.json");
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    projectId: "vocaquest-7ebea"
  });
  console.log("Admin initialized with service account");
} catch(e) {
  console.log("Service account failed:", e.message.substring(0, 100));
  process.exit(1);
}

async function run() {
  // appspot.com 버킷 테스트
  const names = ["vocaquest-7ebea.appspot.com", "vocaquest-7ebea.firebasestorage.app"];
  for (const n of names) {
    try {
      const [exists] = await admin.storage().bucket(n).exists();
      console.log(`  ${n}: exists=${exists}`);
      if (exists) {
        const [meta] = await admin.storage().bucket(n).getMetadata();
        console.log(`  CORS: ${JSON.stringify(meta.cors || [])}`);
      }
    } catch(e) {
      console.log(`  ${n}: ERROR ${e.message.substring(0,80)}`);
    }
  }
  process.exit(0);
}
run();
