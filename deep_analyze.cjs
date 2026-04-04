const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function deepAnalyze() {
  const dbUsers = [];
  const dbSnapshot = await db.collection('users').get();
  dbSnapshot.forEach(doc => {
    dbUsers.push({ id: doc.id, ...doc.data() });
  });

  const authUsersMap = new Map();
  const listAllUsers = async (nextPageToken) => {
    const result = await auth.listUsers(1000, nextPageToken);
    result.users.forEach(u => authUsersMap.set(u.email, u));
    if (result.pageToken) await listAllUsers(result.pageToken);
  };
  await listAllUsers();

  console.log('============= 🔥 진짜 원인 발견! 🔥 =============');
  console.log('이메일은 똑같은데 계정(Auth) UID와 DB ID가 엇갈린 유저들:\n');
  
  dbUsers.forEach(dbUser => {
    if (dbUser.email && authUsersMap.has(dbUser.email)) {
      const authUser = authUsersMap.get(dbUser.email);
      if (dbUser.id !== authUser.uid) {
        console.log(`[이메일: ${dbUser.email}]`);
        console.log(` ❌ 로그인 시스템 UID : ${authUser.uid}`);
        console.log(` ❌ 저장소(DB) 문서 ID : ${dbUser.id}`);
        console.log(` 💡 설명: 로그인할 때는 위 UID로 들어오는데, 내 정보는 아래 ID에 저장되어 있어서 앱이 "어? 가입정보가 없네?" 하고 충돌하는 것입니다.\n`);
      }
    }
  });
}

deepAnalyze();
