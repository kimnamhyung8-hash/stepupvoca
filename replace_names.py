"""
순수 사람 이름 어휘를 레벨별 적합한 새 단어로 교체하는 스크립트.
- vocaDB_core.json: word, meaning, options 교체
- vocaDB_ja/tw/vi/zh.json: options 교체
"""

import json
import copy
import re

# ============================================================
# 이중 의미가 있어 유지할 단어 (소문자)
# ============================================================
KEEP_WORDS = {
    'mark',       # 표시/점수
    'frank',      # 솔직한
    'grace',      # 우아함
    'amber',      # 호박색
    'ally',       # 동맹
    'ruby',       # 루비(보석)
    'lily',       # 백합
    'daisy',      # 데이지꽃
    'holly',      # 홀리(나무)
    'victor',     # 승리자
    'norm',       # 규범
    'earl',       # 백작
    'abbey',      # 수도원
    'jade',       # 옥(보석)
    'iris',       # 아이리스(꽃)
    'joy',        # 기쁨
    'june',       # 6월
    'may',        # 5월/~일지도
    'april',      # 4월
    'august',     # 8월
    'oscar',      # 오스카상(문화적 의미)
    'ross',       # (고유명사 아님)
    'harvey',     # (허리케인 등 고유명사이나 성으로도 쓰임)
    'gene',       # 유전자
    'dean',       # 학장
    'clark',      # (성으로도 사용)
}

