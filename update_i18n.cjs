
const fs = require('fs');
const path = require('path');

const keysToAdd = {
    accuracy_label: { ko: "정확도", en: "Accuracy", ja: "正確度", zh: "准确率", tw: "準確率", vi: "Độ chính xác" },
    impact_label: { ko: "학습 효과", en: "Impact", ja: "学習効果", zh: "学习效果", tw: "學習效果", vi: "Hiệu quả học tập" },
    growth_label: { ko: "{n} 성장", en: "{n} Growth", ja: "{n} 成長", zh: "{n} 增长", tw: "{n} 增長", vi: "Tăng trưởng {n}" },
    ai_live_conv_title: { ko: "AI Live Conversation", en: "AI Live Conversation", ja: "AIライブ会話", zh: "AI 实时对话", tw: "AI 即時對話", vi: "Hội thoại AI trực tiếp" },
    ai_live_conv_subtitle: { ko: "말하기에 대한 공포를 없애고 실력을 완성하세요", en: "Master speaking skills with zero fear", ja: "話すことへの恐怖をなくし、実力を完成させましょう", zh: "消除对说的恐惧，完善您的实力", tw: "消除對說의 恐懼，完善您的實力", vi: "Xóa tan nỗi sợ hãi khi nói và hoàn thiện kỹ năng của bạn" },
    ai_live_conv_desc: { ko: "24시간 대기 중인 원어민 수준의 AI 튜터와 대화하세요. 문장을 말하는 즉시 더 자연스러운 발음과 문법을 피드백해줍니다. 실제 상황과 유사한 다양한 시나리오를 통해 실전 감각을 키울 수 있습니다.", en: "Chat with native-level AI tutors available 24/7. Get real-time feedback on pronunciation and grammar the moment you speak. Develop practical skills through various scenarios mirroring real-life situations.", ja: "24時間待機中のネイティブレベルのAIチューターと会話しましょう。文章を話すと、即座に自然な発音と文法をフィードバックしてくれます。実際の状況에 似た多様なシナリオを通じて、実践感覚を養うことができます。", zh: "与全天候待命的母语级 AI 导师交流。开口即刻获得更自然的路径和语法反馈。通过模拟真实场景的多种剧本提升实战感。", tw: "與全天候待命的母語級 AI 導師交流。開口即刻獲得更自然的路徑和語法回饋。通過模擬真實場景的多種劇本提升實戰感。", vi: "Trò chuyện với gia sư AI cấp độ bản xứ luôn sẵn sàng 24/7. Nhận phản hồi về phát âm và ngữ pháp ngay khi bạn nói. Phát triển kỹ năng thực tế thông qua các tình huống mô phỏng thực tế." },
    gamified_voca_title: { ko: "Gamified Vocabulary", en: "Gamified Vocabulary", ja: "ゲーム化された語彙学習", zh: "游戏化词汇学习", tw: "遊戲化詞彙學習", vi: "Học từ vựng qua trò chơi" },
    gamified_voca_subtitle: { ko: "지루한 단어 암기가 아닌 즐거운 정복의 여정", en: "An enjoyable journey of mastery, not boring memorization", ja: "退屈な単語暗記ではなく、楽しい征服の旅", zh: "不再是枯燥的单词记忆，而是愉快的征服之旅", tw: "不再是枯燥的單詞記憶，而是愉快的征服之旅", vi: "Hành trình chinh phục thú vị, không phải ghi nhớ từ vựng nhàm chán" },
    gamified_voca_desc: { ko: "당신이 틀린 단어, 헷갈려 하는 표현을 AI가 분석하여 맞춤형 단어장은 구성합니다. 매일 주어지는 퀘스트와 퀴즈를 해결하다 보면 어느덧 수천 개의 단어가 당신의 자산이 되어 있을 것입니다.", en: "AI analyzes the words you miss and phrases you find confusing to build a personalized vocabulary list. Complete daily quests and quizzes, and you'll find thousands of words becoming your asset before you know it.", ja: "あなたが間違えた単語、迷っている表現をAIが分析して、カスタマイ즈された単語帳を構成します。日々のクエストとクイズを解決していくうちに、いつの間にか数千の単語があなたの資産になっていることでしょう。", zh: "AI 会分析您读错的单词和容易混淆的表达方式，为您构建个性化的单词本。完成每日任务和测验，不知不觉中数千个单词将成为您的财富。", tw: "AI 會分析您讀錯的單字和容易混淆的表達方式，為您構建個人化的單字本。完成每日任務和測驗，不知不覺中數千個單字將成為您的財富。", vi: "AI phân tích những từ bạn sai, những cách diễn đạt bạn còn nhầm lẫn để tạo thành sổ tay từ vựng cá nhân hóa. Giải quyết các nhiệm vụ và câu đố hàng ngày, hàng nghìn từ sẽ trở thành tài sản của bạn từ lúc nào không hay." },
    global_battle_title: { ko: "Global Real-time Battle", en: "Global Real-time Battle", ja: "グローバルリアルタイムバトル", zh: "全球实时对战", tw: "全球即時對戰", vi: "Trận chiến toàn cầu thời gian thực" },
    global_battle_subtitle: { ko: "전 세계 경쟁자들과 실력을 겨루는 짜릿함", en: "The thrill of competing with rivals worldwide", ja: "世界中のライバルと実력을 競い合うスリル", zh: "与全球竞争对手较量的快感", tw: "與全球競爭對手較量的快感", vi: "Cảm giác phấn khích khi so tài với các đối thủ trên toàn thế giới" },
    global_battle_desc: { ko: "학습은 고립된 싸움이 아닙니다. 전 세계 글로벌 챌린저들과 실시간 영어 퀴즈 배틀을 즐기세요. 승리할 때마다 주어지는 대량의 포인트와 명예로운 앰블럼이 당신의 동기부여를 끊임없이 자극합니다.", en: "Learning isn't a solitary battle. Enjoy real-time English quiz battles with global challengers. Massive points and honorable emblems awarded for every victory will keep you constantly motivated.", ja: "学習は孤独な戦いではありません。世界中のグローバルチャレンジャーとリアルタイムの英語クイズバトルを楽しみましょう。勝利するたびに与えられる大量のポイントと名誉あるエンブレムが、あなたのモチベーションを絶えず刺激します。", zh: "学习不应该是一场孤独的战斗。与全球挑战者一起享受实时英语测验对战。每次胜利获得的丰厚积分和荣誉勋章将不断激发您的学习动力。", tw: "學習不應該是一場孤獨的戰鬥。與全球挑戰者一起享受即時英語測驗對戰。每次勝利獲得的豐厚積分和榮譽勳章將不斷激發您的學習動力。", vi: "Học tập không phải là một cuộc chiến cô độc. Hãy tận hưởng các trận đấu đố tiếng Anh thời gian thực với những người thách đấu toàn cầu. Số điểm khổng lồ và các biểu tượng vinh dự được trao sau mỗi chiến thắng sẽ không ngừng thúc đẩy động lực của bạn." },
    realtime_ai_badge: { ko: "실시간 AI", en: "Real-time AI", ja: "リアルタイムAI", zh: "实时 AI", tw: "即時 AI", vi: "AI thời gian thực" },
    unlimited_access_badge: { ko: "무제한 액세스", en: "Unlimited Access", ja: "無制限アクセス", zh: "无限访问", tw: "無限訪問", vi: "Truy cập không giới hạn" },
    stats_proven_title: { ko: "숫자로 증명하는 VocaQuest 효과", en: "VocaQuest Impact Proven by Numbers", ja: "数字で証明するVocaQuestの効果", zh: "用数字证明 VocaQuest 的效果", tw: "用數字證明 VocaQuest 的效果", vi: "Hiệu quả của VocaQuest được chứng minh bằng con số" },
    active_users_label: { ko: "활성 사용자", en: "Active Users", ja: "アクティブユーザー", zh: "活跃用户", tw: "活躍用戶", vi: "Người dùng hoạt động" },
    success_rate_label: { ko: "목표 달성률", en: "Success Rate", ja: "目標達成率", zh: "目标达成率", tw: "目標達成率", vi: "Tỷ lệ đạt mục tiêu" },
    daily_lessons_label: { ko: "일일 학습량", en: "Daily Lessons", ja: "1日の学習量", zh: "每日学习量", tw: "每日學習量", vi: "Lượng học hàng ngày" },
    available_langs_label: { ko: "지원 언어", en: "Available Langs", ja: "対応言語", zh: "支持语言", tw: "支持語言", vi: "Ngôn ngữ hỗ trợ" },
    footer_mission: { ko: "AI 기술을 통해 누구나 쉽고 재미있게 영어를 마스터할 수 있는 세상을 만듭니다.", en: "Creating a world where anyone can master English easily and enjoyably through AI technology.", ja: "AI技術を通じて、誰もが簡単かつ楽しく英語をマスターできる世界を創ります。", zh: "通过 AI 技术，创造一个任何人都能轻松有趣地精通英语的世界。", tw: "通過 AI 技術，創造一個任何人都能輕鬆有趣地精通英語的世界。", vi: "Tạo ra một thế giới nơi bất kỳ ai cũng có thể thông thạo tiếng Anh một cách dễ dàng và thú vị thông qua công nghệ AI." },
    academy_label: { ko: "아카데미", en: "Academy", ja: "アカデミー", zh: "学院", tw: "學院", vi: "Học viện" },
    company_label: { ko: "회사", en: "Company", ja: "会社", zh: "公司", tw: "公司", vi: "Công ty" },
    support_label: { ko: "고객 지원", en: "Support", ja: "サポート", zh: "客户支持", tw: "客戶支持", vi: "Hỗ trợ khách hàng" },
    footer_copyright: { ko: "© 2026 Stepup Voca - VocaQuest. Powered by Advanced AI Technology.", en: "© 2026 Stepup Voca - VocaQuest. Powered by Advanced AI Technology.", ja: "© 2026 Stepup Voca - VocaQuest. Powered by Advanced AI Technology.", zh: "© 2026 Stepup Voca - VocaQuest. Powered by Advanced AI Technology.", tw: "© 2026 Stepup Voca - VocaQuest. Powered by Advanced AI Technology.", vi: "© 2026 Stepup Voca - VocaQuest. Powered by Advanced AI Technology." },
    learning_categories_title: { ko: "학습 카테고리", en: "Learning Categories", ja: "学習カテゴリー", zh: "学习类别", tw: "學習類別", vi: "Danh mục học tập" },
    learning_categories_desc: { ko: "언어 학습의 모든 영역을 망라하는 6가지 맞춤형 학습 모듈을 제공합니다.", en: "We offer 6 personalized learning modules covering all areas of language learning.", ja: "言語学習のすべての領域を網羅する6つのカスタマイズされた学習モジュールを提供します。", zh: "我们提供 6 个个性化学习模块，涵盖语言学习的所有领域。", tw: "我們提供 6 個個人化學習模組，涵蓋語言學習的所有領域。", vi: "Chúng tôi cung cấp 6 mô-đun học tập cá nhân hóa bao gồm tất cả các lĩnh vực học ngôn ngữ." },
    voca_bible_menu: { ko: "English Bible", en: "English Bible", ja: "英語バイブル", zh: "英语圣经", tw: "英語聖經", vi: "Kinh thánh tiếng Anh" },
    voca_bible_menu_desc: { ko: "성경 말씀을 통해 영어를 깊이 있게 학습하세요.", en: "Learn English deeply through Bible verses.", ja: "聖書の言葉を通じて英語を深く学びましょう。", zh: "通过圣经经文深入学习英语。", tw: "通過聖經經文深入學習英語。", vi: "Học tiếng Anh sâu sắc thông qua các câu Kinh thánh." },
    leaderboard_title: { ko: "Global Leaderboard", en: "Global Leaderboard", ja: "グローバルリーダーボード", zh: "全球排行榜", tw: "全球排行榜", vi: "Bảng xếp hạng toàn cầu" }
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
