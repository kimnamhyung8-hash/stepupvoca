const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDuplicates() {
  const snapshot = await db.collection('users').get();
  const dbUsers = [];
  snapshot.forEach(doc => {
    dbUsers.push({ id: doc.id, ...doc.data() });
  });

  const emailCounts = {};
  dbUsers.forEach(u => {
    if (u.email) {
      if (!emailCounts[u.email]) emailCounts[u.email] = [];
      emailCounts[u.email].push(u);
    }
  });

  console.log('============= 🔍 중복 데이터 정밀 검사 =============');
  let dupCount = 0;
  for (const [email, usersList] of Object.entries(emailCounts)) {
    if (usersList.length > 1) {
      console.log(`\n🚨 [중복 발견] 이메일: ${email} (${usersList.length}개)`);
      usersList.forEach(u => {
        console.log(`   👉 문서 ID: ${u.id} | 닉네임: ${u.nickname} | 권한: ${u.role || '일반'}`);
      });
      dupCount++;
    }
  }

  if (dupCount === 0) {
    console.log('\n[결과] 현재 DB(서버)상에는 이메일이 중복되는 계정이 0개입니다!!');
    console.log('이전에 꼬인 상태로 앱 화면에 캐시(찌꺼기)로 저장되어 있어서 2개로 보이는 현상일 확률이 높습니다.');
  }
}

checkDuplicates();
