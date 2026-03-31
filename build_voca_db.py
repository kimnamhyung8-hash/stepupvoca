# -*- coding: utf-8 -*-
"""
VocaQuest DB Builder - Part 2
Builds 99 levels x 50 words from word pools
"""
import json, random, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from gen_voca_db import TIER1, TIER2

# Additional Tier3-5 advanced/expert words
TIER3 = [
    ("Abolish","폐지하다","廃止する","废除","Bãi bỏ"),("Absorb","흡수하다","吸収する","吸收","Hấp thụ"),
    ("Abstract","추상적인","抽象的な","抽象","Trừu tượng"),("Absurd","터무니없는","ばかげた","荒谬","Vô lý"),
    ("Abundant","풍부한","豊富な","丰富","Dồi dào"),("Accelerate","가속하다","加速する","加速","Tăng tốc"),
    ("Accessible","접근 가능한","アクセス可能","可访问","Có thể tiếp cận"),("Accommodate","수용하다","収容する","容纳","Chứa"),
    ("Accomplish","달성하다","達成する","完成","Hoàn thành"),("Accumulate","축적하다","蓄積する","积累","Tích lũy"),
    ("Accurate","정확한","正確な","准确","Chính xác"),("Acknowledge","인정하다","認める","承认","Công nhận"),
    ("Acquire","획득하다","獲得する","获得","Thu được"),("Adapt","적응하다","適応する","适应","Thích nghi"),
    ("Adequate","적절한","適切な","充分","Đầy đủ"),("Adjust","조정하다","調整する","调整","Điều chỉnh"),
    ("Administer","관리하다","管理する","管理","Quản lý"),("Admire","감탄하다","感心する","欣赏","Ngưỡng mộ"),
    ("Adopt","채택하다","採用する","采用","Áp dụng"),("Advocate","옹호하다","提唱する","提倡","Ủng hộ"),
    ("Aesthetic","미적인","美的な","美学","Thẩm mỹ"),("Affection","애정","愛情","感情","Tình cảm"),
    ("Aggregate","총합","集約","聚合","Tổng hợp"),("Aggressive","공격적인","攻撃的な","攻击性","Hung hăng"),
    ("Allocate","할당하다","割り当てる","分配","Phân bổ"),("Alter","변경하다","変更する","改变","Thay đổi"),
    ("Alternative","대안","代替","替代","Thay thế"),("Ambitious","야심 찬","野心的な","有野心","Tham vọng"),
    ("Amend","수정하다","修正する","修改","Sửa đổi"),("Analyze","분석하다","分析する","分析","Phân tích"),
    ("Annual","연간의","年間の","年度","Hàng năm"),("Anticipate","예상하다","予想する","预期","Dự đoán"),
    ("Apparent","명백한","明白な","明显","Rõ ràng"),("Appetite","식욕","食欲","食欲","Sự thèm ăn"),
    ("Appliance","가전제품","家電","电器","Thiết bị"),("Appropriate","적절한","適切な","适当","Phù hợp"),
    ("Approve","승인하다","承認する","批准","Phê duyệt"),("Arbitrary","임의의","任意の","任意","Tùy ý"),
    ("Architect","건축가","建築家","建筑师","Kiến trúc sư"),("Arise","발생하다","生じる","出现","Phát sinh"),
    ("Arrange","배열하다","配置する","安排","Sắp xếp"),("Articulate","명확히 말하다","明確に言う","表达","Diễn đạt"),
    ("Aspect","측면","側面","方面","Khía cạnh"),("Assemble","조립하다","組み立てる","组装","Lắp ráp"),
    ("Assert","단언하다","断言する","断言","Khẳng định"),("Assess","평가하다","評価する","评估","Đánh giá"),
    ("Asset","자산","資産","资产","Tài sản"),("Assign","할당하다","割り当てる","分配","Giao"),
    ("Assist","돕다","助ける","协助","Hỗ trợ"),("Associate","연관시키다","関連付ける","关联","Liên kết"),
    ("Assume","가정하다","仮定する","假设","Giả định"),("Assure","보증하다","保証する","保证","Đảm bảo"),
    ("Atmosphere","분위기","雰囲気","氛围","Bầu không khí"),("Attach","첨부하다","添付する","附加","Đính kèm"),
    ("Attempt","시도하다","試みる","尝试","Cố gắng"),("Attitude","태도","態度","态度","Thái độ"),
    ("Attribute","속성","属性","属性","Thuộc tính"),("Authority","권위","権威","权威","Quyền hạn"),
    ("Automatic","자동의","自動の","自动","Tự động"),("Aware","인식하는","意識した","意识到","Nhận thức"),
    ("Behalf","대신에","代わりに","代表","Thay mặt"),("Benefit","이익","利益","利益","Lợi ích"),
    ("Bias","편견","偏見","偏见","Thiên vị"),("Bond","유대","絆","纽带","Mối liên kết"),
    ("Brief","간결한","簡潔な","简短","Ngắn gọn"),("Budget","예산","予算","预算","Ngân sách"),
    ("Capacity","용량","容量","容量","Năng lực"),("Capture","포착하다","捕らえる","捕获","Bắt giữ"),
    ("Cease","멈추다","止める","停止","Chấm dứt"),("Challenge","도전","挑戦","挑战","Thử thách"),
    ("Characteristic","특성","特性","特征","Đặc tính"),("Circumstance","상황","状況","情况","Hoàn cảnh"),
    ("Civil","시민의","市民の","民事","Dân sự"),("Clarify","명확히 하다","明確にする","澄清","Làm rõ"),
    ("Clause","조항","条項","条款","Điều khoản"),("Coherent","일관된","一貫した","连贯","Mạch lạc"),
    ("Coincide","일치하다","一致する","巧合","Trùng hợp"),("Collaborate","협력하다","協力する","合作","Hợp tác"),
    ("Collapse","붕괴하다","崩壊する","崩溃","Sụp đổ"),("Colleague","동료","同僚","同事","Đồng nghiệp"),
    ("Commence","시작하다","開始する","开始","Bắt đầu"),("Commit","전념하다","取り組む","承诺","Cam kết"),
    ("Commodity","상품","商品","商品","Hàng hóa"),("Compensate","보상하다","補償する","补偿","Bồi thường"),
    ("Compile","편집하다","編集する","编译","Biên soạn"),("Complement","보완하다","補完する","补充","Bổ sung"),
    ("Complex","복잡한","複雑な","复杂","Phức tạp"),("Comply","준수하다","従う","遵守","Tuân thủ"),
    ("Component","구성요소","コンポーネント","组件","Thành phần"),("Comprehensive","포괄적인","包括的な","全面","Toàn diện"),
    ("Compromise","타협하다","妥協する","妥协","Thỏa hiệp"),("Compulsory","의무적인","義務的な","必修","Bắt buộc"),
    ("Concentrate","집중하다","集中する","集中","Tập trung"),("Concept","개념","概念","概念","Khái niệm"),
    ("Conclude","결론짓다","結論づける","结论","Kết luận"),("Concrete","구체적인","具体的な","具体","Cụ thể"),
    ("Conduct","수행하다","行う","执行","Tiến hành"),("Conference","회의","会議","会议","Hội nghị"),
    ("Confine","가두다","閉じ込める","限制","Giam giữ"),("Confirm","확인하다","確認する","确认","Xác nhận"),
    ("Conflict","갈등","紛争","冲突","Xung đột"),("Conform","순응하다","従う","符合","Tuân theo"),
    ("Confront","직면하다","直面する","面对","Đối mặt"),("Conscience","양심","良心","良心","Lương tâm"),
    ("Conscious","의식하는","意識した","意识","Có ý thức"),("Consensus","합의","合意","共识","Đồng thuận"),
    ("Consequence","결과","結果","后果","Hậu quả"),("Conserve","보존하다","保存する","保存","Bảo tồn"),
    ("Considerable","상당한","かなりの","相当","Đáng kể"),("Consistent","일관된","一貫した","一致","Nhất quán"),
    ("Constitute","구성하다","構成する","构成","Cấu thành"),("Constraint","제약","制約","约束","Ràng buộc"),
    ("Construct","건설하다","建設する","建造","Xây dựng"),("Consult","상담하다","相談する","咨询","Tư vấn"),
    ("Consume","소비하다","消費する","消费","Tiêu thụ"),("Contemplate","숙고하다","熟考する","沉思","Chiêm nghiệm"),
    ("Contemporary","현대의","現代の","当代","Đương đại"),("Context","맥락","文脈","语境","Bối cảnh"),
    ("Contract","계약","契約","合同","Hợp đồng"),("Contradict","모순되다","矛盾する","矛盾","Mâu thuẫn"),
    ("Controversy","논란","論争","争议","Tranh cãi"),("Convention","관습","慣例","惯例","Quy ước"),
    ("Convert","전환하다","変換する","转换","Chuyển đổi"),("Convince","확신시키다","確信させる","说服","Thuyết phục"),
    ("Cooperate","협력하다","協力する","合作","Hợp tác"),("Coordinate","조정하다","調整する","协调","Phối hợp"),
    ("Core","핵심","コア","核心","Cốt lõi"),("Corporate","기업의","企業の","企业","Doanh nghiệp"),
    ("Correspond","대응하다","対応する","对应","Tương ứng"),("Criteria","기준","基準","标准","Tiêu chí"),
    ("Crucial","중대한","重大な","关键","Quan trọng"),("Cultivate","재배하다","栽培する","培养","Trau dồi"),
    ("Curriculum","교육과정","カリキュラム","课程","Chương trình"),("Decade","10년","十年","十年","Thập kỷ"),
    ("Declare","선언하다","宣言する","宣布","Tuyên bố"),("Decline","감소하다","衰退する","下降","Suy giảm"),
    ("Dedicate","헌신하다","献身する","奉献","Cống hiến"),("Deficit","적자","赤字","赤字","Thâm hụt"),
    ("Define","정의하다","定義する","定义","Định nghĩa"),("Deliberate","의도적인","意図的な","故意","Cố ý"),
    ("Demonstrate","입증하다","実証する","证明","Chứng minh"),("Deny","부인하다","否定する","否认","Phủ nhận"),
    ("Depict","묘사하다","描写する","描述","Miêu tả"),("Deploy","배치하다","配備する","部署","Triển khai"),
    ("Derive","파생하다","由来する","源于","Xuất phát"),("Designate","지정하다","指定する","指定","Chỉ định"),
    ("Detect","탐지하다","検出する","检测","Phát hiện"),("Deteriorate","악화되다","悪化する","恶化","Xấu đi"),
    ("Determine","결정하다","決定する","确定","Quyết định"),("Device","장치","デバイス","设备","Thiết bị"),
    ("Devote","헌신하다","献身する","致力","Cống hiến"),("Diagnose","진단하다","診断する","诊断","Chẩn đoán"),
    ("Dialogue","대화","対話","对话","Đối thoại"),("Differentiate","구별하다","区別する","区分","Phân biệt"),
    ("Dilemma","딜레마","ジレンマ","困境","Tình thế khó xử"),("Dimension","차원","次元","维度","Chiều"),
    ("Diminish","줄이다","減少する","减少","Giảm bớt"),("Discipline","규율","規律","纪律","Kỷ luật"),
    ("Disclose","공개하다","開示する","披露","Tiết lộ"),("Discourse","담론","談話","论述","Diễn ngôn"),
    ("Discretion","재량","裁量","自由裁量","Quyền quyết định"),("Discriminate","차별하다","差別する","歧视","Phân biệt đối xử"),
    ("Dismiss","해고하다","解雇する","解雇","Sa thải"),("Disorder","장애","障害","障碍","Rối loạn"),
    ("Dispute","분쟁","紛争","争议","Tranh chấp"),("Distinct","뚜렷한","明確な","独特","Riêng biệt"),
    ("Distinguish","구별하다","区別する","区分","Phân biệt"),("Distribute","배포하다","配布する","分配","Phân phối"),
    ("Diverse","다양한","多様な","多样","Đa dạng"),("Document","문서","文書","文件","Tài liệu"),
    ("Domain","분야","ドメイン","领域","Lĩnh vực"),("Domestic","국내의","国内の","国内","Trong nước"),
    ("Dominant","지배적인","支配的な","主导","Chiếm ưu thế"),("Draft","초안","下書き","草案","Bản nháp"),
    ("Dramatic","극적인","劇的な","戏剧性","Kịch tính"),("Duration","기간","期間","持续时间","Thời gian"),
    ("Dynamic","역동적인","動的な","动态","Năng động"),("Elaborate","정교한","精巧な","精心","Tỉ mỉ"),
    ("Element","요소","要素","元素","Yếu tố"),("Elevate","높이다","高める","提升","Nâng cao"),
    ("Eliminate","제거하다","排除する","消除","Loại bỏ"),("Emerge","나타나다","現れる","出现","Xuất hiện"),
    ("Emission","배출","排出","排放","Khí thải"),("Emotion","감정","感情","情感","Cảm xúc"),
    ("Emphasis","강조","強調","强调","Nhấn mạnh"),("Empirical","경험적인","経験的な","实证","Thực nghiệm"),
    ("Enable","가능하게 하다","可能にする","使能够","Cho phép"),("Encounter","직면하다","遭遇する","遇到","Gặp phải"),
    ("Endure","견디다","耐える","忍受","Chịu đựng"),("Enforce","시행하다","施行する","执行","Thực thi"),
    ("Engage","참여하다","従事する","参与","Tham gia"),("Enhance","향상시키다","強化する","增强","Nâng cao"),
    ("Enormous","거대한","巨大な","巨大","To lớn"),("Enterprise","기업","企業","企业","Doanh nghiệp"),
    ("Entity","실체","実体","实体","Thực thể"),("Equivalent","동등한","同等の","等同","Tương đương"),
    ("Era","시대","時代","时代","Thời đại"),("Erode","침식하다","侵食する","侵蚀","Xói mòn"),
    ("Error","오류","エラー","错误","Lỗi"),("Essence","본질","本質","本质","Bản chất"),
    ("Ethical","윤리적인","倫理的な","道德","Đạo đức"),("Evaluate","평가하다","評価する","评估","Đánh giá"),
    ("Evolve","진화하다","進化する","进化","Tiến hóa"),("Exaggerate","과장하다","誇張する","夸张","Phóng đại"),
    ("Exceed","초과하다","超える","超过","Vượt quá"),("Exclude","제외하다","除外する","排除","Loại trừ"),
    ("Execute","실행하다","実行する","执行","Thực hiện"),("Exempt","면제하다","免除する","免除","Miễn trừ"),
    ("Exhibit","전시하다","展示する","展览","Triển lãm"),("Expand","확장하다","拡大する","扩大","Mở rộng"),
    ("Explicit","명시적인","明示的な","明确","Rõ ràng"),("Exploit","이용하다","利用する","利用","Khai thác"),
    ("Export","수출하다","輸出する","出口","Xuất khẩu"),("Expose","노출하다","暴露する","暴露","Phơi bày"),
    ("Extend","연장하다","延長する","延伸","Mở rộng"),("Extent","범위","範囲","程度","Mức độ"),
    ("External","외부의","外部の","外部","Bên ngoài"),("Extract","추출하다","抽出する","提取","Chiết xuất"),
    ("Extraordinary","비범한","非凡な","非凡","Phi thường"),("Extreme","극단적인","極端な","极端","Cực đoan"),
    ("Facilitate","촉진하다","促進する","促进","Tạo điều kiện"),("Factor","요인","要因","因素","Nhân tố"),
    ("Faculty","학부","学部","学院","Khoa"),("Famine","기근","飢饉","饥荒","Nạn đói"),
    ("Fascinate","매혹하다","魅了する","迷住","Mê hoặc"),("Fatal","치명적인","致命的な","致命","Chí mạng"),
    ("Feasible","실행 가능한","実行可能な","可行","Khả thi"),("Federal","연방의","連邦の","联邦","Liên bang"),
    ("Fierce","맹렬한","猛烈な","激烈","Dữ dội"),("Figure","인물","人物","人物","Nhân vật"),
    ("Finance","재정","財政","金融","Tài chính"),("Fiscal","재정의","財政の","财政","Tài khóa"),
    ("Flaw","결함","欠陥","缺陷","Khuyết điểm"),("Fluctuate","변동하다","変動する","波动","Biến động"),
    ("Forecast","예측","予測","预测","Dự báo"),("Forge","위조하다","偽造する","伪造","Giả mạo"),
    ("Formula","공식","公式","公式","Công thức"),("Fraction","분수","分数","分数","Phân số"),
    ("Fragment","조각","断片","碎片","Mảnh vỡ"),("Framework","틀","枠組み","框架","Khung"),
    ("Franchise","프랜차이즈","フランチャイズ","特许经营","Nhượng quyền"),("Fraud","사기","詐欺","欺诈","Gian lận"),
    ("Frequent","빈번한","頻繁な","频繁","Thường xuyên"),("Frontier","국경","国境","边疆","Biên giới"),
    ("Fulfil","이행하다","果たす","实现","Thực hiện"),("Fundamental","근본적인","根本的な","根本","Cơ bản"),
]

