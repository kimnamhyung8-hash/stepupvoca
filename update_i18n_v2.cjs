
const fs = require('fs');
const path = require('path');

const keysToAdd = {
    today_recommend_label: { ko: "오늘의 추천 학습", en: "Today's Recommended Study", ja: "今日の推奨学習", zh: "今日推荐学习", tw: "今日推薦學習", vi: "Bài học đề xuất hôm nay" },
    today_recommend_desc: { ko: "매일 맞춤형으로 제공되는 AI 보카 미션으로 당신의 학습 데이터를 완성하세요.", en: "Complete your learning data with AI vocabulary missions personalized daily.", ja: "毎日パーソナライズされたAIボカミッションで、あなたの学習データを完成させましょう。", zh: "通过每日个性化的 AI 单词任务完善您的学习数据。", tw: "通過每日個人化的 AI 單字任務完善您的學習數據。", vi: "Hoàn thiện dữ liệu học tập của bạn với các nhiệm vụ từ vựng AI được cá nhân hóa hàng ngày." },
    start_mastery_btn: { ko: "마스터리 클래스 시작하기", en: "Start Mastery Class", ja: "マスタリークラスを開始する", zh: "开始精通课程", tw: "開始精通課程", vi: "Bắt đầu lớp học thông thạo" },
    start_now: { ko: "지금 시작하기", en: "Start Now", ja: "今すぐ開始", zh: "立即开始", tw: "立即開始", vi: "Bắt đầu ngay" },
    ai_dict_desc: { ko: "문맥에 맞는 정확한 의미를 AI가 찾아줍니다.", en: "AI finds the exact meaning according to the context.", ja: "文脈に合った正確な意味をAIが見つけ出します。", zh: "AI 将根据上下文为您寻找准确的含义。", tw: "AI 將根據上下文為您尋找準確的含義。", vi: "AI tìm ra ý nghĩa chính xác theo ngữ cảnh." },
    arcade_desc: { ko: "게임을 통해 즐겁게 복습하고 포인트를 얻으세요.", en: "Review joyfully through games and earn points.", ja: "ゲームを通じて楽しく復習し、ポイントを獲得しましょう。", zh: "通过游戏愉快地复习并赚取积分。", tw: "通過遊戲愉快地復習並賺取積分。", vi: "Ôn tập vui vẻ thông qua trò chơi và kiếm điểm." }
};

const baseDir = 'd:/antigravity/stepupvoca/app/src/i18n';
const langs = ['ko', 'en', 'ja', 'zh', 'tw', 'vi'];

langs.forEach(lang => {
    const filePath = path.join(baseDir, `${lang}.ts`);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.trim();
    if (content.endsWith('};')) {
        content = content.substring(0, content.lastIndexOf('};'));
    }
    Object.entries(keysToAdd).forEach(([key, values]) => {
        const val = values[lang] || values['en'];
        const safeVal = val.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        if (!content.includes(`${key}:`)) {
            content += `    ${key}: "${safeVal}",\n`;
        }
    });
    content += '};\n';
    fs.writeFileSync(filePath, content, 'utf8');
});
