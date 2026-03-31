export type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'tw' | 'vi';

export interface TranslationText {
    ko: string;
    en: string;
    ja: string;
    zh: string;
    tw: string;
    vi: string;
    [key: string]: string;
}

export const LEVEL_TEST_UI: Record<string, TranslationText> = {
    test_title: { ko: '영어 레벨 테스트', en: 'English Level Test', ja: '英語レベルテスト', zh: '英语水平测试', tw: '英語水平測試', vi: 'Kiểm tra trình độ tiếng Anh' },
    test_subtitle: { ko: '10분이면 충분해요! 나의 실력을 확인해보세요.', en: 'Only 10 minutes! Find out your true level.', ja: '10分で十分！自分の実力を確認しましょう。', zh: '只需10分钟！测试您的真实水平。', tw: '只需10分鐘！測試您的真實水平。', vi: 'Chỉ 10 phút! Kiểm tra trình độ thực sự của bạn.' },
    start_test: { ko: '테스트 시작하기', en: 'Start Test', ja: 'テスト開始', zh: '开始测试', tw: '開始測試', vi: 'Bắt đầu kiểm tra' },
    next: { ko: '다음', en: 'Next', ja: '次へ', zh: '下一步', tw: '下一步', vi: 'Tiếp theo' },
    confirm: { ko: '확인', en: 'Confirm', ja: '確認', zh: '确认', tw: '確認', vi: 'Xác nhận' },
    submit: { ko: '제출하기', en: 'Submit', ja: '提出する', zh: '提交', tw: '提交', vi: 'Nộp bài' },
    self_assessment_title: { ko: '현재 영어 실력은 어느 정도인가요?', en: 'How would you rate your current English level?', ja: '現在の英語力はどのくらいですか？', zh: '您认为自己的英语处于什么水平？', tw: '您認為自己的英語處於什麼水平？', vi: 'Trình độ tiếng Anh hiện tại của bạn như thế nào?' },
    vocab_title: { ko: '뜻을 아는 단어를 모두 고르세요', en: 'Select all words whose meaning you know', ja: '意味を知っている単語をすべて選んでください', zh: '选择所有您知道意思的单词', tw: '選擇所有您知道意思的單詞', vi: 'Chọn tất cả các từ mà bạn biết nghĩa' },
    vocab_quiz_title: { ko: '단어의 뜻을 고르세요', en: 'Choose the meaning of the word', ja: '単語の意味を選んでください', zh: '选择单词的意思', tw: '選擇單詞的意思', vi: 'Chọn nghĩa của từ' },
    grammar_title: { ko: '단어를 올바른 순서로 배열하세요', en: 'Arrange the words in the correct order', ja: '単語を正しい順序に並べてください', zh: '将单词排列成正确的顺序', tw: '將單詞排列成正確的順序', vi: 'Sắp xếp các từ theo đúng thứ tự' },
    grammar_hint: { ko: '단어를 터치하면 문장이 완성됩니다.', en: 'Tap words to build the sentence', ja: '単語をタップして文章を完成させます', zh: '点击单词来组成句子', tw: '點擊單詞來組成句子', vi: 'Nhấn vào từ để tạo câu' },
    reading_title: { ko: '지문을 읽고 질문에 답하세요', en: 'Read the passage and answer the questions', ja: '文章を読んで質問に答えてください', zh: '阅读文章并回答问题', tw: '閱讀文章並回答問題', vi: 'Đọc đoạn văn và trả lời câu hỏi' },
    result_title: { ko: '나의 영어 레벨 리포트', en: 'My English Level Report', ja: '私の英語レベルレポート', zh: '我的英语水平报告', tw: '我的英語水平報告', vi: 'Báo cáo trình độ tiếng Anh của tôi' },
    result_vocab: { ko: '어휘', en: 'Vocabulary', ja: '語彙', zh: '词汇', tw: '詞彙', vi: 'Từ vựng' },
    result_grammar: { ko: '문법', en: 'Grammar', ja: '文法', zh: '语法', tw: '語法', vi: 'Ngữ pháp' },
    result_reading: { ko: '독해', en: 'Reading', ja: '読解', zh: '阅读', tw: '閱讀', vi: 'Đọc hiểu' },
    result_overall: { ko: '종합 점수', en: 'Overall Score', ja: '総合スコア', zh: '综合分数', tw: '綜合分數', vi: 'Điểm tổng hợp' },
    go_home: { ko: '홈으로 이동', en: 'Go to Home', ja: 'ホームへ', zh: '返回首页', tw: '返回首頁', vi: 'Về trang chủ' },
    step_self: { ko: '사전 설문', en: 'Self Check', ja: '事前質問', zh: '自我评估', tw: '自我評估', vi: 'Tự đánh giá' },
    step_vocab: { ko: '어휘', en: 'Vocab', ja: '語彙', zh: '词汇', tw: '詞彙', vi: 'Từ vựng' },
    step_grammar: { ko: '문법', en: 'Grammar', ja: '文法', zh: '语法', tw: '語法', vi: 'Ngữ pháp' },
    step_reading: { ko: '독해', en: 'Reading', ja: '読解', zh: '阅读', tw: '閱讀', vi: 'Đọc hiểu' },
    tap_to_remove: { ko: '다시 터치하면 취소됩니다', en: 'Tap again to remove', ja: 'もう一度タップすると取り消されます', zh: '再次点击取消', tw: '再次點擊取消', vi: 'Nhấn lại để xóa' },
    recommended_level: { ko: '추천 시작 레벨', en: 'Recommended Start Level', ja: 'おすすめの開始レベル', zh: '推荐开始级别', tw: '推薦開始級別', vi: 'Cấp độ bắt đầu đề xuất' },
    start_learning: { ko: '학습 시작하기', en: 'Start Learning', ja: '学習を開始する', zh: '开始学习', tw: '開始學習', vi: 'Bắt đầu học' },
    vocab_level_basic: { ko: '초급 단어', en: 'Basic Words', ja: '初級単語', zh: '初级单词', tw: '初級單詞', vi: 'Từ cơ bản' },
    vocab_level_inter: { ko: '중급 단어', en: 'Intermediate Words', ja: '中級単語', zh: '中级单词', tw: '中級單詞', vi: 'Từ trung cấp' },
    vocab_level_adv: { ko: '고급 단어', en: 'Advanced Words', ja: '高級単語', zh: '高级单词', tw: '高級單詞', vi: 'Từ nâng cao' },
    vocab_know_all: { ko: '다 알아요!', en: 'Know all!', ja: '全部わかる！', zh: '全都知道！', tw: '全都知道！', vi: 'Biết hết!' },
    vocab_know_none: { ko: '모르겠어요', en: 'Don\'t know any', ja: 'わからない', zh: '不知道', tw: '不知道', vi: 'Không biết' },
};

