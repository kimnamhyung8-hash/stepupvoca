const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function executeFix() {
  console.log('🚀 [작업 시작] 데이터 유실 방어 및 고스트 계정 삭제 유틸리티\n');
  // 3월 20일 기준일
  const cutoffDate = new Date('2026-03-20T00:00:00Z');

  try {
    // ---- [준비] 현재 Auth 및 DB 정보 모두 로드 ----
    const authUsersMap = new Map();
    const authList = async (nextPageToken) => {
      const result = await auth.listUsers(1000, nextPageToken);
      result.users.forEach(u => authUsersMap.set(u.email, u));
      if (result.pageToken) await authList(result.pageToken);
    };
    await authList();

    const dbUsers = [];
    const dbSnapshot = await db.collection('users').get();
    dbSnapshot.forEach(doc => {
      dbUsers.push({ id: doc.id, ...doc.data() });
    });
    console.log(`[분석] 초기 로드: Auth(${authUsersMap.size}명) / DB(${dbUsers.length}명)\n`);

    let fixedCount = 0;
    
    // ==========================================================
    // 1단계: 엇갈린 사용자(이메일 동일, UID 다름) 데이터 병합 복구
    // ==========================================================
    console.log('✅ [1단계] 엇갈린 UID 매칭 및 데이터 복구 시작 (가장 중요)');
    for (const dbUser of dbUsers) {
      if (dbUser.email && authUsersMap.has(dbUser.email)) {
        const authUser = authUsersMap.get(dbUser.email);
        
        if (dbUser.id !== authUser.uid) {
          console.log(`  -> [복구 중] ${dbUser.email} (DB ID: ${dbUser.id} -> 진짜 UID: ${authUser.uid} 폴더로 이사)`);
          
          // 기존 데이터(id 제외)에 올바른 uid 재부여
          const cleanData = { ...dbUser };
          delete cleanData.id;

          // 진짜 UID 방에 새로 만들기
          await db.collection('users').doc(authUser.uid).set({
            ...cleanData,
            migratedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // 가짜 껍데기 UID 방 삭제
          await db.collection('users').doc(dbUser.id).delete();
          fixedCount++;
        }
      }
    }
    console.log(`▶ 1단계: 총 ${fixedCount}명의 엇갈린 데이터를 진짜 로그인 UID로 완벽하게 덮어써 복구했습니다.\n`);

    // ==========================================================
    // 1.5단계: 복구가 끝난 깨끗한 최신 DB 리스트 재조회
    // ==========================================================
    const newDbUids = new Set();
    const newDbSnapshot = await db.collection('users').get();
    newDbSnapshot.forEach(doc => newDbUids.add(doc.id));

    // Auth 리스트 (UID 기준 맵으로 다시 정렬)
    const currentAuthUids = new Map();
    const authListByUid = async (nextPageToken) => {
      const result = await auth.listUsers(1000, nextPageToken);
      result.users.forEach(u => currentAuthUids.set(u.uid, u));
      if (result.pageToken) await authListByUid(result.pageToken);
    };
    await authListByUid();

    // ==========================================================
    // 2단계: 쓸모없는 쓰레기 계정(Auth) 완전 삭제 (3/20일 이전 기준)
    // ==========================================================
    console.log('✅ [2단계] DB 정보가 없는 오래된 유령 접속계정 파기 (가입 막힘 해결)');
    let deletedAuthCount = 0;
    
    for (const [uid, authUser] of currentAuthUids.entries()) {
      // DB에 회원정보 문서가 없는지 확인
      if (!newDbUids.has(uid)) {
        const lastSignInTime = new Date(authUser.metadata.lastSignInTime || authUser.metadata.creationTime);
        
        // 3월 20일 이전 미접속 + DB 정보도 완전 없는 쓰레기 계정이면
        if (lastSignInTime < cutoffDate) {
           console.log(`  -> [삭제] 유령 Auth 계정 소각: ${authUser.email || uid} (최근 접속: ${lastSignInTime.toLocaleString()})`);
           await auth.deleteUser(uid);
           deletedAuthCount++;
        }
      }
    }
    console.log(`▶ 2단계: 총 ${deletedAuthCount}명의 텅 빈 파이어베이스 유령 로그인을 파괴했습니다.\n`);

    // ==========================================================
    // 3단계: Auth 계정이 삭제되어 로그인 불가능한 DB 쪼가리 삭제
    // ==========================================================
    console.log('✅ [3단계] 주인이 없는 빈껍데기 DB 문서 정리');
    let deletedDbCount = 0;

    for (const docId of newDbUids) {
      if (!currentAuthUids.has(docId)) {
        console.log(`  -> [삭제] 유령 DB 데이터 소각: Document ID ${docId}`);
        await db.collection('users').doc(docId).delete();
        deletedDbCount++;
      }
    }
    console.log(`▶ 3단계: 총 ${deletedDbCount}개의 주인 잃은 DB 데이터 쪼가리를 지웠습니다.\n`);

    console.log('🎉🎉 [작업 완료] 모든 회원정보 복구 및 찌꺼기 삭제가 완벽히 끝났습니다!! 🎉🎉');

  } catch (err) {
    console.error('실행 중 치명적 에러 발생:', err);
  }
}

executeFix();