# ============================================================
# 순수 사람 이름 → 대체 단어 매핑
# 형식: { 'original_word': ('replacement_word', 'Korean meaning') }
# 레벨에 어울리는 단어로 수동 선정 (레벨 100~333)
# ============================================================
NAME_REPLACEMENTS = {
    # 레벨 100대
    'jonathan':    ('challenge',   '도전'),
    'lawrence':    ('adventure',   '모험'),
    'sean':        ('courage',     '용기'),
    'lisa':        ('pattern',     '패턴/양식'),
    'larry':       ('respond',     '반응하다'),
    'alice':       ('observe',     '관찰하다'),
    'albert':      ('concept',     '개념'),
    'carl':        ('sequence',    '순서/연속'),
    'laura':       ('strategy',    '전략'),
    'steven':      ('revenue',     '수입/수익'),
    'susan':       ('priority',    '우선순위'),
    'terry':       ('estimate',    '추정하다'),
    'emma':        ('outcome',     '결과'),
    'greg':        ('tension',     '긴장감'),
    'margaret':    ('committee',   '위원회'),
    'parker':      ('guarantee',   '보장하다'),
    'christopher': ('phenomenon',  '현상'),
    'oliver':      ('diversity',   '다양성'),
    'douglas':     ('negotiate',   '협상하다'),
    'jose':        ('obligation',  '의무'),
    'barbara':     ('compromise',  '타협하다'),
    'helen':       ('perceive',    '인식하다'),
    'jennifer':    ('sustainable', '지속가능한'),
    'samuel':      ('interpret',   '해석하다'),
    'stanley':     ('transform',   '변환하다'),
    'cole':        ('crucial',     '중요한/결정적인'),
    'craig':       ('adequate',    '적절한'),
    'jessica':     ('coherent',    '일관성 있는'),
    'keith':       ('explicit',    '명시적인'),
    'kent':        ('implicit',    '암묵적인'),
    'madison':     ('innovation',  '혁신'),
    'tyler':       ('evaluate',    '평가하다'),
    'michelle':    ('consequence', '결과/영향'),
    'neil':        ('perspective', '관점'),
    'rachel':      ('constitute',  '구성하다'),
    'emily':       ('parameter',   '매개변수'),
    'kyle':        ('integrate',   '통합하다'),
    'mason':       ('dynamic',     '역동적인'),
    'nancy':       ('implement',   '실행하다'),
    'vincent':     ('catalyst',    '촉매/계기'),
    'nathan':      ('collaborate', '협력하다'),
    'brad':        ('benchmark',   '기준점'),
    'juan':        ('framework',   '체계/틀'),
    'julia':       ('algorithm',   '알고리즘'),
    'pete':        ('optimize',    '최적화하다'),
    'dennis':      ('portfolio',   '포트폴리오'),
    'julie':       ('efficiency',  '효율성'),
    'karen':       ('momentum',    '추진력/운동량'),
    'marcus':      ('credibility', '신뢰성'),
    'todd':        ('resilience',  '회복력'),
    'lucy':        ('transparency','투명성'),
    'penny':       ('legitimacy',  '합법성'),
    'linda':       ('consensus',   '합의'),
    'stan':        ('dimension',   '차원'),
    'dylan':       ('sophisticated','세련된/정교한'),
    'ellen':       ('hierarchy',   '계층/서열'),
    'hannah':      ('autonomy',    '자율성'),
    'ruth':        ('reconcile',   '화解하다'),
    'marc':        ('dilemma',     '딜레마'),
    'nicholas':    ('phenomenon',  '현상'),
    'angela':      ('paradigm',    '패러다임'),
    'carol':       ('discipline',  '규율/훈련'),
    'diana':       ('apparatus',   '기구/장치'),
    'derek':       ('formulate',   '공식화하다'),
    'joan':        ('articulate',  '명확히 표현하다'),
    'leonard':     ('elaborate',   '정교한/상세히 설명하다'),
    'travis':      ('facilitate',  '촉진하다'),
    'louise':      ('controversy', '논란'),
    'alfred':      ('indigenous',  '토착의/원주민의'),
    'julian':      ('testimony',   '증언'),
    'claire':      ('coherence',   '일관성'),
    'lauren':      ('criterion',   '기준'),
    'wade':        ('infrastructure','인프라'),
    'joel':        ('conviction',  '확신/유죄 판결'),
    'sally':       ('correlation', '상관관계'),
    'florence':    ('magnitude',   '규모/크기'),
    'janet':       ('hypothesis',  '가설'),
    'monica':      ('jurisdiction','관할권'),
    'rebecca':     ('empirical',   '경험적인'),
    'sara':        ('perpetual',   '영구적인'),
    'frederick':   ('bureaucracy', '관료주의'),
    'troy':        ('enigma',      '수수께끼'),
    'chad':        ('jurisdiction','관할권'),  # 중복이면 아래서 처리
    'liam':        ('legislation', '입법'),
    'noah':        ('sanctuary',   '성역/피난처'),
    'betty':       ('apparatus',   '기구/장치'),  # 중복이면 아래서 처리
    'joey':        ('infrastructure','인프라'),   # 중복이면 처리
    'joshua':      ('arbitration', '중재'),
    'leon':        ('diplomacy',   '외교'),
    'seth':        ('sovereignty', '주권'),
    'sharon':      ('propaganda',  '선전/프로파간다'),
    'sophie':      ('eloquent',    '달변의/유창한'),
    'gilbert':     ('rhetoric',    '수사학'),
    'griffin':     ('allegiance',  '충성'),
    'jeffrey':     ('cynical',     '냉소적인'),
    'walt':        ('empiricism',  '경험주의'),
    'homer':       ('pragmatic',   '실용적인'),
    'jenny':       ('rationale',   '근거/이유'),
    'andrea':      ('subsidy',     '보조금'),
    'holly':       None,  # KEEP_WORDS에 있으므로 skip
    'kurt':        ('volatile',    '불안정한/휘발성'),
    'beth':        ('stipulate',   '규정하다/명시하다'),
    'glen':        ('deprecate',   '반대하다/사용 중단하다'),
    'heather':     ('mitigate',    '완화하다'),
    'molly':       ('proliferate', '급증하다'),
    'brett':       ('exacerbate',  '악화시키다'),
    'ivan':        ('conscientious','양심적인'),
    'joyce':       ('ambiguous',   '모호한'),
    'lynn':        ('precarious',  '불안정한'),
    'trevor':      ('meticulous',  '꼼꼼한'),
    'nina':        ('ambivalent',  '양가감정의'),
    'donna':       ('inevitable',  '불가피한'),
    'felix':       ('tenacious',   '끈질긴'),
    'melissa':     ('pragmatism',  '실용주의'),
    'wendy':       ('stagnant',    '침체된'),
    'diane':       ('ostensible',  '표면상의'),
    'floyd':       ('ubiquitous',  '어디에나 있는'),
    'katherine':   ('encompass',   '포괄하다'),
    'olivia':      ('reciprocal',  '상호적인'),
    'dana':        ('symmetry',    '대칭'),
    'chester':     ('nuance',      '뉘앙스'),
    'eleanor':     ('eloquence',   '웅변/달변'),
    'jill':        ('archetype',   '원형'),
    'nate':        ('dogmatic',    '독단적인'),
    'shawn':       ('eclectic',    '절충적인'),
    'stephanie':   ('paradox',     '역설'),
    'clara':       ('dissent',     '반대하다'),
    'maggie':      ('nostalgia',   '향수'),
    'sandra':      ('juxtapose',   '나란히 놓다'),
    'darren':      ('obsolete',    '구식의'),
    'evan':        ('assimilate',  '동화하다'),
    'judy':        ('vindicate',   '무죄를 입증하다'),
    'megan':       ('profound',    '심오한'),
    'phillip':     ('mundane',     '세속적인/평범한'),
    'allison':     ('nuanced',     '뉘앙스 있는'),
    'daisy':       None,  # KEEP_WORDS에 있으므로 skip
    'dorothy':     ('ethereal',    '하늘 같은/영묘한'),
    'jade':        None,  # KEEP_WORDS에 있으므로 skip
    'alison':      ('altruistic',  '이타적인'),
    'brooke':      ('ephemeral',   '덧없는/순간적인'),
    'claude':      ('perpetuate',  '영속시키다'),
    'darwin':      ('evolve',      '진화하다'),
    'freddie':     ('cognition',   '인식/인지'),
    'heath':       ('phenomenon',  '현상'),  # 중복 처리 필요
    'hugo':        ('conjecture',  '추측'),
    'iris':        None,  # KEEP_WORDS에 있으므로 skip
    'patricia':    ('scrutinize',  '면밀히 조사하다'),
    'tina':        ('antiquated',  '구식의'),
    'zach':        ('expedite',    '신속히 처리하다'),
    'elena':       ('corroborate', '확증하다'),
    'alexis':      ('inveterate',  '습관적인/뿌리 깊은'),
    'bella':       ('equivocal',   '모호한/애매한'),
    'elliot':      ('culminate',   '절정에 달하다'),
    'gavin':       ('emulate',     '모방하다/경쟁하다'),
    'emmy':        ('accolade',    '칭찬/수상'),
    'gloria':      ('renown',      '명성'),
    'shirley':     ('integrity',   '청렴/무결성'),
    'clyde':       ('autonomy',    '자율성'),   # 중복이면 처리
    'ernest':      ('diligent',    '성실한'),
    'marilyn':     ('resilience',  '회복력'),   # 중복이면 처리
    'rory':        ('persevere',   '인내하다'),
    # 아직 안 잡힌 이름들
    'brad':        ('benchmark',   '기준점'),
    'peter':       ('petition',    '청원하다/탄원'),
    'michael':     ('mechanism',   '메커니즘'),
    'kevin':       ('initiative',  '주도권/계획'),
    'scott':       ('transcript',  '기록/성적표'),
    'james':       ('justice',     '정의'),
    'robert':      ('reform',      '개혁하다'),
    'richard':     ('criterion',   '기준'),
    'david':       ('donate',      '기부하다'),
    'william':     ('welfare',     '복지'),
    'charles':     ('charter',     '헌장'),
    'george':      ('geography',   '지리학'),
    'thomas':      ('theology',    '신학'),
    'paul':        ('parallel',    '평행한/유사한'),
    'john':        ('journal',     '저널/일기'),
    'joseph':      ('justify',     '정당화하다'),
    'henry':       ('heritage',    '유산'),
    'edward':      ('edition',     '판/호'),
    'brian':       ('bridge',      '교량/연결하다'),
    'andrew':      ('announce',    '발표하다'),
    'daniel':      ('database',    '데이터베이스'),
    'matthew':     ('matter',      '중요하다/물질'),
    'jack':        ('jacket',      '재킷'),
    'jason':       ('passion',     '열정'),
    'ryan':        ('relay',       '릴레이/전달하다'),
    'adam':        ('adapt',       '적응하다'),
    'eric':        ('exact',       '정확한'),
    'ian':         ('impact',      '영향'),
    'tom':         ('topic',       '주제'),
    'jim':         ('junction',    '교차로/연결점'),
    'bob':         ('boundary',    '경계'),
    'max':         ('maximize',    '최대화하다'),
    'sam':         ('sample',      '샘플'),
    'tim':         ('timeline',    '타임라인'),
    'joe':         ('journey',     '여행/여정'),
    'kim':         ('kinetic',     '동적인'),
    'pat':         ('patent',      '특허'),
    'ben':         ('benefit',     '이익/혜택'),
    'sue':         ('survey',      '조사하다'),
    'ted':         ('tendency',    '경향'),
    'ken':         ('keen',        '열정적인/예리한'),
    'ann':         ('annual',      '연간의'),
    'meg':         ('merge',       '합병하다'),
    'leo':         ('legitimate',  '합법적인'),
    'roger':       ('regime',      '체제/정권'),
    'walter':      ('warrant',     '정당화하다/영장'),
    'karen':       ('contrast',    '대조하다'),  # 위에서 이미 momentum으로
    'phillip':     ('mundane',     '세속적인/평범한'),  # 위에서 이미
}