export interface SelfAssessmentOption {
    id: string; emoji: string; label: TranslationText; desc: TranslationText; targetLevel: string;
}

export const SELF_ASSESSMENT_OPTIONS: SelfAssessmentOption[] = [
    { id: 'beginner', emoji: '🌱', label: { ko: '완전 초보', en: 'Total Beginner', ja: '完全な初心者', zh: '完全新手', tw: '完全新手', vi: 'Hoàn toàn mới bắt đầu' }, desc: { ko: 'ABC부터 시작해요', en: 'Starting from ABC', ja: 'ABCから始めます', zh: '从ABC开始', tw: '從ABC開始', vi: 'Bắt đầu từ ABC' }, targetLevel: 'A1' },
    { id: 'elementary', emoji: '🚶', label: { ko: '기초 수준', en: 'Elementary', ja: '初級レベル', zh: '基础水平', tw: '基礎水平', vi: 'Cơ bản' }, desc: { ko: '간단한 단어를 알아요', en: 'I know simple words', ja: '簡単な単語を知っています', zh: '我认识简单的单词', tw: '我認識簡單的單詞', vi: 'Tôi biết một số từ đơn giản' }, targetLevel: 'A2' },
    { id: 'intermediate', emoji: '🏃', label: { ko: '중급 수준', en: 'Intermediate', ja: '中級レベル', zh: '中级水平', tw: '中級水平', vi: 'Trung cấp' }, desc: { ko: '일상 대화가 가능해요', en: 'I can have daily conversations', ja: '日常会話ができます', zh: '我能进行日常交流', tw: '我能進行日常交流', vi: 'Tôi có thể giao tiếp hàng ngày' }, targetLevel: 'B1' },
    { id: 'upper', emoji: '🚀', label: { ko: '상급 수준', en: 'Upper Intermediate', ja: '上級レベル', zh: '中高阶水平', tw: '中高階水平', vi: 'Trên trung cấp' }, desc: { ko: '복잡한 주제를 이야기해요', en: 'I discuss complex topics', ja: '複雑なテーマを話せます', zh: '我能讨论复杂话题', tw: '我能討論複雜話題', vi: 'Tôi thảo luận các chủ đề phức tạp' }, targetLevel: 'B2' },
    { id: 'advanced', emoji: '👑', label: { ko: '고급 수준', en: 'Advanced', ja: '高級レベル', zh: '高级水平', tw: '高級水平', vi: 'Nâng cao' }, desc: { ko: '원어민에 가까운 수준이에요', en: 'Near-native proficiency', ja: 'ネイティブに近いレベルです', zh: '接近母语水平', tw: '接近母語水平', vi: 'Gần với trình độ người bản ngữ' }, targetLevel: 'C1' },
];

export interface VocabChipPage {
    level: string; levelEmoji: string; labelKey: string; words: string[];
}
export const VOCAB_CHIP_PAGES: VocabChipPage[] = [
    { level: 'A1-A2', levelEmoji: '🌱', labelKey: 'vocab_level_basic', words: ['apple', 'run', 'happy', 'water', 'friend', 'school', 'book', 'home', 'work', 'time', 'food', 'sleep', 'music', 'family', 'speak'] },
    { level: 'B1-B2', levelEmoji: '🚀', labelKey: 'vocab_level_inter', words: ['economy', 'achieve', 'opportunity', 'challenge', 'environment', 'innovative', 'analyze', 'negotiate', 'perspective', 'collaborate', 'sustainable', 'influence', 'evaluate', 'significant', 'establish'] },
    { level: 'C1+', levelEmoji: '👑', labelKey: 'vocab_level_adv', words: ['ephemeral', 'resilient', 'ambiguous', 'mitigate', 'exacerbate', 'ubiquitous', 'paradigm', 'pragmatic', 'eloquent', 'tenacious', 'inexorable', 'sycophant', 'obfuscate', 'perfidious', 'sagacious'] },
];

export const VOCAB_CHIP_WORDS = VOCAB_CHIP_PAGES.flatMap(p => p.words);

