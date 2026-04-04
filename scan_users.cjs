const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function scanOldUsers() {
  const cutoffDate = new Date('2026-03-20T00:00:00Z');
  console.log(`[스캔 시작] 기준일: ${cutoffDate.toLocaleString()} 이전 접속자 (현재 로컬 타임 기준)`);

  let targetUsers = [];
  
  const listAllUsers = async (nextPageToken) => {
    const result = await auth.listUsers(1000, nextPageToken);
    
    for (const userRecord of result.users) {
      const lastSignInTime = new Date(userRecord.metadata.lastSignInTime || userRecord.metadata.creationTime);
      
      // 관리자나 테스트 계정 등이 같이 잘려나가지 않도록 주의! 
      if (lastSignInTime < cutoffDate) {
        targetUsers.push({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          lastSignIn: lastSignInTime.toLocaleString()
        });
      }
    }
    
    if (result.pageToken) {
      await listAllUsers(result.pageToken);
    }
  };

  try {
    await listAllUsers();
    console.log(`총 ${targetUsers.length}명의 유저가 3월 20일 이전에 마지막으로 로그인했습니다 (또는 가입만 하고 미접속).`);
    
    // 처음 10명만 화면에 샘플로 출력
    console.log(`\n[삭제 대상 샘플 맛보기] (전체: ${targetUsers.length} 명)`);
    targetUsers.slice(0, 10).forEach(u => console.log(`- ${u.email} | ${u.displayName} | 최근접속: ${u.lastSignIn}`));
    
    if (targetUsers.length > 0) {
       console.log('\n[알림] 삭제를 원하시면 "진행해" 라고 말씀해 주세요. 위의 ${targetUsers.length}명의 DB(Firestore) 및 계정(Auth) 정보가 완전 파기됩니다.');
    }
    
  } catch (error) {
    console.error('스캔 중 오류 발생:', error);
  }
}

scanOldUsers();