# 중복 등 충돌 방지를 위해 실제로 사용할 교체 단어들을 레벨별로 고유하게 관리
# (동일 레벨에 같은 대체어가 들어가지 않도록)

# ============================================================
# 다국어 translations: 대체 단어 → 각 언어별 의미
# ============================================================
MULTILANG = {
    # word: { ja: '일본어', tw: '중국어(번체)', vi: '베트남어', zh: '중국어(간체)' }
    'challenge':    {'ja': '挑戦', 'tw': '挑戰', 'vi': 'thách thức', 'zh': '挑战'},
    'adventure':    {'ja': '冒険', 'tw': '冒險', 'vi': 'cuộc phiêu lưu', 'zh': '冒险'},
    'courage':      {'ja': '勇気', 'tw': '勇氣', 'vi': 'lòng dũng cảm', 'zh': '勇气'},
    'pattern':      {'ja': 'パターン', 'tw': '模式', 'vi': 'mẫu', 'zh': '模式'},
    'respond':      {'ja': '反応する', 'tw': '回應', 'vi': 'phản hồi', 'zh': '回应'},
    'observe':      {'ja': '観察する', 'tw': '觀察', 'vi': 'quan sát', 'zh': '观察'},
    'concept':      {'ja': '概念', 'tw': '概念', 'vi': 'khái niệm', 'zh': '概念'},
    'sequence':     {'ja': '順序', 'tw': '順序', 'vi': 'trình tự', 'zh': '顺序'},
    'strategy':     {'ja': '戦略', 'tw': '策略', 'vi': 'chiến lược', 'zh': '策略'},
    'revenue':      {'ja': '収益', 'tw': '收入', 'vi': 'doanh thu', 'zh': '收益'},
    'priority':     {'ja': '優先事項', 'tw': '優先', 'vi': 'ưu tiên', 'zh': '优先'},
    'estimate':     {'ja': '見積もる', 'tw': '估計', 'vi': 'ước tính', 'zh': '估计'},
    'outcome':      {'ja': '結果', 'tw': '結果', 'vi': 'kết quả', 'zh': '结果'},
    'tension':      {'ja': '緊張', 'tw': '緊張', 'vi': 'căng thẳng', 'zh': '紧张'},
    'committee':    {'ja': '委員会', 'tw': '委員會', 'vi': 'ủy ban', 'zh': '委员会'},
    'guarantee':    {'ja': '保証する', 'tw': '保證', 'vi': 'bảo đảm', 'zh': '保证'},
    'phenomenon':   {'ja': '現象', 'tw': '現象', 'vi': 'hiện tượng', 'zh': '现象'},
    'diversity':    {'ja': '多様性', 'tw': '多樣性', 'vi': 'sự đa dạng', 'zh': '多样性'},
    'negotiate':    {'ja': '交渉する', 'tw': '談判', 'vi': 'đàm phán', 'zh': '谈判'},
    'obligation':   {'ja': '義務', 'tw': '義務', 'vi': 'nghĩa vụ', 'zh': '义务'},
    'compromise':   {'ja': '妥協する', 'tw': '妥協', 'vi': 'thỏa hiệp', 'zh': '妥协'},
    'perceive':     {'ja': '認識する', 'tw': '感知', 'vi': 'nhận thức', 'zh': '感知'},
    'sustainable':  {'ja': '持続可能な', 'tw': '可持續的', 'vi': 'bền vững', 'zh': '可持续的'},
    'interpret':    {'ja': '解釈する', 'tw': '解釋', 'vi': 'giải thích', 'zh': '解释'},
    'transform':    {'ja': '変換する', 'tw': '轉變', 'vi': 'chuyển đổi', 'zh': '转变'},
    'crucial':      {'ja': '重要な', 'tw': '關鍵的', 'vi': 'quan trọng', 'zh': '关键的'},
    'adequate':     {'ja': '適切な', 'tw': '適當的', 'vi': 'phù hợp', 'zh': '适当的'},
    'coherent':     {'ja': '一貫した', 'tw': '連貫的', 'vi': 'mạch lạc', 'zh': '连贯的'},
    'explicit':     {'ja': '明示的な', 'tw': '明確的', 'vi': 'rõ ràng', 'zh': '明确的'},
    'implicit':     {'ja': '暗黙の', 'tw': '隱含的', 'vi': 'ngầm hiểu', 'zh': '隐含的'},
    'innovation':   {'ja': 'イノベーション', 'tw': '創新', 'vi': 'đổi mới', 'zh': '创新'},
    'evaluate':     {'ja': '評価する', 'tw': '評估', 'vi': 'đánh giá', 'zh': '评估'},
    'consequence':  {'ja': '結果', 'tw': '後果', 'vi': 'hậu quả', 'zh': '后果'},
    'perspective':  {'ja': '視点', 'tw': '觀點', 'vi': 'quan điểm', 'zh': '观点'},
    'constitute':   {'ja': '構成する', 'tw': '構成', 'vi': 'cấu thành', 'zh': '构成'},
    'parameter':    {'ja': 'パラメータ', 'tw': '參數', 'vi': 'tham số', 'zh': '参数'},
    'integrate':    {'ja': '統合する', 'tw': '整合', 'vi': 'tích hợp', 'zh': '整合'},
    'dynamic':      {'ja': 'ダイナミックな', 'tw': '動態的', 'vi': 'năng động', 'zh': '动态的'},
    'implement':    {'ja': '実装する', 'tw': '實施', 'vi': 'thực hiện', 'zh': '实施'},
    'catalyst':     {'ja': '触媒', 'tw': '催化劑', 'vi': 'chất xúc tác', 'zh': '催化剂'},
    'collaborate':  {'ja': '協力する', 'tw': '合作', 'vi': 'hợp tác', 'zh': '合作'},
    'benchmark':    {'ja': 'ベンチマーク', 'tw': '基準', 'vi': 'điểm chuẩn', 'zh': '基准'},
    'framework':    {'ja': '枠組み', 'tw': '框架', 'vi': 'khung', 'zh': '框架'},
    'algorithm':    {'ja': 'アルゴリズム', 'tw': '演算法', 'vi': 'thuật toán', 'zh': '算法'},
    'optimize':     {'ja': '最適化する', 'tw': '最佳化', 'vi': 'tối ưu hóa', 'zh': '优化'},
    'portfolio':    {'ja': 'ポートフォリオ', 'tw': '作品集', 'vi': 'hồ sơ', 'zh': '投资组合'},
    'efficiency':   {'ja': '効率性', 'tw': '效率', 'vi': 'hiệu quả', 'zh': '效率'},
    'momentum':     {'ja': '勢い', 'tw': '動力', 'vi': 'đà', 'zh': '动力'},
    'credibility':  {'ja': '信頼性', 'tw': '可信度', 'vi': 'độ tin cậy', 'zh': '可信度'},
    'resilience':   {'ja': '回復力', 'tw': '韌性', 'vi': 'khả năng phục hồi', 'zh': '韧性'},
    'transparency': {'ja': '透明性', 'tw': '透明度', 'vi': 'minh bạch', 'zh': '透明度'},
    'legitimacy':   {'ja': '正当性', 'tw': '合法性', 'vi': 'tính hợp pháp', 'zh': '合法性'},
    'consensus':    {'ja': '合意', 'tw': '共識', 'vi': 'đồng thuận', 'zh': '共识'},
    'dimension':    {'ja': '次元', 'tw': '維度', 'vi': 'chiều', 'zh': '维度'},
    'sophisticated':{'ja': '洗練された', 'tw': '複雜的', 'vi': 'tinh tế', 'zh': '复杂的'},
    'hierarchy':    {'ja': '階層', 'tw': '層級', 'vi': 'phân cấp', 'zh': '层级'},
    'autonomy':     {'ja': '自律性', 'tw': '自主性', 'vi': 'tự chủ', 'zh': '自主性'},
    'reconcile':    {'ja': '和解する', 'tw': '和解', 'vi': 'hòa giải', 'zh': '和解'},
    'dilemma':      {'ja': 'ジレンマ', 'tw': '困境', 'vi': 'tình huống khó xử', 'zh': '困境'},
    'paradigm':     {'ja': 'パラダイム', 'tw': '典範', 'vi': 'mô hình', 'zh': '范式'},
    'discipline':   {'ja': '規律', 'tw': '紀律', 'vi': 'kỷ luật', 'zh': '纪律'},
    'apparatus':    {'ja': '装置', 'tw': '裝置', 'vi': 'thiết bị', 'zh': '装置'},
    'formulate':    {'ja': '策定する', 'tw': '制定', 'vi': 'xây dựng', 'zh': '制定'},
    'articulate':   {'ja': '明確に表現する', 'tw': '清晰表達', 'vi': 'diễn đạt rõ ràng', 'zh': '清晰表达'},
    'elaborate':    {'ja': '詳述する', 'tw': '詳述', 'vi': 'trình bày chi tiết', 'zh': '详述'},
    'facilitate':   {'ja': '促進する', 'tw': '促進', 'vi': 'tạo điều kiện', 'zh': '促进'},
    'controversy':  {'ja': '論争', 'tw': '爭議', 'vi': 'tranh cãi', 'zh': '争议'},
    'indigenous':   {'ja': '先住民の', 'tw': '原住民的', 'vi': 'bản địa', 'zh': '土著的'},
    'testimony':    {'ja': '証言', 'tw': '證詞', 'vi': 'chứng lời', 'zh': '证词'},
    'coherence':    {'ja': '一貫性', 'tw': '連貫性', 'vi': 'sự mạch lạc', 'zh': '连贯性'},
    'criterion':    {'ja': '基準', 'tw': '標準', 'vi': 'tiêu chí', 'zh': '标准'},
    'infrastructure':{'ja': 'インフラ', 'tw': '基礎建設', 'vi': 'cơ sở hạ tầng', 'zh': '基础设施'},
    'conviction':   {'ja': '確信', 'tw': '信念', 'vi': 'niềm tin', 'zh': '信念'},
    'correlation':  {'ja': '相関', 'tw': '相關', 'vi': 'tương quan', 'zh': '相关'},
    'magnitude':    {'ja': '大きさ', 'tw': '規模', 'vi': 'độ lớn', 'zh': '规模'},
    'hypothesis':   {'ja': '仮説', 'tw': '假說', 'vi': 'giả thuyết', 'zh': '假说'},
    'jurisdiction': {'ja': '管轄権', 'tw': '管轄權', 'vi': 'thẩm quyền', 'zh': '管辖权'},
    'empirical':    {'ja': '経験的な', 'tw': '實證的', 'vi': 'thực nghiệm', 'zh': '实证的'},
    'perpetual':    {'ja': '永続的な', 'tw': '永久的', 'vi': 'vĩnh viễn', 'zh': '永久的'},
    'bureaucracy':  {'ja': '官僚主義', 'tw': '官僚主義', 'vi': 'quan liêu', 'zh': '官僚主义'},
    'enigma':       {'ja': '謎', 'tw': '謎', 'vi': 'bí ẩn', 'zh': '谜'},
    'legislation':  {'ja': '立法', 'tw': '立法', 'vi': 'lập pháp', 'zh': '立法'},
    'sanctuary':    {'ja': '聖域', 'tw': '避難所', 'vi': 'nơi trú ẩn', 'zh': '避难所'},
    'arbitration':  {'ja': '仲裁', 'tw': '仲裁', 'vi': 'trọng tài', 'zh': '仲裁'},
    'diplomacy':    {'ja': '外交', 'tw': '外交', 'vi': 'ngoại giao', 'zh': '外交'},
    'sovereignty':  {'ja': '主権', 'tw': '主權', 'vi': 'chủ quyền', 'zh': '主权'},
    'propaganda':   {'ja': 'プロパガンダ', 'tw': '宣傳', 'vi': 'tuyên truyền', 'zh': '宣传'},
    'eloquent':     {'ja': '雄弁な', 'tw': '雄辯的', 'vi': 'hùng hồn', 'zh': '雄辩的'},
    'rhetoric':     {'ja': '修辞学', 'tw': '修辭', 'vi': 'tu từ', 'zh': '修辞'},
    'allegiance':   {'ja': '忠誠', 'tw': '忠誠', 'vi': 'lòng trung thành', 'zh': '忠诚'},
    'cynical':      {'ja': '皮肉な', 'tw': '憤世嫉俗的', 'vi': 'hoài nghi', 'zh': '愤世嫉俗的'},
    'empiricism':   {'ja': '経験主義', 'tw': '經驗主義', 'vi': 'chủ nghĩa kinh nghiệm', 'zh': '经验主义'},
    'pragmatic':    {'ja': '実用的な', 'tw': '實用的', 'vi': 'thực dụng', 'zh': '实用的'},
    'rationale':    {'ja': '根拠', 'tw': '理由', 'vi': 'lý do', 'zh': '理由'},
    'subsidy':      {'ja': '補助金', 'tw': '補貼', 'vi': 'trợ cấp', 'zh': '补贴'},
    'volatile':     {'ja': '不安定な', 'tw': '不穩定的', 'vi': 'dễ biến động', 'zh': '不稳定的'},
    'stipulate':    {'ja': '規定する', 'tw': '規定', 'vi': 'quy định', 'zh': '规定'},
    'deprecate':    {'ja': '非推奨にする', 'tw': '棄用', 'vi': 'không dùng nữa', 'zh': '弃用'},
    'mitigate':     {'ja': '緩和する', 'tw': '緩解', 'vi': 'giảm nhẹ', 'zh': '缓解'},
    'proliferate':  {'ja': '急増する', 'tw': '激增', 'vi': 'sinh sôi nảy nở', 'zh': '激增'},
    'exacerbate':   {'ja': '悪化させる', 'tw': '加劇', 'vi': 'làm trầm trọng thêm', 'zh': '加剧'},
    'conscientious':{'ja': '良心的な', 'tw': '認真負責的', 'vi': 'có lương tâm', 'zh': '认真负责的'},
    'ambiguous':    {'ja': '曖昧な', 'tw': '模糊的', 'vi': 'mơ hồ', 'zh': '模糊的'},
    'precarious':   {'ja': '不安定な', 'tw': '不穩定的', 'vi': 'bấp bênh', 'zh': '不稳定的'},
    'meticulous':   {'ja': '几帳面な', 'tw': '一絲不苟的', 'vi': 'tỉ mỉ', 'zh': '一丝不苟的'},
    'ambivalent':   {'ja': '曖昧な態度の', 'tw': '矛盾的', 'vi': 'lưỡng lự', 'zh': '矛盾的'},
    'inevitable':   {'ja': '避けられない', 'tw': '不可避免的', 'vi': 'không thể tránh khỏi', 'zh': '不可避免的'},
    'tenacious':    {'ja': 'しつこい', 'tw': '堅韌的', 'vi': 'kiên trì', 'zh': '坚韧的'},
    'pragmatism':   {'ja': '実用主義', 'tw': '實用主義', 'vi': 'chủ nghĩa thực dụng', 'zh': '实用主义'},
    'stagnant':     {'ja': '停滞した', 'tw': '停滯的', 'vi': 'trì trệ', 'zh': '停滞的'},
    'ostensible':   {'ja': '表向きの', 'tw': '表面上的', 'vi': 'bề ngoài', 'zh': '表面上的'},
    'ubiquitous':   {'ja': 'どこにでもある', 'tw': '無處不在的', 'vi': 'có mặt khắp nơi', 'zh': '无处不在的'},
    'encompass':    {'ja': '包括する', 'tw': '包含', 'vi': 'bao gồm', 'zh': '包含'},
    'reciprocal':   {'ja': '相互的な', 'tw': '相互的', 'vi': 'qua lại', 'zh': '相互的'},
    'symmetry':     {'ja': '対称', 'tw': '對稱', 'vi': 'đối xứng', 'zh': '对称'},
    'nuance':       {'ja': 'ニュアンス', 'tw': '細微差別', 'vi': 'sắc thái', 'zh': '细微差别'},
    'eloquence':    {'ja': '雄弁', 'tw': '雄辯', 'vi': 'sự hùng hồn', 'zh': '雄辩'},
    'archetype':    {'ja': '原型', 'tw': '原型', 'vi': 'nguyên mẫu', 'zh': '原型'},
    'dogmatic':     {'ja': '独断的な', 'tw': '教條主義的', 'vi': 'giáo điều', 'zh': '教条主义的'},
    'eclectic':     {'ja': '折衷的な', 'tw': '折衷的', 'vi': 'chiết trung', 'zh': '折衷的'},
    'paradox':      {'ja': 'パラドックス', 'tw': '悖論', 'vi': 'nghịch lý', 'zh': '悖论'},
    'dissent':      {'ja': '反対する', 'tw': '異議', 'vi': 'phản đối', 'zh': '异议'},
    'nostalgia':    {'ja': 'ノスタルジア', 'tw': '懷舊', 'vi': 'hoài niệm', 'zh': '怀旧'},
    'juxtapose':    {'ja': '並置する', 'tw': '並列', 'vi': 'đặt cạnh nhau', 'zh': '并置'},
    'obsolete':     {'ja': '時代遅れの', 'tw': '過時的', 'vi': 'lỗi thời', 'zh': '过时的'},
    'assimilate':   {'ja': '同化する', 'tw': '同化', 'vi': 'đồng hóa', 'zh': '同化'},
    'vindicate':    {'ja': '無実を証明する', 'tw': '平反', 'vi': 'minh oan', 'zh': '平反'},
    'profound':     {'ja': '深い', 'tw': '深刻的', 'vi': 'sâu sắc', 'zh': '深刻的'},
    'mundane':      {'ja': '平凡な', 'tw': '平凡的', 'vi': 'tầm thường', 'zh': '平凡的'},
    'nuanced':      {'ja': 'ニュアンスのある', 'tw': '細緻的', 'vi': 'tinh tế', 'zh': '细致的'},
    'ethereal':     {'ja': '幽玄な', 'tw': '空靈的', 'vi': 'hư ảo', 'zh': '空灵的'},
    'altruistic':   {'ja': '利他的な', 'tw': '利他的', 'vi': 'vị tha', 'zh': '利他的'},
    'ephemeral':    {'ja': '儚い', 'tw': '短暫的', 'vi': 'phù du', 'zh': '短暂的'},
    'perpetuate':   {'ja': '永続させる', 'tw': '使永久化', 'vi': 'làm tồn tại mãi', 'zh': '使永久化'},
    'evolve':       {'ja': '進化する', 'tw': '進化', 'vi': 'tiến hóa', 'zh': '进化'},
    'cognition':    {'ja': '認知', 'tw': '認知', 'vi': 'nhận thức', 'zh': '认知'},
    'conjecture':   {'ja': '推測', 'tw': '推測', 'vi': 'suy đoán', 'zh': '推测'},
    'scrutinize':   {'ja': '精査する', 'tw': '仔細審查', 'vi': 'xem xét kỹ', 'zh': '仔细审查'},
    'antiquated':   {'ja': '旧式の', 'tw': '陳舊的', 'vi': 'cổ lỗi', 'zh': '陈旧的'},
    'expedite':     {'ja': '迅速に処理する', 'tw': '加快', 'vi': 'đẩy nhanh', 'zh': '加快'},
    'corroborate':  {'ja': '裏付ける', 'tw': '確認', 'vi': 'xác nhận', 'zh': '证实'},
    'inveterate':   {'ja': '根深い', 'tw': '根深蒂固的', 'vi': 'có thói quen lâu đời', 'zh': '根深蒂固的'},
    'equivocal':    {'ja': '曖昧な', 'tw': '模棱兩可的', 'vi': 'mơ hồ', 'zh': '模棱两可的'},
    'culminate':    {'ja': '頂点に達する', 'tw': '達到高潮', 'vi': 'đạt đỉnh điểm', 'zh': '达到顶点'},
    'emulate':      {'ja': '模倣する', 'tw': '仿效', 'vi': 'mô phỏng', 'zh': '仿效'},
    'accolade':     {'ja': '称賛', 'tw': '褒獎', 'vi': 'khen ngợi', 'zh': '褒奖'},
    'renown':       {'ja': '名声', 'tw': '聲望', 'vi': 'danh tiếng', 'zh': '声望'},
    'integrity':    {'ja': '誠実さ', 'tw': '誠信', 'vi': 'liêm chính', 'zh': '诚信'},
    'diligent':     {'ja': '勤勉な', 'tw': '勤勉的', 'vi': 'chăm chỉ', 'zh': '勤勉的'},
    'persevere':    {'ja': '耐える', 'tw': '堅持', 'vi': 'kiên nhẫn', 'zh': '坚持'},
    'petition':     {'ja': '請願する', 'tw': '請願', 'vi': 'thỉnh nguyện', 'zh': '请愿'},
    'mechanism':    {'ja': 'メカニズム', 'tw': '機制', 'vi': 'cơ chế', 'zh': '机制'},
    'initiative':   {'ja': '主導権', 'tw': '主動', 'vi': 'sáng kiến', 'zh': '主动'},
    'transcript':   {'ja': '記録', 'tw': '成績單', 'vi': 'bản ghi', 'zh': '成绩单'},
    'justice':      {'ja': '正義', 'tw': '正義', 'vi': 'công lý', 'zh': '正义'},
    'reform':       {'ja': '改革する', 'tw': '改革', 'vi': 'cải cách', 'zh': '改革'},
    'donate':       {'ja': '寄付する', 'tw': '捐贈', 'vi': 'quyên góp', 'zh': '捐赠'},
    'welfare':      {'ja': '福祉', 'tw': '福利', 'vi': 'phúc lợi', 'zh': '福利'},
    'charter':      {'ja': '憲章', 'tw': '憲章', 'vi': 'hiến chương', 'zh': '宪章'},
    'geography':    {'ja': '地理学', 'tw': '地理學', 'vi': 'địa lý học', 'zh': '地理学'},
    'theology':     {'ja': '神学', 'tw': '神學', 'vi': 'thần học', 'zh': '神学'},
    'parallel':     {'ja': '平行な', 'tw': '平行的', 'vi': 'song song', 'zh': '平行的'},
    'journal':      {'ja': 'ジャーナル', 'tw': '日誌', 'vi': 'tạp chí', 'zh': '日志'},
    'justify':      {'ja': '正当化する', 'tw': '正當化', 'vi': 'biện minh', 'zh': '正当化'},
    'heritage':     {'ja': '遺産', 'tw': '遺產', 'vi': 'di sản', 'zh': '遗产'},
    'edition':      {'ja': '版', 'tw': '版本', 'vi': 'ấn bản', 'zh': '版本'},
    'bridge':       {'ja': '橋', 'tw': '橋', 'vi': 'cầu', 'zh': '桥'},
    'announce':     {'ja': '発表する', 'tw': '宣布', 'vi': 'thông báo', 'zh': '宣布'},
    'database':     {'ja': 'データベース', 'tw': '資料庫', 'vi': 'cơ sở dữ liệu', 'zh': '数据库'},
    'matter':       {'ja': '重要だ', 'tw': '重要', 'vi': 'quan trọng', 'zh': '重要'},
    'jacket':       {'ja': 'ジャケット', 'tw': '夾克', 'vi': 'áo khoác', 'zh': '夹克'},
    'passion':      {'ja': '情熱', 'tw': '熱情', 'vi': 'đam mê', 'zh': '热情'},
    'relay':        {'ja': 'リレー', 'tw': '傳遞', 'vi': 'tiếp sức', 'zh': '传递'},
    'adapt':        {'ja': '適応する', 'tw': '適應', 'vi': 'thích nghi', 'zh': '适应'},
    'exact':        {'ja': '正確な', 'tw': '精確的', 'vi': 'chính xác', 'zh': '精确的'},
    'impact':       {'ja': '影響', 'tw': '影響', 'vi': 'tác động', 'zh': '影响'},
    'topic':        {'ja': 'トピック', 'tw': '話題', 'vi': 'chủ đề', 'zh': '话题'},
    'junction':     {'ja': '交差点', 'tw': '交叉點', 'vi': 'ngã tư', 'zh': '交叉点'},
    'boundary':     {'ja': '境界', 'tw': '邊界', 'vi': 'ranh giới', 'zh': '边界'},
    'maximize':     {'ja': '最大化する', 'tw': '最大化', 'vi': 'tối đa hóa', 'zh': '最大化'},
    'sample':       {'ja': 'サンプル', 'tw': '樣本', 'vi': 'mẫu', 'zh': '样本'},
    'timeline':     {'ja': 'タイムライン', 'tw': '時間表', 'vi': 'dòng thời gian', 'zh': '时间轴'},
    'journey':      {'ja': '旅', 'tw': '旅程', 'vi': 'hành trình', 'zh': '旅程'},
    'kinetic':      {'ja': '動的な', 'tw': '動能的', 'vi': 'động năng', 'zh': '动能的'},
    'patent':       {'ja': '特許', 'tw': '專利', 'vi': 'bằng sáng chế', 'zh': '专利'},
    'benefit':      {'ja': '利益', 'tw': '好處', 'vi': 'lợi ích', 'zh': '利益'},
    'survey':       {'ja': '調査する', 'tw': '調查', 'vi': 'khảo sát', 'zh': '调查'},
    'tendency':     {'ja': '傾向', 'tw': '趨勢', 'vi': 'xu hướng', 'zh': '趋势'},
    'keen':         {'ja': '熱心な', 'tw': '熱衷的', 'vi': 'nhiệt tình', 'zh': '热衷的'},
    'annual':       {'ja': '年間の', 'tw': '年度的', 'vi': 'hàng năm', 'zh': '年度的'},
    'merge':        {'ja': '合併する', 'tw': '合併', 'vi': 'sáp nhập', 'zh': '合并'},
    'legitimate':   {'ja': '合法的な', 'tw': '合法的', 'vi': 'hợp pháp', 'zh': '合法的'},
    'regime':       {'ja': '体制', 'tw': '政權', 'vi': 'chế độ', 'zh': '政权'},
    'warrant':      {'ja': '正当化する', 'tw': '授權', 'vi': 'lệnh', 'zh': '授权'},
    'contrast':     {'ja': '対比する', 'tw': '對比', 'vi': 'tương phản', 'zh': '对比'},
}

