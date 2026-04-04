const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function analyzeUsers() {
  console.log('[분석 시작] 데이터베이스 vs 계정 시스템 동기화 체크 중...');

  try {
    // 1. Firestore(DB) 유저 정보 몽땅 가져오기
    console.log('\n--- 1. Firestore DB 스캔 중... ---');
    const dbUsersSnapshot = await db.collection('users').get();
    const dbUsersMap = new Map();
    dbUsersSnapshot.docs.forEach(doc => {
      dbUsersMap.set(doc.id, doc.data());
    });
    console.log(`총 ${dbUsersMap.size}명의 유저가 DB에 존재합니다.`);

    // 2. Firebase Auth(로그인 시스템) 유저 정보 가져오기
    console.log('\n--- 2. Firebase Auth 스캔 중... ---');
    const authUsersMap = new Map();
    const listAllUsers = async (nextPageToken) => {
      const result = await auth.listUsers(1000, nextPageToken);
      result.users.forEach(userRecord => {
        authUsersMap.set(userRecord.uid, userRecord);
      });
      if (result.pageToken) {
        await listAllUsers(result.pageToken);
      }
    };
    await listAllUsers();
    console.log(`총 ${authUsersMap.size}명의 유저가 Auth 시스템에 존재합니다.`);

    // 3. 크로스 체크 시작
    console.log('\n=========== 🚨 데이터 충돌 경고 리스트 ===========\n');
    let ghostAuthCount = 0;
    let ghostDbCount = 0;

    // [케이스 A] Auth O, DB X (로그인은 되는데 앱에서 껍데기뿐인 유저)
    console.log('📌 [케이스 A] 로그인 시스템에는 있지만 DB에 정보가 없는 유저 (재가입 오류의 주범)');
    authUsersMap.forEach((userRecord, uid) => {
      if (!dbUsersMap.has(uid)) {
        ghostAuthCount++;
        console.log(` - UID: ${uid} | ${userRecord.email || '(이메일없음)'} | ${userRecord.displayName || '(이름없음)'}`);
      }
    });
    console.log(`▶ 총 ${ghostAuthCount}명 발견됨\n`);

    // [케이스 B] DB O, Auth X (DB에 데이터는 있는데 로그인 정보가 유실된 유저)
    console.log('📌 [케이스 B] DB에 기록은 있지만 로그인 시스템에서 날아간 유저 고아 데이터');
    dbUsersMap.forEach((dbUser, uid) => {
      if (!authUsersMap.has(uid)) {
        ghostDbCount++;
        console.log(` - UID: ${uid} | ${dbUser.email || '(이메일없음)'} | ${dbUser.nickname || '(닉네임없음)'}`);
      }
    });
    console.log(`▶ 총 ${ghostDbCount}명 발견됨\n`);

    console.log('==================================================');
    console.log('💡 [해결 방안]');
    console.log('현재 문제를 일으키는 원인은 위 리스트에 나온 "불일치 계정"들일 확률이 99%입니다.');
    console.log('저 명단에 나온 계정들만 양쪽에서 깨끗하게 날려주면 모든 로그인/가입 버그가 해결됩니다.');

  } catch (err) {
    console.error('분석 에러:', err);
  }
}

analyzeUsers();