# Combine all tiers
ALL_WORDS = TIER1 + TIER2 + TIER3
print(f"Total unique words available: {len(ALL_WORDS)}")

# Example sentences templates
EXAMPLE_TEMPLATES = [
    "I {verb} every day.", "She can {verb} very well.", "They {verb} together.",
    "The {noun} is very nice.", "I like the {noun}.", "Can you see the {noun}?",
    "It is very {adj}.", "The weather is {adj} today.", "This is quite {adj}.",
    "We need to {verb} more.", "He wants to {verb}.", "Please {verb} carefully.",
]

# Example translation templates per language
EX_KO = ["매일 {word}합니다.", "그녀는 아주 잘 {word}합니다.", "그들은 함께 {word}합니다.",
          "{word}은/는 아주 좋습니다.", "나는 {word}을/를 좋아합니다.", "{word}을/를 볼 수 있나요?"]
EX_JA = ["毎日{word}します。", "彼女は上手に{word}します。", "彼らは一緒に{word}します。",
          "{word}はとても良いです。", "{word}が好きです。", "{word}が見えますか？"]
EX_ZH = ["我每天{word}。", "她很会{word}。", "他们一起{word}。",
          "{word}非常好。", "我喜欢{word}。", "你能看到{word}吗？"]
EX_VI = ["Tôi {word} mỗi ngày.", "Cô ấy {word} rất giỏi.", "Họ {word} cùng nhau.",
          "{word} rất tuyệt.", "Tôi thích {word}.", "Bạn có thể thấy {word} không?"]