# 레벨별 이미 사용된 대체 단어를 추적 (중복 방지)
used_replacements_by_level = {}

def get_replacement(word_lower, level):
    """순수 인명이면 대체 단어 반환, KEEP_WORDS면 None 반환"""
    if word_lower in KEEP_WORDS:
        return None
    repl = NAME_REPLACEMENTS.get(word_lower)
    if repl is None:
        return None
    repl_word, repl_meaning = repl
    
    # 같은 레벨에 이미 사용된 단어면 스킵 (중복 방지)
    level_used = used_replacements_by_level.get(level, set())
    if repl_word in level_used:
        # 대체어 뒤에 번호를 붙이거나 다른 단어 사용 - 여기서는 스킵
        print(f"  [SKIP] 레벨{level} {word_lower} -> {repl_word} 이미 사용됨, 스킵")
        return None
    
    if level not in used_replacements_by_level:
        used_replacements_by_level[level] = set()
    used_replacements_by_level[level].add(repl_word)
    return (repl_word, repl_meaning)

def build_new_options_ko(correct_meaning, level_words, current_id, core_data):
    """레벨 내 다른 단어들의 한국어 의미로 오답 옵션 3개 구성"""
    pool = []
    for ld in core_data:
        if ld['level'] == level_words:
            for w in ld['words']:
                if w['id'] != current_id:
                    pool.append(w['m'])
    import random
    random.seed(hash(current_id))
    distractors = [m for m in pool if m != correct_meaning]
    random.shuffle(distractors)
    distractors = distractors[:3]
    while len(distractors) < 3:
        distractors.append('unknown')
    
    # answer_index = 0으로 통일 (정답을 첫번째로)
    options = [correct_meaning] + distractors
    return options, 0

