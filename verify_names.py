import json

files = [
    r'app\src\data\vocaDB_core.json',
    r'app\src\data\vocaDB_ja.json',
    r'app\src\data\vocaDB_tw.json',
    r'app\src\data\vocaDB_vi.json',
    r'app\src\data\vocaDB_zh.json',
]
all_ok = True
for f in files:
    try:
        with open(f, encoding='utf-8') as fp:
            data = json.load(fp)
        print(f'[OK] {f}')
    except Exception as e:
        print(f'[ERROR] {f}: {e}')
        all_ok = False

if all_ok:
    print('\n모든 JSON 파일 유효성 검사 통과!')

# 교체 결과 샘플 확인
with open(r'app\src\data\vocaDB_core.json', encoding='utf-8') as f:
    core = json.load(f)

print('\n=== 교체 결과 샘플 ===')
sample_words = ['challenge', 'strategy', 'innovation', 'algorithm', 'resilience', 'paradox', 'chart', 'carry']
for lv in core:
    for w in lv['words']:
        if w['w'] in sample_words:
            print(f"  레벨{lv['level']:3d}: {w['w']} = {w['m']} / 옵션수: {len(w['o'])}")
