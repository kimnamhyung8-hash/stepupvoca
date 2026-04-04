
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyC_w8ZvzIebOd8-QAz7Fygwr80bpVAQ0Uo",
    authDomain: "vocaquest-login.firebaseapp.com",
    projectId: "vocaquest-login",
    storageBucket: "vocaquest-login.firebasestorage.app",
    messagingSenderId: "543717611236",
    appId: "1:543717611236:web:05e278df171d0e47d33ef1",
    measurementId: "G-242XFK3TG2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const notices = [
    {
        id: "notice_1773300000001",
        title: "[공지] 광고 운영 정책 변경 및 사용자 혜택 안내 (v1.3.9)",
        content: `안녕하세요, VocaQuest 팀입니다. 학습에 더 집중하고 싶다는 많은 사용자분들의 소중한 의견을 반영하여, 이번 업데이트부터 광고 운영 정책을 대폭 변경하고 새로운 혜택을 추가하였습니다.

1. 쾌적한 학습 환경 제공 (광고 감소)
전면 광고 빈도 최적화: 학습 흐름을 방해하던 전면 광고의 노출 빈도를 기존보다 훨씬 낮게 조정(5분)하였습니다. 이제 더 연속성 있는 학습이 가능합니다. 선택적 광고시청: 메인 화면에 "광고보고 500포인트 받기"를 클릭해 시청하시면 1시간동안 광고 없이 공부에 집중 할 수 있습니다.

2. '광고 프리 패스' 아이템 출시
완전한 무광고 환경: 상점에서 '광고 프리 패스'를 만나보세요! 단 한 번의 이용으로 일정 기간 동안 앱 내 모든 광고(전면, 배너 등)를 제거하고 오직 학습에만 전념하실 수 있습니다.

3. 노력하는 당신을 위한 선물! '연속 학습 보너스'
7일 연속 달성 시: 연속 학습(Streak)을 7일 동안 유지하시면, 감사의 의미로 24시간 광고 제거 혜택을 자동으로 드립니다. 꾸준히 공부하면 광고 없이 VocaQuest를 즐기실 수 있습니다!`,
        titles_loc: {
            ko: "[공지] 광고 운영 정책 변경 및 사용자 혜택 안내 (v1.3.9)",
            en: "[Notice] Ads Policy Changes & User Benefits (v1.3.9)",
            ja: "[お知らせ] 広告運営ポリシーの変更およびユーザー特典のご案内 (v1.3.9)",
            zh: "[公告] 广告运营政策变更及用户权益指南 (v1.3.9)",
            vi: "[Thông báo] Thay đổi chính sách quảng cáo và Hướng dẫn quyền lợi người dùng (v1.3.9)"
        },
        contents_loc: {
            ko: `안녕하세요, VocaQuest 팀입니다. 학습에 더 집중하고 싶다는 많은 사용자분들의 소중한 의견을 반영하여, 이번 업데이트부터 광고 운영 정책을 대폭 변경하고 새로운 혜택을 추가하였습니다.

1. 쾌적한 학습 환경 제공 (광고 감소)
전면 광고 빈도 최적화: 학습 흐름을 방해하던 전면 광고의 노출 빈도를 기존보다 훨씬 낮게 조정(5분)하였습니다. 이제 더 연속성 있는 학습이 가능합니다. 선택적 광고시청: 메인 화면에 "광고보고 500포인트 받기"를 클릭해 시청하시면 1시간동안 광고 없이 공부에 집중 할 수 있습니다.

2. '광고 프리 패스' 아이템 출시
완전한 무광고 환경: 상점에서 '광고 프리 패스'를 만나보세요! 단 한 번의 이용으로 일정 기간 동안 앱 내 모든 광고(전면, 배너 등)를 제거하고 오직 학습에만 전념하실 수 있습니다.

3. 노력하는 당신을 위한 선물! '연속 학습 보너스'
7일 연속 달성 시: 연속 학습(Streak)을 7일 동안 유지하시면, 감사의 의미로 24시간 광고 제거 혜택을 자동으로 드립니다. 꾸준히 공부하면 광고 없이 VocaQuest를 즐기실 수 있습니다!`,
            en: `Hello, this is the VocaQuest team. Based on user feedback, we've updated our ad policy. 1. Optimized ad frequency to 5 mins. 2. Launched 'Ad-Free Pass' item. 3. 7-day streak bonus: 24h ad-free reward!`,
            ja: `こんにちは、VocaQuestチームです。ユーザーの意見を反映し、広告ポリシーを更新しました。1. 広告頻度の最適化（5分）。2. 「広告フリーパス」アイテムの発売。3. 7日間連続学習ボーナス：24時間広告なし！`,
            zh: `大家好，这是 VocaQuest 团队。根据用户反馈，我们更新了广告政策。1. 优化广告频率（5分钟）。2. 推出“免广告通行证”道具。3. 7天连续学习奖励：24小时免广告！`,
            vi: `Xin chào, đây là đội ngũ VocaQuest. Dựa trên phản hồi của người dùng, chúng tôi đã cập nhật chính sách quảng cáo. 1. Tối ưu hóa tần suất quảng cáo (5 phút). 2. Ra mắt vật phẩm 'Thẻ miễn quảng cáo'. 3. Thưởng chuỗi 7 ngày: 24 giờ không quảng cáo!`
        },
        priority: 10,
        createdAt: new Date("2026-03-10T00:00:00Z")
    },
    {
        id: "notice_1773300000002",
        title: "안드로이드 정식 오픈 안내 & 베타 테스터 모집",
        content: "VocaQuest 안드로이드 앱이 정식 출시되었습니다! 더 많은 기능과 안정성을 위해 베타 테스터를 모집하고 있으니 많은 참여 부탁드립니다.",
        titles_loc: {
            ko: "안드로이드 정식 오픈 안내 & 베타 테스터 모집",
            en: "Android Official Launch & Beta Tester Recruitment",
            ja: "Android正式オープン案内＆ベータテスター募集",
            zh: "安卓正式上线通知 & 招募内测用户",
            vi: "Thông báo ra mắt Android & Tuyển người dùng thử nghiệm"
        },
        contents_loc: {
            ko: "VocaQuest 안드로이드 앱이 정식 출시되었습니다! 더 많은 기능과 안정성을 위해 베타 테스터를 모집하고 있으니 많은 참여 부탁드립니다.",
            en: "VocaQuest Android app is officially launched! We are recruiting beta testers for more features and stability.",
            ja: "VocaQuest Androidアプリが正式にリリースされました！ベータテスターを募集中です。",
            zh: "VocaQuest 安卓版正式上线！我们正在招募内测用户以提高稳定性。",
            vi: "Ứng dụng VocaQuest Android đã chính thức ra mắt! Chúng tôi đang tuyển người dùng thử nghiệm."
        },
        priority: 5,
        createdAt: new Date("2026-03-08T00:00:00Z")
    },
    {
        id: "notice_1773300000003",
        title: "AI 보안 및 무료 사용 안내",
        content: "VocaQuest의 모든 AI 기능은 개인정보 보호 정책을 준수하며, 현재 베타 기간 동안 모든 사용자에게 무료로 제공됩니다.",
        titles_loc: {
            ko: "AI 보안 및 무료 사용 안내",
            en: "AI Security & Free Usage Guide",
            ja: "AIセキュリティ＆無料利用案内",
            zh: "AI 安全与免费使用指南",
            vi: "Hướng dẫn bảo mật AI và sử dụng miễn phí"
        },
        contents_loc: {
            ko: "VocaQuest의 모든 AI 기능은 개인정보 보호 정책을 준수하며, 현재 베타 기간 동안 모든 사용자에게 무료로 제공됩니다.",
            en: "All AI features in VocaQuest comply with our privacy policy and are free for all users during the beta period.",
            ja: "VocaQuestのすべてのAI機能はプライバシーポリシーを遵守しており、ベータ期間中はすべて無料で提供されます。",
            zh: "VocaQuest 的所有 AI 功能都遵守隐私政策，并在测试期间向所有用户免费开放。",
            vi: "Tất cả các tính năng AI trong VocaQuest đều tuân thủ chính sách bảo mật và hoàn toàn miễn phí trong giai đoạn beta."
        },
        priority: 0,
        createdAt: new Date("2026-03-08T12:00:00Z")
    }
];

async function populate() {
    for (const n of notices) {
        await setDoc(doc(db, 'notices', n.id), n);
        console.log(`Added: ${n.title}`);
    }
    process.exit(0);
}

populate().catch(console.error);