def build_new_options_lang(correct_trans, word_id, lang_data, core_data, level):
    """다국어 파일의 오답 옵션 구성 - 같은 레벨 단어의 번역에서 추출"""
    # 같은 레벨의 단어 ID들 찾기
    level_ids = []
    for ld in core_data:
        if ld['level'] == level:
            for w in ld['words']:
                level_ids.append(w['id'])
    
    pool = []
    for lid in level_ids:
        if lid != word_id and lid in lang_data:
            for opt in lang_data[lid]:
                if opt not in pool:
                    pool.append(opt)
    
    import random
    random.seed(hash(word_id + '_lang'))
    distractors = [o for o in pool if o != correct_trans]
    random.shuffle(distractors)
    distractors = distractors[:3]
    while len(distractors) < 3:
        distractors.append(correct_trans)
    
    # answer_index = 0 (정답 첫번째)
    new_options = [correct_trans] + distractors
    return new_options

# ============================================================
# 메인 처리
# ============================================================

print("파일 로딩 중...")
with open(r'app\src\data\vocaDB_core.json', encoding='utf-8') as f:
    core_data = json.load(f)

lang_files = {
    'ja': r'app\src\data\vocaDB_ja.json',
    'tw': r'app\src\data\vocaDB_tw.json',
    'vi': r'app\src\data\vocaDB_vi.json',
    'zh': r'app\src\data\vocaDB_zh.json',
}

