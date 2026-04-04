const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function nukeZombies() {
  console.log('💀 [긴급 소각 작전] 가짜 껍데기를 생산하는 Auth 로그인 시스템 본체 강제 삭제 시작...\n');

  // 삭제해야만 하는 문제의 "좀비 로그인(Auth) 고유 번호" 명단
  const zombies = [
    { uid: 'OSEmWw3pM1eVogForanuseo0frz2', email: 'idouhak1@gmail.com', desc: 'VocaUser3328 껍데기 발급기' },
    { uid: 'CA7p8EVxBgPwoMNRtV8nq8bG0vg2', email: 'kimnamhyung8@gmail.com', desc: 'Namhyung1 껍데기 발급기' }
  ];

  for (const zombie of zombies) {
    console.log(`\n======================================================`);
    console.log(`🚨 타겟 분석 중: ${zombie.email} (${zombie.desc})`);
    console.log(`   - 저주받은 UID: ${zombie.uid}`);
    
    // 1. 좀비 Auth 계정 자체를 구글 로그인 서버(파이어베이스)에서 영구 탈퇴 처리 (가장 중요!)
    try {
      await auth.deleteUser(zombie.uid);
      console.log(`   ✅ [Auth 폭파 완료] 앱이 더 이상 이 UID로 로그인하는 것을 허락하지 않습니다!`);
    } catch (authErr) {
      if (authErr.code === 'auth/user-not-found') {
        console.log(`   ⚠️ 이미 이 Auth UID는 파괴되었습니다. (정상 진행)`);
      } else {
        console.error(`   ❌ Auth 삭제 중 에러 발사: ${authErr.message}`);
      }
    }

    // 2. 방금 폰에서 또 살려냈을지도 모르는 DB 문서도 최후통첩으로 삭제
    try {
      await db.collection('users').doc(zombie.uid).delete();
      console.log(`   ✅ [DB 소각 완료] 부활했던 가짜 껍데기 문서까지 재떨이로 만들었습니다.`);
    } catch (dbErr) {
      console.error(`   ❌ DB 삭제 중 에러: ${dbErr}`);
    }
    console.log(`======================================================`);
  }

  console.log('\n🎉 [작전 대성공] 좀비 루프가 완전히, 영원히 차단되었습니다!');
}

nukeZombies();