export interface VocabQuestion {
    id: string; word: string; options: TranslationText[]; answerIndex: number;
}
export const VOCAB_QUESTION_BANKS: Record<'a2' | 'b1' | 'b2' | 'c1', VocabQuestion[]> = {
    a2: [
        { id: 'va2_1', word: 'Happy', answerIndex: 2, options: [{ ko: '피곤한', en: 'Tired', ja: '疲れた', zh: '疲惫的', tw: '疲憊的', vi: 'Mệt mỏi' }, { ko: '슬픈', en: 'Sad', ja: '悲しい', zh: '悲伤的', tw: '悲傷的', vi: 'Buồn bã' }, { ko: '행복한', en: 'Joyful/Pleased', ja: '幸せな', zh: '高兴的', tw: '高興的', vi: 'Vui vẻ' }, { ko: '화난', en: 'Angry', ja: '怒った', zh: '愤怒的', tw: '憤怒的', vi: 'Tức giận' }] },
        { id: 'va2_2', word: 'Book', answerIndex: 0, options: [{ ko: '읽는 것', en: 'Something you read', ja: '読むもの', zh: '读的东西', tw: '讀的東西', vi: 'Thứ để đọc' }, { ko: '요리 도구', en: 'A cooking tool', ja: '調理器具', zh: '烹饪工具', tw: '烹飪工具', vi: 'Dụng cụ nấu ăn' }, { ko: '의류', en: 'A type of clothing', ja: '衣類', zh: '服装', tw: '服裝', vi: 'Quần áo' }, { ko: '악기', en: 'A musical instrument', ja: '楽器', zh: '乐器', tw: '樂器', vi: 'Nhạc cụ' }] },
        { id: 'va2_3', word: 'Food', answerIndex: 1, options: [{ ko: '잠자는 곳', en: 'A place to sleep', ja: '寝る場所', zh: '睡觉的地方', tw: '睡覺的地方', vi: 'Nơi để ngủ' }, { ko: '먹는 것', en: 'Something you eat', ja: '食べるもの', zh: '吃的东西', tw: '吃的東西', vi: 'Thứ để ăn' }, { ko: '이동 수단', en: 'A way to travel', ja: '移動手段', zh: '交通方式', tw: '交通方式', vi: 'Phương tiện di chuyển' }, { ko: '운동', en: 'A sport', ja: 'スポーツ', zh: '运动', tw: '運動', vi: 'Thể thao' }] },
        { id: 'va2_4', word: 'Water', answerIndex: 2, options: [{ ko: '먹는 음식', en: 'Food to eat', ja: '食べ物', zh: '食物', tw: '食物', vi: 'Thức ăn' }, { ko: '숨쉬는 공기', en: 'Air to breathe', ja: '呼吸する空気', zh: '呼吸的空气', tw: '呼吸的空氣', vi: 'Không khí để thở' }, { ko: '마시는 액체', en: 'A liquid you drink', ja: '飲む液体', zh: '喝的液体', tw: '喝的液體', vi: 'Chất lỏng để uống' }, { ko: '딱딱한 돌', en: 'A hard stone', ja: '硬い石', zh: '坚硬的石头', tw: '堅硬的石頭', vi: 'Hòn đá cứng' }] },
        { id: 'va2_5', word: 'Music', answerIndex: 0, options: [{ ko: '소리와 멜로디', en: 'Sounds arranged in rhythm', ja: '音とメロディ', zh: '声音和旋律', tw: '聲音和旋律', vi: 'Âm thanh và giai điệu' }, { ko: '종이와 펜', en: 'Paper and pen', ja: '紙とペン', zh: '纸和笔', tw: '紙和筆', vi: 'Giấy và bút' }, { ko: '따뜻한 옷', en: 'Warm clothes', ja: '暖かい服', zh: '保暖的衣服', tw: '保暖的衣服', vi: 'Quần áo ấm' }, { ko: '아름다운 집', en: 'A beautiful house', ja: '美しい家', zh: '美丽的大厦', tw: '美麗的大廈', vi: 'Một ngôi nhà đẹp' }] }
    ],
    b1: [
        { id: 'vb1_1', word: 'Opportunity', answerIndex: 0, options: [{ ko: '기회', en: 'A favorable chance', ja: '有利なチャンス', zh: '机会', tw: '機會', vi: 'Cơ hội thuận lợi' }, { ko: '문제', en: 'A type of problem', ja: '問題の一種', zh: '问题', tw: '問題', vi: 'Loại vấn đề' }, { ko: '처벌', en: 'A kind of punishment', ja: '罰の一種', zh: '惩罚', tw: '懲罰', vi: 'Hình phạt' }, { ko: '위험', en: 'A form of danger', ja: '危険の一形態', zh: '危险', tw: '危險', vi: 'Mối nguy hiểm' }] },
        { id: 'vb1_2', word: 'Achieve', answerIndex: 1, options: [{ ko: '포기하다', en: 'To give up', ja: 'あきらめる', zh: '放弃', tw: '放棄', vi: 'Từ bỏ' }, { ko: '목표를 달성하다', en: 'To reach a goal', ja: '目標を達成する', zh: '实现目标', tw: '實現目標', vi: 'Đạt được mục tiêu' }, { ko: '실수를 반복하다', en: 'To repeat a mistake', ja: 'ミスを繰り返す', zh: '重复错误', tw: '重複錯誤', vi: 'Lặp lại lỗi' }, { ko: '무시하다', en: 'To ignore a task', ja: '無視する', zh: '忽视', tw: '忽視', vi: 'Bỏ qua' }] },
        { id: 'vb1_3', word: 'Challenge', answerIndex: 2, options: [{ ko: '쉬운 과제', en: 'An easy task', ja: '簡単な課題', zh: '轻松任务', tw: '輕鬆任務', vi: 'Nhiệm vụ dễ' }, { ko: '단순한 보상', en: 'A simple reward', ja: '簡単な報酬', zh: '简单奖励', tw: '簡單獎勵', vi: 'Phần thưởng đơn giản' }, { ko: '도전', en: 'A difficult task testing ability', ja: '能力を試す難題', zh: '挑战', tw: '挑戰', vi: 'Thử thách khó' }, { ko: '편안한 상황', en: 'A comfortable situation', ja: '快適な状況', zh: '舒适情况', tw: '舒適情況', vi: 'Tình huống thoải mái' }] },
        { id: 'vb1_4', word: 'Environment', answerIndex: 3, options: [{ ko: '음식 유형', en: 'A type of food', ja: '食べ物の種類', zh: '食物类型', tw: '食物類型', vi: 'Loại thực phẩm' }, { ko: '정부 형태', en: 'A form of government', ja: '政府の形態', zh: '政府形式', tw: '政府形式', vi: 'Hình thức chính phủ' }, { ko: '의류 스타일', en: 'A style of clothing', ja: '服のスタイル', zh: '服装风格', tw: '服裝風格', vi: 'Phong cách trang phục' }, { ko: '자연 환경', en: 'The natural world around us', ja: '自然界', zh: '自然环境', tw: '自然環境', vi: 'Môi trường tự nhiên' }] },
        { id: 'vb1_5', word: 'Evaluate', answerIndex: 2, options: [{ ko: '무작위로 고르다', en: 'To pick randomly', ja: '無作為に選ぶ', zh: '随机挑选', tw: '隨機挑選', vi: 'Chọn ngẫu nhiên' }, { ko: '바로 잊어버리다', en: 'To forget instantly', ja: 'すぐに忘れる', zh: '立刻忘记', tw: '立刻忘記', vi: 'Quên ngay lập tức' }, { ko: '신중히 평가하다', en: 'To assess carefully', ja: '慎重に評価する', zh: '认真评估', tw: '認真評估', vi: 'Đánh giá cẩn thận' }, { ko: '남을 오해하다', en: 'To misunderstand someone', ja: '他人を誤解する', zh: '误解别人', tw: '誤解別人', vi: 'Hiểu lầm người khác' }] }
    ],
    b2: [
        { id: 'vb2_1', word: 'Collaborate', answerIndex: 2, options: [{ ko: '경쟁하다', en: 'To compete fiercely', ja: '激しく競争する', zh: '激烈竞争', tw: '激烈競爭', vi: 'Cạnh tranh gay gắt' }, { ko: '혼자 작업하다', en: 'To work alone secretly', ja: '一人で秘密裏に作業', zh: '独自秘密工作', tw: '獨自秘密工作', vi: 'Làm việc một mình bí mật' }, { ko: '협력하다', en: 'To work together', ja: '他者と協力する', zh: '协作', tw: '協作', vi: 'Cộng tác' }, { ko: '반대하다', en: 'To disagree', ja: 'チームに反対する', zh: '反对', tw: '反對', vi: 'Phản đối' }] },
        { id: 'vb2_2', word: 'Perspective', answerIndex: 1, options: [{ ko: '기억 상실 유형', en: 'A memory loss type', ja: '記憶喪失の一種', zh: '记忆丧失类型', tw: '記憶喪失類型', vi: 'Loại mất trí nhớ' }, { ko: '관점이나 시각', en: 'A point of view', ja: '特定の観点', zh: '观点', tw: '觀點', vi: 'Quan điểm' }, { ko: '신체적 질병', en: 'A physical illness', ja: '身体的病気', zh: '身体疾病', tw: '身體疾病', vi: 'Bệnh lý thể chất' }, { ko: '오락의 형태', en: 'A form of entertainment', ja: '娯楽の形態', zh: '娱乐形式', tw: '娛樂形式', vi: 'Hình thức giải trí' }] },
        { id: 'vb2_3', word: 'Sustainable', answerIndex: 0, options: [{ ko: '지속 가능한', en: 'Able to continue long-term', ja: '持続可能な', zh: '可持续的', tw: '可持續的', vi: 'Có thể duy trì' }, { ko: '빠르게 소멸되는', en: 'Quickly destroyed', ja: 'すぐに破壊される', zh: '迅速被摧毁', tw: '迅速被摧毀', vi: 'Bị phá hủy nhanh chóng' }, { ko: '단기적으로 유익한', en: 'Beneficial short-term', ja: '短期的に有益な', zh: '短期有益', tw: '短期有益', vi: 'Có lợi ngắn hạn' }, { ko: '계속 불가능한', en: 'Impossible to continue', ja: '継続不可能な', zh: '无法持续', tw: '無法持續', vi: 'Không thể tiếp tục' }] },
        { id: 'vb2_4', word: 'Significant', answerIndex: 3, options: [{ ko: '가벼운', en: 'Light weight', ja: '軽い', zh: '轻量的', tw: '輕量的', vi: 'Trọng lượng nhẹ' }, { ko: '전혀 관련 없는', en: 'Completely irrelevant', ja: '全く関係ない', zh: '毫不相关', tw: '毫不相關', vi: 'Hoàn toàn không liên quan' }, { ko: '무의미한', en: 'Meaningless', ja: '無意味な', zh: '无意义', tw: '無意義', vi: 'Vô nghĩa' }, { ko: '상당한, 중요한', en: 'Important and substantial', ja: '重要でかなりの', zh: '重大且重要的', tw: '重大且重要的', vi: 'Quan trọng và đáng kể' }] },
        { id: 'vb2_5', word: 'Negotiate', answerIndex: 0, options: [{ ko: '협상하다', en: 'To discuss for agreement', ja: '交渉する', zh: '谈判', tw: '談判', vi: 'Đàm phán' }, { ko: '지시를 내리다', en: 'To give orders', ja: '命令する', zh: '下达命令', tw: '下達命令', vi: 'Ra lệnh' }, { ko: '조용히 수긍하다', en: 'To silently accept', ja: '黙って受け入れる', zh: '默默接受', tw: '默默接受', vi: 'Chấp nhận trong im lặng' }, { ko: '자리를 피하다', en: 'To leave the place', ja: '席を外す', zh: '离开座位', tw: '離開座位', vi: 'Rời khỏi chỗ ngồi' }] }
    ],
    c1: [
        { id: 'vc1_1', word: 'Ephemeral', answerIndex: 0, options: [{ ko: '일시적인', en: 'Lasting only a short time', ja: '一時的な', zh: '短暂的', tw: '短暫的', vi: 'Chỉ tồn tại thời gian ngắn' }, { ko: '극도로 거대한', en: 'Extremely large', ja: '非常に大きい', zh: '巨大的', tw: '巨大的', vi: 'Cực kỳ lớn' }, { ko: '영구 고정된', en: 'Permanently fixed', ja: '永久に固定された', zh: '永久固定', tw: '永久固定', vi: 'Cố định vĩnh viễn' }, { ko: '매우 시끄러운', en: 'Extremely loud', ja: '非常に騒がしい', zh: '异常喧哗', tw: '異常喧嘩', vi: 'Rất ồn ào' }] },
        { id: 'vc1_2', word: 'Resilient', answerIndex: 2, options: [{ ko: '쉽게 무너지는', en: 'Easily broken', ja: '壊れやすい', zh: '脆弱的', tw: '脆弱的', vi: 'Dễ vỡ' }, { ko: '완전히 경직된', en: 'Completely rigid', ja: '完全に硬直した', zh: '完全僵化', tw: '完全僵化', vi: 'Hoàn toàn cứng nhắc' }, { ko: '회복력이 강한', en: 'Quick to recover', ja: '回復力が強い', zh: '有弹性的', tw: '有彈性的', vi: 'Có khả năng phục hồi' }, { ko: '감정이 메마른', en: 'Emotionally dry', ja: '感情に乏しい', zh: '冷酷无情', tw: '冷酷無情', vi: 'Lạnh lùng, ráo hoảnh' }] },
        { id: 'vc1_3', word: 'Ambiguous', answerIndex: 1, options: [{ ko: '명백한', en: 'Absolutely clear', ja: '明白な', zh: '绝对清楚', tw: '絕對清楚', vi: 'Hoàn toàn rõ ràng' }, { ko: '모호한', en: 'Open to interpretation', ja: '曖昧な', zh: '模棱两可的', tw: '模稜兩可的', vi: 'Mơ hồ, nhiều nghĩa' }, { ko: '오류가 없는', en: 'Error-free', ja: 'エラーのない', zh: '没有错误的', tw: '沒有錯誤的', vi: 'Không có lỗi' }, { ko: '극도로 방대한', en: 'Extremely extensive', ja: '非常に膨大な', zh: '异常庞大的', tw: '異常龐大的', vi: 'Cực kỳ rộng lớn' }] },
        { id: 'vc1_4', word: 'Pragmatic', answerIndex: 0, options: [{ ko: '실용적인', en: 'Dealing with things practically', ja: '実用的な', zh: '务实的', tw: '務實的', vi: 'Thực tế' }, { ko: '이론적인', en: 'Focused purely on theory', ja: '理論的な', zh: '纯理论的', tw: '純理論的', vi: 'Tập trung vào lý thuyết' }, { ko: '비현실적인', en: 'Completely impractical', ja: '非現実的な', zh: '不切实际的', tw: '不切實際的', vi: 'Không thực tế' }, { ko: '감정적인', en: 'Based on emotion', ja: '感情的な', zh: '感性的', tw: '感性的', vi: 'Dựa trên cảm xúc' }] },
        { id: 'vc1_5', word: 'Tenacious', answerIndex: 3, options: [{ ko: '금방 포기하는', en: 'Giving up quickly', ja: 'すぐにあきらめる', zh: '容易放弃的', tw: '容易放棄的', vi: 'Dễ bỏ cuộc' }, { ko: '변덕스러운', en: 'Constantly changing mind', ja: '気まぐれな', zh: '善变的', tw: '善變的', vi: 'Hay thay đổi' }, { ko: '부드러운', en: 'Very gentle', ja: '優しい', zh: '非常温柔的', tw: '非常溫柔的', vi: 'Rất nhẹ nhàng' }, { ko: '끈질긴, 완강한', en: 'Determined, not giving up', ja: '粘り強い', zh: '坚韧不拔的', tw: '堅韌不拔的', vi: 'Kiên định' }] }
    ]
};