lang_data = {}
for lang, path in lang_files.items():
    with open(path, encoding='utf-8') as f:
        lang_data[lang] = json.load(f)

# 순수 인명 목록
pure_names = {
    'jonathan','lawrence','sean','lisa','larry','alice','albert','carl','laura',
    'steven','susan','terry','emma','greg','margaret','parker','christopher',
    'oliver','douglas','jose','barbara','helen','jennifer','samuel','stanley',
    'cole','craig','jessica','keith','kent','madison','tyler','michelle','neil',
    'rachel','emily','kyle','mason','nancy','vincent','nathan','brad','juan',
    'julia','pete','dennis','julie','karen','marcus','todd','lucy','penny',
    'linda','stan','dylan','ellen','hannah','ruth','marc','nicholas','angela',
    'carol','diana','derek','joan','leonard','travis','louise','alfred','julian',
    'claire','lauren','wade','joel','sally','florence','janet','monica','rebecca',
    'sara','frederick','troy','chad','liam','noah','betty','joey','joshua',
    'leon','seth','sharon','sophie','gilbert','griffin','jeffrey','walt','homer',
    'jenny','andrea','kurt','beth','glen','heather','molly','brett','ivan',
    'joyce','lynn','trevor','nina','donna','felix','melissa','wendy','diane',
    'floyd','katherine','olivia','dana','chester','eleanor','jill','nate',
    'shawn','stephanie','clara','maggie','sandra','darren','evan','judy','megan',
    'phillip','allison','dorothy','alison','brooke','claude','darwin','freddie',
    'heath','hugo','patricia','tina','zach','elena','alexis','bella','elliot',
    'gavin','emmy','gloria','shirley','clyde','ernest','marilyn','rory',
    # 추가 이름들
    'peter','michael','kevin','scott','james','robert','richard','david',
    'william','charles','george','thomas','paul','john','joseph','henry',
    'edward','brian','andrew','daniel','matthew','jack','jason','ryan',
    'adam','eric','ian','tom','jim','bob','max','sam','tim','joe',
    'kim','pat','ben','sue','ted','ken','ann','meg','leo','roger',
    'walter','philip',
}