LEVEL_DESCS = {
    "ko": ["초급", "기초", "입문", "기본", "초중급", "중급 기초", "중급", "중급 심화", "중상급", "고급 입문",
           "고급 기초", "고급", "고급 심화", "실전", "전문", "심화", "마스터", "달인", "전설", "궁극"],
    "en": ["Elementary", "Basic", "Starter", "Foundation", "Pre-Intermediate", "Lower-Intermediate", "Intermediate",
           "Upper-Intermediate", "Pre-Advanced", "Lower-Advanced", "Advanced Foundation", "Advanced", "High-Advanced",
           "Practical", "Professional", "Intensive", "Master", "Expert", "Legendary", "Ultimate"],
    "ja": ["初級", "基礎", "入門", "基本", "初中級", "中級基礎", "中級", "中級発展", "中上級", "上級入門",
           "上級基礎", "上級", "上級発展", "実践", "専門", "深化", "マスター", "達人", "伝説", "究極"],
    "zh": ["初级", "基础", "入门", "基本", "初中级", "中级基础", "中级", "中级深化", "中高级", "高级入门",
           "高级基础", "高级", "高级深化", "实战", "专业", "深化", "大师", "达人", "传说", "终极"],
    "vi": ["Sơ cấp", "Cơ bản", "Nhập môn", "Nền tảng", "Tiền trung cấp", "Trung cấp cơ bản", "Trung cấp",
           "Trung cấp nâng cao", "Trung cao cấp", "Cao cấp nhập môn", "Cao cấp cơ bản", "Cao cấp",
           "Cao cấp nâng cao", "Thực hành", "Chuyên nghiệp", "Chuyên sâu", "Bậc thầy", "Chuyên gia", "Huyền thoại", "Tối thượng"]
}

