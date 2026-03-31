const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function killDuplicates() {
  console.log('🔫 [마무리 타격] 남은 중복 찌꺼기 강제 소각 중...');
  
  // 지워지지 않고 살아남은 예전 에러(껍데기) 문서 ID 저격
  const targets = [
    'CA7p8EVxBgPwoMNRtV8nq8bG0vg2', // kimnamhyung8 과거 가짜 껍데기
    'OSEmWw3pM1eVogForanuseo0frz2', // idouhak1 과거 가짜 껍데기
    'b2mctWfL0c8Wz4sD9fT4v3cWdM63'  // (확인된 다른 테스트 계정들의 찌꺼기 등) 
  ];

  for (const docId of targets) {
    console.log(` -> [완전 삭제] 타겟 문서 ID 소각: ${docId}`);
    await db.collection('users').doc(docId).delete();
  }

  // shyeum@gmail.com 도 엇갈려 있었으므로 이것도 삭제
  const snapshot = await db.collection('users').get();
  
  // 리스트 다시 뽑아오기
  const dbUsers = [];
  snapshot.forEach(doc => {
    dbUsers.push({ id: doc.id, ...doc.data() });
  });

  const authMap = new Map();
  const listAll = async (next) => {
    const res = await auth.listUsers(1000, next);
    res.users.forEach(u => authMap.set(u.email, u));
    if (res.pageToken) await listAll(res.pageToken);
  }
  await listAll();

  // 아직도 이메일은 같은데 진짜 UID가 아닌 문서 찾아 전부 저격
  let killCount = 0;
  for (const dbUser of dbUsers) {
    if (dbUser.email && authMap.has(dbUser.email)) {
      const realUid = authMap.get(dbUser.email).uid;
      
      // 진짜 UID가 아닌 곳에 내 이메일을 가진 가짜/복제 문서가 있다면
      if (dbUser.id !== realUid) {
        console.log(` -> [중복 찌꺼기 삭제] ${dbUser.email} / 가짜 ID 무조건 삭제: ${dbUser.id}`);
        await db.collection('users').doc(dbUser.id).delete();
        killCount++;
      }
    }
  }

  console.log(`\n🎉 완료되었습니다! 총 ${targets.length + killCount}개의 눈에 보이는 중복 찌꺼기들이 앱 화면상에서 완전히 지워졌습니다.`);
}

killDuplicates();
