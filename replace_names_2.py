"""
2차 교체: 잔여 순수 인명 처리 (레벨 1~135)
이중의미 단어들은 제외하고 순수 인명만 교체
"""

import json
import random

# 이중의미 유지 단어
KEEP_WORDS = {
    'will', 'june', 'bill', 'mark', 'frank', 'grace', 'rose', 'christmas',
    'christian', 'virginia', 'angel', 'charity', 'duke', 'dean', 'gene',
    'crystal', 'robin', 'anne', 'victor', 'earl', 'ally', 'ruby', 'amber',
    'lily', 'daisy', 'jade', 'holly', 'iris', 'norm', 'abbey', 'oscar',
    'harvey', 'drew', 'dallas', 'houston', 'jordan', 'philip',
}

# 2차 교체 매핑 (순수 인명 → 레벨 적합 단어)
REPLACEMENTS_2 = {
    # 레벨 47 - 기초 일상 단어 수준
    'chris':        ('chart',       '도표/차트'),
    # 레벨 48
    'mike':         ('model',       '모형/모델'),
    # 레벨 50
    'mary':         ('marry',       '결혼하다'),
    # 레벨 56
    'harry':        ('carry',       '나르다/운반하다'),
    # 레벨 68
    'tony':         ('pony',        '조랑말'),
    # 레벨 70
    'alex':         ('flex',        '굽히다/유연하게 하다'),
    # 레벨 75
    'nick':         ('thick',       '두꺼운'),
    # 레벨 87
    'jordan':       ('warden',      '관리인/교도관'),
    # 레벨 92
    'howard':       ('toward',      '~쪽으로'),
    # 레벨 93
    'sarah':        ('stare',       '응시하다'),
    'simon':        ('lemon',       '레몬'),
    # 레벨 94
    'elizabeth':    ('elaborate',   '정교하게 만들다'),
    # 레벨 96
    'donald':       ('expand',      '확장하다'),
    # 레벨 98
    'alan':         ('plan',        '계획하다'),
    # 레벨 99
    'jeff':         ('chef',        '요리사'),
    'luke':         ('fluke',       '운/요행'),
    # 레벨 101
    'jimmy':        ('shimmy',      '떨다/흔들리다'),
    'kelly':        ('belly',       '배/복부'),
    # 레벨 102
    'victoria':     ('factor',      '요인/인수'),
    'andy':         ('handy',       '편리한'),
    'charlie':      ('barley',      '보리'),
    # 레벨 105
    'jane':         ('crane',       '두루미/기중기'),
    # 레벨 106
    'anthony':      ('harmony',     '조화'),
    # 레벨 108
    'alexander':    ('semester',    '학기'),
    # 레벨 111
    'gary':         ('vary',        '다양하다/변하다'),
    # 레벨 112
    'ross':         None,       # KEEP
    'clark':        None,       # KEEP (성)
    # 레벨 114
    'anna':         ('manner',      '방식/예절'),
    'gordon':       ('cordon',      '경계선/저지선'),
    # 레벨 115
    'phil':         ('skill',       '기술/솜씨'),
    'wayne':        ('wane',        '줄어들다/기울다'),
    # 레벨 117
    'jean':         ('lean',        '기대다/마른'),
    # 레벨 119
    'johnny':       ('balcony',     '발코니'),
    # 레벨 120
    'bruce':        ('truce',       '휴전'),
    # 레벨 121
    'kate':         ('debate',      '토론하다'),
    'maria':        ('mania',       '열광/광적 흥미'),
    # 레벨 124
    'anne':         None,   # KEEP (anne은 흔한 일반 이름)
    # 레벨 124 - robin 제외(이중의미)
    # 레벨 125
    'justin':       ('adjust',      '조정하다'),
    # 레벨 126
    'rick':         ('trick',       '속임수/재주'),
    # 레벨 135
    'philip':       None,   # KEEP (philip = phillip의 다른 철자)
}