def get_desc(level, lang):
    idx = min((level - 1) // 5, len(LEVEL_DESCS[lang]) - 1)
    return LEVEL_DESCS[lang][idx]

def make_example(word_en, word_ko, word_ja, word_zh, word_vi, idx):
    t = idx % len(EXAMPLE_TEMPLATES)
    en_ex = f"The word '{word_en}' is used in daily conversation."
    ko_ex = EX_KO[idx % len(EX_KO)].replace("{word}", word_ko)
    ja_ex = EX_JA[idx % len(EX_JA)].replace("{word}", word_ja)
    zh_ex = EX_ZH[idx % len(EX_ZH)].replace("{word}", word_zh)
    vi_ex = EX_VI[idx % len(EX_VI)].replace("{word}", word_vi)
    return en_ex, ko_ex, ja_ex, zh_ex, vi_ex

def generate_options(correct_word_tuple, all_words_in_level, all_pool):
    """Generate 4 options including the correct answer"""
    correct_ko = correct_word_tuple[1]
    correct_ja = correct_word_tuple[2]
    correct_zh = correct_word_tuple[3]
    correct_vi = correct_word_tuple[4]

    # Get wrong options from same level first, then from pool
    candidates = [w for w in all_words_in_level if w[0] != correct_word_tuple[0]]
    if len(candidates) < 3:
        extra = [w for w in all_pool if w[0] != correct_word_tuple[0] and w not in candidates]
        random.shuffle(extra)
        candidates.extend(extra[:10])

    random.shuffle(candidates)
    wrongs = candidates[:3]

    options_ko = [correct_ko] + [w[1] for w in wrongs]
    options_ja = [correct_ja] + [w[2] for w in wrongs]
    options_zh = [correct_zh] + [w[3] for w in wrongs]
    options_vi = [correct_vi] + [w[4] for w in wrongs]
    options_en = [correct_word_tuple[0]] + [w[0] for w in wrongs]

    # Shuffle options together
    combined = list(zip(options_ko, options_ja, options_zh, options_vi, options_en))
    random.shuffle(combined)
    answer_idx = next(i for i, c in enumerate(combined) if c[0] == correct_ko)

    return {
        "ko": [c[0] for c in combined],
        "ja": [c[1] for c in combined],
        "zh": [c[2] for c in combined],
        "vi": [c[3] for c in combined],
        "en": [c[4] for c in combined],
    }, answer_idx

# Build the database
random.seed(42)  # Reproducible

# Distribute words across 99 levels, 50 words each = 4950 words
# We have ~1000+ unique words. We'll cycle through them with shuffling.
total_needed = 99 * 50
pool = list(ALL_WORDS)

# Extend pool by repeating with slight variations if needed
while len(pool) < total_needed:
    extra = list(ALL_WORDS)
    random.shuffle(extra)
    pool.extend(extra)

pool = pool[:total_needed]

db = []
word_idx = 0
for level in range(1, 100):
    level_words = pool[word_idx:word_idx + 50]
    word_idx += 50

    words_json = []
    for i, wt in enumerate(level_words):
        word_en, word_ko, word_ja, word_zh, word_vi = wt
        en_ex, ko_ex, ja_ex, zh_ex, vi_ex = make_example(word_en, word_ko, word_ja, word_zh, word_vi, i)
        opts, ans_idx = generate_options(wt, level_words, ALL_WORDS)

        words_json.append({
            "id": f"w_{level}_{i+1}",
            "word": word_en,
            "meaning": word_ko,  # backward compat
            "meanings": {"ko": word_ko, "en": word_en, "ja": word_ja, "zh": word_zh, "vi": word_vi},
            "example_en": en_ex,
            "example_ko": ko_ex,  # backward compat
            "examples_loc": {"ko": ko_ex, "en": en_ex, "ja": ja_ex, "zh": zh_ex, "vi": vi_ex},
            "options": opts["ko"],  # backward compat
            "options_loc": opts,
            "answer_index": ans_idx
        })

    desc = {lang: get_desc(level, lang) + f" LV.{level}" for lang in ["ko","en","ja","zh","vi"]}

    db.append({
        "level": level,
        "description": desc,
        "wordCount": 50,
        "words": words_json
    })

# Write output
output_path = os.path.join(os.path.dirname(__file__), "app", "src", "data", "vocaDB.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print(f"Generated {len(db)} levels with {sum(len(l['words']) for l in db)} total words")
print(f"Output: {output_path}")
print(f"File size: {os.path.getsize(output_path) / 1024 / 1024:.1f} MB")