replaced_count = 0
skipped_count = 0
changes = []

print("교체 작업 시작...")

for level_obj in core_data:
    level = level_obj['level']
    for word_obj in level_obj['words']:
        w_lower = word_obj['w'].lower()
        if w_lower not in pure_names:
            continue
        if w_lower in KEEP_WORDS:
            continue
        
        repl = get_replacement(w_lower, level)
        if repl is None:
            skipped_count += 1
            continue
        
        new_word, new_meaning = repl
        word_id = word_obj['id']
        old_word = word_obj['w']
        old_meaning = word_obj['m']
        
        # core 업데이트
        word_obj['w'] = new_word
        word_obj['m'] = new_meaning
        
        # 한국어 옵션 재구성
        new_opts, new_ai = build_new_options_ko(new_meaning, level, word_id, core_data)
        word_obj['o'] = new_opts
        word_obj['ai'] = new_ai
        
        # 다국어 옵션 업데이트
        for lang in ['ja', 'tw', 'vi', 'zh']:
            if word_id in lang_data[lang]:
                correct_trans = MULTILANG.get(new_word, {}).get(lang, new_meaning)
                new_lang_opts = build_new_options_lang(
                    correct_trans, word_id, lang_data[lang], core_data, level
                )
                lang_data[lang][word_id] = new_lang_opts
        
        changes.append(f"레벨{level:3d}: [{old_word}({old_meaning})] -> [{new_word}({new_meaning})]")
        replaced_count += 1

print(f"\n=== 교체 완료 ===")
print(f"교체: {replaced_count}개 / 스킵: {skipped_count}개")
print("\n변경 목록:")
for c in changes:
    print(" ", c)

# 저장
print("\n파일 저장 중...")
with open(r'app\src\data\vocaDB_core.json', 'w', encoding='utf-8') as f:
    json.dump(core_data, f, ensure_ascii=False, indent=2)

for lang, path in lang_files.items():
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(lang_data[lang], f, ensure_ascii=False, indent=2)

print("저장 완료!")
