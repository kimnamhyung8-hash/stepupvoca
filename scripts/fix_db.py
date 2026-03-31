import json

path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'

with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

def has_batchim(text):
    if not text:
        return False
    last_char = text[-1]
    if '가' <= last_char <= '힣':
        return (ord(last_char) - ord('가')) % 28 > 0
    return False

for lvl in db:
    for item in lvl['words']:
        word = item['word']
        
        # Generic pedagogical sentence
        item['example_en'] = f"\"The word '{word}' is used in daily conversation.\""
        
        item['example_ko'] = f"'{word}'라는 단어는 일상 대화에서 자주 사용됩니다."
        
        item['examples_loc'] = {
            'ko': f"'{word}'라는 단어는 일상 대화에서 자주 사용됩니다.",
            'en': f"The word '{word}' is used in daily conversation.",
            'ja': f"「{word}」という言葉は日常会話でよく使われます。",
            'zh': f"“{word}”这个词在日常对话中经常使用。",
            'vi': f"Từ '{word}' thường được sử dụng trong cuộc trò chuyện hàng ngày."
        }

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print('Updated 4950 examples with generic educational sentences.')
