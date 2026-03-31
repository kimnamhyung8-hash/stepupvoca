import json
import time
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator

# Target file path
db_path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'

with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

# Extract all unique words and example sentences
words_to_translate = []
for lvl in db:
    for w in lvl['words']:
        words_to_translate.append({
            "word": w['word'],
            "example_en": w['example_en']
        })

print(f"Loaded {len(words_to_translate)} words from the database.")

translators = {
    "ko": GoogleTranslator(source='en', target='ko'),
    "ja": GoogleTranslator(source='en', target='ja'),
    "zh": GoogleTranslator(source='en', target='zh-CN'),
    "vi": GoogleTranslator(source='en', target='vi'),
}

translation_results = {}

def safe_translate(translator, text):
    retries = 3
    for _ in range(retries):
        try:
            return translator.translate(text)
        except Exception:
            time.sleep(1)
    return text  # fallback to English if it fails 3 times

def process_item(item):
    word = item['word'].lower()
    ex = item['example_en']
    
    # Translate the SHORT word (for dictionary meaning)
    w_ko = safe_translate(translators["ko"], word)
    w_ja = safe_translate(translators["ja"], word)
    w_zh = safe_translate(translators["zh"], word)
    w_vi = safe_translate(translators["vi"], word)
    
    # Translate the EXAMPLE sentence
    e_ko = safe_translate(translators["ko"], ex)
    e_ja = safe_translate(translators["ja"], ex)
    e_zh = safe_translate(translators["zh"], ex)
    e_vi = safe_translate(translators["vi"], ex)
    
    return {
        "word": word,
        "meanings": {"ko": w_ko, "ja": w_ja, "zh": w_zh, "vi": w_vi, "en": word},
        "examples": {"ko": e_ko, "ja": e_ja, "zh": e_zh, "vi": e_vi, "en": ex}
    }

print("Starting deep-translation of short meanings and examples into 4 languages... This will take a few minutes!")
results_list = []
with ThreadPoolExecutor(max_workers=5) as executor:
    for i, res in enumerate(executor.map(process_item, words_to_translate)):
        results_list.append(res)
        if (i+1) % 200 == 0:
            print(f"Translated {i+1} / {len(words_to_translate)} items...")

# Build a lookup map based on word for O(1) retrieval
result_map = {r['word']: r for r in results_list}

import random
# Now rebuild the database with proper options arrays
print("Rebuilding database with multilingual options...")
for lvl in db:
    lvl_words = lvl['words']
    
    # Pre-extract all meanings for this level
    lvl_meanings = {
        "ko": [result_map[w['word'].lower()]['meanings']['ko'] for w in lvl_words],
        "ja": [result_map[w['word'].lower()]['meanings']['ja'] for w in lvl_words],
        "zh": [result_map[w['word'].lower()]['meanings']['zh'] for w in lvl_words],
        "vi": [result_map[w['word'].lower()]['meanings']['vi'] for w in lvl_words],
        "en": [result_map[w['word'].lower()]['meanings']['en'] for w in lvl_words],
    }
    
    for w in lvl_words:
        word_key = w['word'].lower()
        my_res = result_map[word_key]
        
        # Determine options: 4 distinct choices including the correct one
        # To avoid index mismatch, we first build indexes
        current_idx = lvl_words.index(w)
        other_indexes = [i for i in range(len(lvl_words)) if i != current_idx]
        chosen_other_indexes = random.sample(other_indexes, min(3, len(other_indexes)))
        final_indexes = [current_idx] + chosen_other_indexes
        random.shuffle(final_indexes)
        
        correct_ans_idx = final_indexes.index(current_idx)
        
        w['answer_index'] = correct_ans_idx
        
        # Assign meanings
        w['meanings'] = my_res['meanings']
        w['meaning'] = my_res['meanings']['ko'] # Backward compatibility
        w['meaning_en'] = w.get('meaning_en', "Meaning") 
        w['example_en'] = my_res['examples']['en']
        w['example_ko'] = my_res['examples']['ko'] # Backward compatibility
        w['examples_loc'] = my_res['examples']
        
        # Build options according to indexes
        w['options_loc'] = {
            "ko": [lvl_meanings["ko"][i] for i in final_indexes],
            "ja": [lvl_meanings["ja"][i] for i in final_indexes],
            "zh": [lvl_meanings["zh"][i] for i in final_indexes],
            "vi": [lvl_meanings["vi"][i] for i in final_indexes],
            "en": [lvl_meanings["en"][i] for i in final_indexes]
        }
        w['options'] = w['options_loc']['ko'] # Backward compatibility

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Successfully wrapped up the multilingual DB updates!")