export interface GrammarQuestion {
    id: string; level: string; baseSentence: TranslationText; englishWords: string[]; correctOrder: string[];
}
export const GRAMMAR_QUESTION_BANKS: Record<'a2' | 'b1' | 'b2' | 'c1', GrammarQuestion[]> = {
    a2: [
        { id: 'ga2_1', level: 'A2', baseSentence: { ko: '나는 어제 해변에 갔다.', en: 'I went to the beach yesterday.', ja: '私は昨日ビーチに行った。', zh: '我昨天去了海滩。', tw: '我昨天去了海灘。', vi: 'Tôi đã đến bãi biển hôm qua.' }, englishWords: ['beach', 'I', 'the', 'yesterday', 'went', 'to'], correctOrder: ['I', 'went', 'to', 'the', 'beach', 'yesterday'] },
        { id: 'ga2_2', level: 'A2', baseSentence: { ko: '그녀는 도서관에서 책을 읽고 있다.', en: 'She is reading a book in the library.', ja: '彼女は図書館で本を読んでいる。', zh: '她正在图书馆读书。', tw: '她正在圖書館讀書。', vi: 'Cô ấy đang đọc sách trong thư viện.' }, englishWords: ['She', 'a', 'reading', 'library', 'is', 'in', 'book', 'the'], correctOrder: ['She', 'is', 'reading', 'a', 'book', 'in', 'the', 'library'] },
        { id: 'ga2_3', level: 'A2', baseSentence: { ko: '우리는 주말에 축구를 한다.', en: 'We play soccer on weekends.', ja: '私たちは週末にサッカーをする。', zh: '我们周末踢足球。', tw: '我們週末踢足球。', vi: 'Chúng tôi chơi bóng đá vào cuối tuần.' }, englishWords: ['We', 'soccer', 'on', 'play', 'weekends'], correctOrder: ['We', 'play', 'soccer', 'on', 'weekends'] },
        { id: 'ga2_4', level: 'A2', baseSentence: { ko: '그는 언제나 아침을 먹는다.', en: 'He always eats breakfast.', ja: '彼はいつも朝食をとる。', zh: '他总吃早饭。', tw: '他總吃早飯。', vi: 'Anh ấy luôn ăn sáng.' }, englishWords: ['He', 'breakfast', 'eats', 'always'], correctOrder: ['He', 'always', 'eats', 'breakfast'] }
    ],
    b1: [
        { id: 'gb1_1', level: 'B1', baseSentence: { ko: '그녀는 매일 아침 커피를 마신다.', en: 'She drinks coffee every morning.', ja: '彼女は毎朝コーヒーを飲む。', zh: '她每天早上喝咖啡。', tw: '她每天早上喝咖啡。', vi: 'Cô ấy uống cà phê mỗi sáng.' }, englishWords: ['morning', 'She', 'every', 'coffee', 'drinks'], correctOrder: ['She', 'drinks', 'coffee', 'every', 'morning'] },
        { id: 'gb1_2', level: 'B1', baseSentence: { ko: '그는 5년 동안 여기서 일해왔다.', en: 'He has been working here for five years.', ja: '彼は5年間ここで働いてきた。', zh: '他在这里工作了五年。', tw: '他在這裡工作了五年。', vi: 'Anh ấy đã làm việc ở đây được năm năm.' }, englishWords: ['He', 'years', 'has', 'five', 'working', 'been', 'for', 'here'], correctOrder: ['He', 'has', 'been', 'working', 'here', 'for', 'five', 'years'] },
        { id: 'gb1_3', level: 'B1', baseSentence: { ko: '내가 도착했을 때 그들은 TV를 보고 있었다.', en: 'They were watching TV when I arrived.', ja: '私が到着したとき、彼らはテレビを見ていた。', zh: '我到的时候他们正在看电视。', tw: '我到的時候他們正在看電視。', vi: 'Họ đang xem TV khi tôi đến.' }, englishWords: ['They', 'when', 'watching', 'were', 'I', 'arrived', 'TV'], correctOrder: ['They', 'were', 'watching', 'TV', 'when', 'I', 'arrived'] },
        { id: 'gb1_4', level: 'B1', baseSentence: { ko: '그가 집에 오면 저녁을 먹을 것이다.', en: 'When he comes home, we will have dinner.', ja: '彼が家に帰ったら夕食をとる。', zh: '当他回家后我们吃晚饭。', tw: '當他回家後我們吃晚飯。', vi: 'Khi anh ấy về, chúng ta sẽ ăn tối.' }, englishWords: ['When', 'he', 'will', 'we', 'have', 'home', 'comes', 'dinner'], correctOrder: ['When', 'he', 'comes', 'home,', 'we', 'will', 'have', 'dinner'] }
    ],
    b2: [
        { id: 'gb2_1', level: 'B2', baseSentence: { ko: '만약 내가 더 열심히 공부했다면, 시험에 합격했을 것이다.', en: 'If I had studied harder, I would have passed the exam.', ja: 'もっと勉強していれば試験に合格しただろう。', zh: '如果我更努力学习，我就会通过考试。', tw: '如果我更努力學習，我就會通過考試。', vi: 'Nếu tôi học chăm chỉ hơn, tôi đã đỗ kỳ thi.' }, englishWords: ['I', 'harder', 'passed', 'If', 'have', 'had', 'studied', 'would', 'the', 'exam', 'I'], correctOrder: ['If', 'I', 'had', 'studied', 'harder,', 'I', 'would', 'have', 'passed', 'the', 'exam'] },
        { id: 'gb2_2', level: 'B2', baseSentence: { ko: '보고서는 지난주에 연구팀에 의해 작성되었다.', en: 'The report was written by the research team last week.', ja: '報告書は先週、研究チームによって書かれた。', zh: '报告是上周由研究团队撰写的。', tw: '報告是上週由研究團隊撰寫的。', vi: 'Báo cáo được viết bởi nhóm nghiên cứu tuần trước.' }, englishWords: ['The', 'was', 'research', 'last', 'the', 'report', 'week', 'team', 'written', 'by'], correctOrder: ['The', 'report', 'was', 'written', 'by', 'the', 'research', 'team', 'last', 'week'] },
        { id: 'gb2_3', level: 'B2', baseSentence: { ko: '그녀는 세계를 여행할 수 있으면 좋겠다고 바란다.', en: 'She wishes she could travel around the world.', ja: '彼女は世界を旅できたらいいと願っている。', zh: '她希望能环游世界。', tw: '她希望能環遊世界。', vi: 'Cô ấy ước mình có thể đi du lịch vòng quanh thế giới.' }, englishWords: ['She', 'travel', 'the', 'could', 'world', 'she', 'around', 'wishes'], correctOrder: ['She', 'wishes', 'she', 'could', 'travel', 'around', 'the', 'world'] }
    ],
    c1: [
        { id: 'gc1_1', level: 'C1', baseSentence: { ko: '그가 방에 들어왔을 때 논의되고 있던 주제는 기후 변화였다.', en: 'The topic that was being discussed when he entered the room was climate change.', ja: '彼が部屋に入ってきたときに議論されていたトピックは気候変動だった。', zh: '当他进入房间时正在讨论的话题是气候变化。', tw: '當他進入房間時正在討論的話題是氣候變化。', vi: 'Chủ đề đang được thảo luận khi anh ấy bước vào phòng là biến đổi khí hậu.' }, englishWords: ['was', 'The', 'being', 'when', 'topic', 'was', 'that', 'discussed', 'entered', 'he', 'the', 'room', 'climate', 'change'], correctOrder: ['The', 'topic', 'that', 'was', 'being', 'discussed', 'when', 'he', 'entered', 'the', 'room', 'was', 'climate', 'change'] },
        { id: 'gc1_2', level: 'C1', baseSentence: { ko: '그녀가 그 문제에 대해 알았더라면, 다르게 행동했을 것이다.', en: 'Had she known about the problem, she would have acted differently.', ja: '彼女が問題を知っていれば、違う行動をしていただろう。', zh: '如果她知道这个问题，她会采取不同的行动。', tw: '如果她知道這個問題，她會採取不同的行動。', vi: 'Nếu cô ấy biết về vấn đề đó, cô ấy đã hành động khác đi.' }, englishWords: ['Had', 'differently', 'the', 'she', 'known', 'have', 'would', 'problem', 'acted', 'she', 'about'], correctOrder: ['Had', 'she', 'known', 'about', 'the', 'problem,', 'she', 'would', 'have', 'acted', 'differently'] },
        { id: 'gc1_3', level: 'C1', baseSentence: { ko: '그가 은퇴하고 나서야 비로소 우정의 진정한 가치를 깨달았다.', en: 'It was not until he retired that he realized the true value of friendship.', ja: '退職して初めて、彼は友情の真の価値に気づいた。', zh: '直到退休，他才意识到友谊的真正价值。', tw: '直到退休，他才意識到友誼的真正價值。', vi: 'Mãi đến khi nghỉ hưu, anh ấy mới nhận ra giá trị thật sự của tình bạn.' }, englishWords: ['It', 'he', 'not', 'realized', 'value', 'retired', 'was', 'he', 'friendship', 'until', 'of', 'true', 'that', 'the'], correctOrder: ['It', 'was', 'not', 'until', 'he', 'retired', 'that', 'he', 'realized', 'the', 'true', 'value', 'of', 'friendship'] }
    ],
};