# 다국어 번역
MULTILANG_2 = {
    'chart':      {'ja': '図表', 'tw': '圖表', 'vi': 'biểu đồ', 'zh': '图表'},
    'model':      {'ja': 'モデル', 'tw': '模型', 'vi': 'mô hình', 'zh': '模型'},
    'marry':      {'ja': '結婚する', 'tw': '結婚', 'vi': 'kết hôn', 'zh': '结婚'},
    'carry':      {'ja': '運ぶ', 'tw': '攜帶', 'vi': 'mang', 'zh': '携带'},
    'pony':       {'ja': 'ポニー', 'tw': '小馬', 'vi': 'ngựa con', 'zh': '小马'},
    'flex':       {'ja': '曲げる', 'tw': '彎曲', 'vi': 'uốn cong', 'zh': '弯曲'},
    'thick':      {'ja': '厚い', 'tw': '厚的', 'vi': 'dày', 'zh': '厚的'},
    'warden':     {'ja': '管理人', 'tw': '管理員', 'vi': 'người quản lý', 'zh': '管理员'},
    'toward':     {'ja': '〜に向かって', 'tw': '向', 'vi': 'về phía', 'zh': '向'},
    'stare':      {'ja': '見つめる', 'tw': '凝視', 'vi': 'nhìn chằm chằm', 'zh': '凝视'},
    'lemon':      {'ja': 'レモン', 'tw': '檸檬', 'vi': 'chanh', 'zh': '柠檬'},
    'elaborate':  {'ja': '詳述する', 'tw': '詳細說明', 'vi': 'trình bày chi tiết', 'zh': '详细说明'},
    'expand':     {'ja': '拡大する', 'tw': '擴展', 'vi': 'mở rộng', 'zh': '扩展'},
    'plan':       {'ja': '計画する', 'tw': '計劃', 'vi': 'lập kế hoạch', 'zh': '计划'},
    'chef':       {'ja': 'シェフ', 'tw': '廚師', 'vi': 'đầu bếp', 'zh': '厨师'},
    'fluke':      {'ja': '幸運', 'tw': '意外收穫', 'vi': 'may mắn tình cờ', 'zh': '意外收获'},
    'shimmy':     {'ja': '揺れる', 'tw': '抖動', 'vi': 'rung', 'zh': '抖动'},
    'belly':      {'ja': 'お腹', 'tw': '腹部', 'vi': 'bụng', 'zh': '腹部'},
    'factor':     {'ja': '要因', 'tw': '因素', 'vi': 'yếu tố', 'zh': '因素'},
    'handy':      {'ja': '便利な', 'tw': '方便的', 'vi': 'tiện dụng', 'zh': '方便的'},
    'barley':     {'ja': '大麦', 'tw': '大麥', 'vi': 'lúa mạch', 'zh': '大麦'},
    'crane':      {'ja': 'クレーン/鶴', 'tw': '起重機/鶴', 'vi': 'cần cẩu/hạc', 'zh': '起重机/鹤'},
    'harmony':    {'ja': 'ハーモニー', 'tw': '和諧', 'vi': 'sự hài hòa', 'zh': '和谐'},
    'semester':   {'ja': '学期', 'tw': '學期', 'vi': 'học kỳ', 'zh': '学期'},
    'vary':       {'ja': '変わる', 'tw': '變化', 'vi': 'thay đổi', 'zh': '变化'},
    'manner':     {'ja': 'マナー', 'tw': '方式', 'vi': 'cách thức', 'zh': '方式'},
    'cordon':     {'ja': '非常線', 'tw': '警戒線', 'vi': 'phong tỏa', 'zh': '警戒线'},
    'skill':      {'ja': 'スキル', 'tw': '技能', 'vi': 'kỹ năng', 'zh': '技能'},
    'wane':       {'ja': '衰える', 'tw': '減弱', 'vi': 'giảm dần', 'zh': '减弱'},
    'lean':       {'ja': '寄りかかる', 'tw': '傾斜', 'vi': 'dựa vào', 'zh': '倚靠'},
    'balcony':    {'ja': 'バルコニー', 'tw': '陽台', 'vi': 'ban công', 'zh': '阳台'},
    'truce':      {'ja': '休戦', 'tw': '停戰', 'vi': 'đình chiến', 'zh': '停战'},
    'debate':     {'ja': '討論する', 'tw': '辯論', 'vi': 'tranh luận', 'zh': '辩论'},
    'mania':      {'ja': '熱狂', 'tw': '狂熱', 'vi': 'niềm cuồng nhiệt', 'zh': '狂热'},
    'adjust':     {'ja': '調整する', 'tw': '調整', 'vi': 'điều chỉnh', 'zh': '调整'},
    'trick':      {'ja': 'トリック', 'tw': '把戲', 'vi': 'thủ thuật', 'zh': '把戏'},
}

print("파일 로딩...")
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

def build_options_ko(correct, level, word_id, core_data):
    pool = []
    for ld in core_data:
        if ld['level'] == level:
            for w in ld['words']:
                if w['id'] != word_id:
                    pool.append(w['m'])
    random.seed(hash(word_id + '_ko2'))
    distractors = [m for m in pool if m != correct]
    random.shuffle(distractors)
    distractors = distractors[:3]
    while len(distractors) < 3:
        distractors.append('기타')
    return [correct] + distractors, 0

def build_options_lang(correct_trans, word_id, lang_data_single, core_data, level):
    level_ids = []
    for ld in core_data:
        if ld['level'] == level:
            for w in ld['words']:
                level_ids.append(w['id'])
    pool = []
    for lid in level_ids:
        if lid != word_id and lid in lang_data_single:
            for opt in lang_data_single[lid]:
                if opt not in pool:
                    pool.append(opt)
    random.seed(hash(word_id + '_lang2'))
    distractors = [o for o in pool if o != correct_trans]
    random.shuffle(distractors)
    distractors = distractors[:3]
    while len(distractors) < 3:
        distractors.append(correct_trans)
    return [correct_trans] + distractors

replaced = 0
for level_obj in core_data:
    level = level_obj['level']
    for word_obj in level_obj['words']:
        w_lower = word_obj['w'].lower()
        if w_lower not in REPLACEMENTS_2:
            continue
        repl = REPLACEMENTS_2[w_lower]
        if repl is None:
            continue  # KEEP

        new_word, new_meaning = repl
        word_id = word_obj['id']
        old_word = word_obj['w']

        word_obj['w'] = new_word
        word_obj['m'] = new_meaning
        new_opts, new_ai = build_options_ko(new_meaning, level, word_id, core_data)
        word_obj['o'] = new_opts
        word_obj['ai'] = new_ai

        for lang in ['ja', 'tw', 'vi', 'zh']:
            if word_id in lang_data[lang]:
                correct_trans = MULTILANG_2.get(new_word, {}).get(lang, new_meaning)
                lang_data[lang][word_id] = build_options_lang(
                    correct_trans, word_id, lang_data[lang], core_data, level
                )

        print(f"  레벨{level:3d}: [{old_word}] -> [{new_word}({new_meaning})]")
        replaced += 1

print(f"\n총 {replaced}개 추가 교체 완료")

print("저장 중...")
with open(r'app\src\data\vocaDB_core.json', 'w', encoding='utf-8') as f:
    json.dump(core_data, f, ensure_ascii=False, indent=2)
for lang, path in lang_files.items():
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(lang_data[lang], f, ensure_ascii=False, indent=2)
print("저장 완료!")
