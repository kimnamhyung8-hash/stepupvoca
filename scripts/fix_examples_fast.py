import json
from deep_translator import GoogleTranslator

db_path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'

with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Find all unique english examples
unique_examples = set()
for lvl in db:
    for word_obj in lvl['words']:
        ex_en = word_obj.get('example_en', "").strip()
        if ex_en:
            unique_examples.add(ex_en)

print(f"Found {len(unique_examples)} unique example sentences.")

ko_translator = GoogleTranslator(source='en', target='ko')
ja_translator = GoogleTranslator(source='en', target='ja')
vi_translator = GoogleTranslator(source='en', target='vi')

translation_map = {}
for i, ex_en in enumerate(list(unique_examples)):
    print(f"Translating {i+1}/{len(unique_examples)}: {ex_en}")
    try:
        t_ko = ko_translator.translate(text=ex_en)
        t_ja = ja_translator.translate(text=ex_en)
        t_vi = vi_translator.translate(text=ex_en)
        translation_map[ex_en] = {"ko": t_ko, "ja": t_ja, "vi": t_vi}
    except Exception as e:
        print(f"Error translating: {ex_en}, {e}")
        translation_map[ex_en] = {"ko": "", "ja": "", "vi": ""}

# Apply to db
for lvl in db:
    for word_obj in lvl['words']:
        ex_en = word_obj.get('example_en', "").strip()
        if ex_en and ex_en in translation_map:
            t_data = translation_map[ex_en]
            word_obj['example_ko'] = t_data['ko']
            if 'examples_loc' not in word_obj:
                word_obj['examples_loc'] = {}
            word_obj['examples_loc']['ko'] = t_data['ko']
            word_obj['examples_loc']['ja'] = t_data['ja']
            word_obj['examples_loc']['vi'] = t_data['vi']

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Successfully updated database with translated examples!")