export interface ReadingQuestion {
    id: string; question: TranslationText; options: TranslationText[]; answerIndex: number;
}
export interface ReadingPassage {
    id: string; title: string; passage: string; questions: ReadingQuestion[]; level: string;
}

export const READING_PASSAGES_BANKS: Record<'easy' | 'medium' | 'hard', ReadingPassage[]> = {
    easy: [
        {
            id: 'r1_easy', level: 'A2', title: 'THE OCEAN 🌊',
            passage: "The ocean covers more than 70% of Earth's surface. It is home to millions of species, from tiny plankton to the enormous blue whale. The ocean also plays a vital role in regulating the Earth's climate by absorbing heat from the sun and distributing it around the globe. However, human activities such as pollution and overfishing are threatening marine ecosystems.",
            questions: [
                { id: 're_q1', answerIndex: 1, question: { ko: '지구 표면에서 바다가 차지하는 비율은?', en: "What percentage of Earth's surface does the ocean cover?", ja: '海が地球の表面を占める割合は？', zh: '海洋覆盖地球表面的比例是多少？', tw: '海洋覆蓋地球表面的比例是多少？', vi: 'Đại dương chiếm bao nhiêu phần trăm bề mặt Trái Đất?' }, options: [{ ko: '50% 이상', en: 'More than 50%', ja: '50%以上', zh: '超过50%', tw: '超過50%', vi: 'Hơn 50%' }, { ko: '70% 이상', en: 'More than 70%', ja: '70%以上', zh: '超过70%', tw: '超過70%', vi: 'Hơn 70%' }, { ko: '90% 이상', en: 'More than 90%', ja: '90%以上', zh: '超过90%', tw: '超過90%', vi: 'Hơn 90%' }, { ko: '60% 이상', en: 'More than 60%', ja: '60%以上', zh: '超过60%', tw: '超過60%', vi: 'Hơn 60%' }] },
                { id: 're_q1_2', answerIndex: 1, question: { ko: '바다가 하는 중요한 역할은 무엇입니까?', en: "What is a vital role the ocean plays?", ja: '海が果たす重要な役割は何ですか？', zh: '海洋发挥的重要作用是什么？', tw: '海洋發揮的重要作用是什麼？', vi: 'Đại dương đóng vai trò quan trọng nào?' }, options: [{ ko: '태양빛을 반사한다', en: 'Reflecting sunlight', ja: '太陽光を反射する', zh: '反射阳光', tw: '反射陽光', vi: 'Phản xạ ánh sáng mặt trời' }, { ko: '기후를 조절한다', en: 'Regulating the climate', ja: '気候を調節する', zh: '调节气候', tw: '調節氣候', vi: 'Điều hòa khí hậu' }, { ko: '빙하를 만든다', en: 'Creating glaciers', ja: '氷河を作る', zh: '制造冰川', tw: '製造冰川', vi: 'Tạo ra sông băng' }, { ko: '오염을 정화한다', en: 'Purifying pollution', ja: '汚染を浄化する', zh: '净化污染', tw: '淨化污染', vi: 'Thanh lọc ô nhiễm' }] }
            ]
        },
        {
            id: 'r2_easy', level: 'A2', title: 'MORNING HABITS ☀️',
            passage: 'Many successful people have a strict morning routine. They wake up early, drink water, and exercise before starting work. Reading a book or meditating can also help to focus the mind. Eating a healthy breakfast gives you energy for the entire day. A good morning habit makes a very productive day.',
            questions: [
                { id: 're_q2', answerIndex: 0, question: { ko: '성공한 사람들의 아침 루틴에 없는 것은?', en: 'What is NOT part of the morning routine mentioned?', ja: '言及された朝の習慣に含まれないものは？', zh: '未提及的早晨习惯是什么？', tw: '未提及的早晨習慣是什麼？', vi: 'Thói quen buổi sáng nào KHÔNG được đề cập?' }, options: [{ ko: '게임하기', en: 'Playing games', ja: 'ゲームをする', zh: '玩游戏', tw: '玩遊戲', vi: 'Chơi game' }, { ko: '물 마시기', en: 'Drinking water', ja: '水を飲む', zh: '喝水', tw: '喝水', vi: 'Uống nước' }, { ko: '운동하기', en: 'Exercising', ja: '運動する', zh: '运动', tw: '運動', vi: 'Tập thể dục' }, { ko: '독서학습', en: 'Reading a book', ja: '本を読む', zh: '读书', tw: '讀書', vi: 'Đọc sách' }] },
                { id: 're_q2_2', answerIndex: 2, question: { ko: '건강한 아침 식사의 주된 역할은 무엇입니까?', en: 'What is the main role of a healthy breakfast?', ja: '健康的な朝食の主な役割は何ですか？', zh: '健康早餐的主要作用是什么？', tw: '健康早餐的主要作用是什麼？', vi: 'Vai trò chính của một bữa sáng lành mạnh là gì?' }, options: [{ ko: '긴장을 풀어준다', en: 'Relaxes the body', ja: '緊張をほぐす', zh: '放松身体', tw: '放鬆身體', vi: 'Thư giãn cơ thể' }, { ko: '집중력을 높인다', en: 'Helps focus the mind', ja: '集中力を高める', zh: '提高注意力', tw: '提高注意力', vi: 'Giúp tập trung tâm trí' }, { ko: '하루의 에너지를 준다', en: 'Gives energy for the day', ja: '一日のエネルギーを与える', zh: '提供全天的能量', tw: '提供全天的能量', vi: 'Cung cấp năng lượng cho cả ngày' }, { ko: '숙면을 돕는다', en: 'Helps with deep sleep', ja: '熟睡を助ける', zh: '帮助深度睡眠', tw: '幫助深度睡眠', vi: 'Giúp ngủ sâu' }] }
            ]
        }
    ],
    medium: [
        {
            id: 'r1_med', level: 'B1', title: 'THE DIGITAL REVOLUTION 💻',
            passage: 'The digital revolution has transformed nearly every aspect of modern life. From the way we communicate to how we shop, work, and learn, technology has reshaped society at an unprecedented pace. Smartphones allow instant access to information, while social media connects billions of people across the globe. However, concerns about data privacy, screen addiction, and the spread of misinformation continue to grow.',
            questions: [
                { id: 'rm_q1', answerIndex: 2, question: { ko: '디지털 혁명이 변화시킨 것은?', en: 'What has the digital revolution transformed?', ja: 'デジタル革命が変えたものは？', zh: '数字革命改变了什么？', tw: '數位革命改變了什麼？', vi: 'Cuộc cách mạng kỹ thuật số đã biến đổi điều gì?' }, options: [{ ko: '자연 환경', en: 'The natural environment', ja: '自然環境', zh: '自然环境', tw: '自然環境', vi: 'Môi trường tự nhiên' }, { ko: '역사적 사건', en: 'Historical events', ja: '歴史的な出来事', zh: '历史事件', tw: '歷史事件', vi: 'Các sự kiện lịch sử' }, { ko: '현대 생활의 거의 모든 측면', en: 'Nearly every aspect of modern life', ja: '現代生活のほぼすべての側面', zh: '现代生活的几乎每个方面', tw: '現代生活的幾乎每個方面', vi: 'Hầu hết mọi khía cạnh của cuộc sống hiện đại' }, { ko: '농업과 식품', en: 'Agriculture and food', ja: '農業と食料', zh: '农业和食品', tw: '農業和食品', vi: 'Nông nghiệp và thực phẩm' }] },
                { id: 'rm_q1_2', answerIndex: 1, question: { ko: '점점 커지고 있는 우려 사항이 아닌 것은?', en: 'Which of the following is NOT mentioned as a growing concern?', ja: '懸念事項として言及されていないものはどれですか？', zh: '以下哪项未被提及为日益增长的担忧？', tw: '以下哪項未被提及為日益增長的擔憂？', vi: 'Điều nào sau đây KHÔNG được đề cập là mối lo ngại ngày càng tăng?' }, options: [{ ko: '데이터 프라이버시', en: 'Data privacy', ja: 'データのプライバシー', zh: '数据隐私', tw: '數據隱私', vi: 'Quyền riêng tư dữ liệu' }, { ko: '스마트폰 가격 상승', en: 'Rising cost of smartphones', ja: 'スマートフォンの価格上昇', zh: '智能手机成本上升', tw: '智能手機成本上升', vi: 'Giá điện thoại thông minh tăng' }, { ko: '화면 중독', en: 'Screen addiction', ja: '画面への依存', zh: '屏幕沉迷', tw: '屏幕沉迷', vi: 'Nghiện màn hình' }, { ko: '잘못된 정보의 확산', en: 'Spread of misinformation', ja: '誤情報の拡散', zh: '错误信息的传播', tw: '錯誤信息的傳播', vi: 'Sự lan truyền thông tin sai lệch' }] }
            ]
        }
    ],
    hard: [
        {
            id: 'r1_hard', level: 'C1', title: 'SLEEP & THE BRAIN 🧠',
            passage: 'Sleep is one of the most important processes for brain health. During sleep, the brain consolidates memories, removes toxic waste products, and repairs neural connections. Research shows that adults need seven to nine hours of sleep per night to function optimally. Chronic sleep deprivation has been linked to serious health problems including memory loss, weakened immunity, and increased risk of cardiovascular disease.',
            questions: [
                { id: 'rh_q1', answerIndex: 0, question: { ko: '만성 수면 부족과 관련된 건강 문제가 아닌 것은?', en: 'Which is NOT linked to chronic sleep deprivation?', ja: '慢性的な睡眠不足と関連しない問題は？', zh: '以下哪项与长期睡眠不足无关？', tw: '以下哪項與長期睡眠不足無關？', vi: 'Điều nào KHÔNG liên quan đến thiếu ngủ mãn tính?' }, options: [{ ko: '시력 향상', en: 'Improved eyesight', ja: '視力の向上', zh: '视力改善', tw: '視力改善', vi: 'Cải thiện thị lực' }, { ko: '기억력 손실', en: 'Memory loss', ja: '記憶喪失', zh: '记忆力丧失', tw: '記憶力喪失', vi: 'Mất trí nhớ' }, { ko: '면역력 약화', en: 'Weakened immunity', ja: '免疫力低下', zh: '免疫力下降', tw: '免疫力下降', vi: 'Suy giảm miễn dịch' }, { ko: '심혈관 질환 위험', en: 'Risk of cardiovascular disease', ja: '心血管疾患リスク', zh: '心血管疾病风险', tw: '心血管疾病風險', vi: 'Nguy cơ bệnh tim mạch' }] },
                { id: 'rh_q1_2', answerIndex: 1, question: { ko: '수면 중에 뇌가 수행하는 활동은 무엇입니까?', en: 'What activity does the brain perform during sleep?', ja: '睡眠中に脳が行う活動は何ですか？', zh: '大脑在睡眠期间执行什么活动？', tw: '大腦在睡眠期間執行什麼活動？', vi: 'Bộ não thực hiện hoạt động gì trong khi ngủ?' }, options: [{ ko: '비타민을 생성한다', en: 'It produces vitamins', ja: 'ビタミンを生成する', zh: '它产生维生素', tw: '它產生維生素', vi: 'Nó tạo ra vitamin' }, { ko: '기억을 통합한다', en: 'It consolidates memories', ja: '記憶を統合する', zh: '它巩固记忆', tw: '它鞏固記憶', vi: 'Nó củng cố ký ức' }, { ko: '심장 박동을 멈춘다', en: 'It stops the heartbeat', ja: '心拍を止める', zh: '它停止心跳', tw: '它停止心跳', vi: 'Nó làm tim ngừng đập' }, { ko: '근육을 단련시킨다', en: 'It trains the muscles', ja: '筋肉を鍛える', zh: '它锻炼肌肉', tw: '它鍛煉肌肉', vi: 'Nó rèn luyện cơ bắp' }] }
            ]
        }
    ]
};
