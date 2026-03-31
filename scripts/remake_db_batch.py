import json
import time
from deep_translator import GoogleTranslator

db_path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'

with open(db_path, 'r', encoding='utf-8') as f:
    db = json.load(f)

unique_words = list(set([w['word'] for lvl in db for w in lvl['words']]))
unique_examples = list(set([w['example_en'] for lvl in db for w in lvl['words']]))

print(f"Translating {len(unique_words)} unique words and {len(unique_examples)} unique examples.")

translators = {
    "ko": GoogleTranslator(source='en', target='ko'),
    "ja": GoogleTranslator(source='en', target='ja'),
    "zh": GoogleTranslator(source='en', target='zh-CN'),
    "vi": GoogleTranslator(source='en', target='vi'),
}

def translate_in_batches(items, translator, batch_size=50):
    results = []
    total_batches = (len(items) + batch_size - 1) // batch_size
    for i in range(total_batches):
        batch = items[i*batch_size : (i+1)*batch_size]
        retries = 3
        for r in range(retries):
            try:
                res_batch = translator.translate_batch(batch)
                results.extend(res_batch)
                break
            except Exception as e:
                print(f"Batch {i+1} failed. Retrying... ({e})")
                time.sleep(2)
                if r == retries - 1:
                    print(f"Failed translation for batch {i+1}. Using english.")
                    results.extend(batch)
        print(f"Translated batch {i+1}/{total_batches}...")
        time.sleep(0.5)
    return results

print("Translating Words -> KO")
words_ko = translate_in_batches(unique_words, translators["ko"])
print("Translating Words -> JA")
words_ja = translate_in_batches(unique_words, translators["ja"])
print("Translating Words -> ZH")
words_zh = translate_in_batches(unique_words, translators["zh"])
print("Translating Words -> VI")
words_vi = translate_in_batches(unique_words, translators["vi"])

print("Translating Examples -> KO")
ex_ko = translate_in_batches(unique_examples, translators["ko"])
print("Translating Examples -> JA")
ex_ja = translate_in_batches(unique_examples, translators["ja"])
print("Translating Examples -> ZH")
ex_zh = translate_in_batches(unique_examples, translators["zh"])
print("Translating Examples -> VI")
ex_vi = translate_in_batches(unique_examples, translators["vi"])

word_maps = {
    "ko": dict(zip(unique_words, words_ko)),
    "ja": dict(zip(unique_words, words_ja)),
    "zh": dict(zip(unique_words, words_zh)),
    "vi": dict(zip(unique_words, words_vi)),
}

example_maps = {
    "ko": dict(zip(unique_examples, ex_ko)),
    "ja": dict(zip(unique_examples, ex_ja)),
    "zh": dict(zip(unique_examples, ex_zh)),
    "vi": dict(zip(unique_examples, ex_vi)),
}

import random

for lvl in db:
    lvl_words = lvl['words']
    
    # Map the short translated words
    for i, w in enumerate(lvl_words):
        eng_word = w['word']
        eng_ex = w['example_en']
        
        w['meanings'] = {
            "en": eng_word,
            "ko": word_maps["ko"].get(eng_word, eng_word),
            "ja": word_maps["ja"].get(eng_word, eng_word),
            "zh": word_maps["zh"].get(eng_word, eng_word),
            "vi": word_maps["vi"].get(eng_word, eng_word),
        }
        w['meaning'] = w['meanings']['ko']
        
        w['examples_loc'] = {
            "en": eng_ex,
            "ko": example_maps["ko"].get(eng_ex, eng_ex),
            "ja": example_maps["ja"].get(eng_ex, eng_ex),
            "zh": example_maps["zh"].get(eng_ex, eng_ex),
            "vi": example_maps["vi"].get(eng_ex, eng_ex),
        }
        w['example_ko'] = w['examples_loc']['ko']
        
    for i, w in enumerate(lvl_words):
        indexes = list(range(len(lvl_words)))
        indexes.remove(i)
        chosen_others = random.sample(indexes, 3) if len(indexes) >= 3 else indexes
        final_indexes = [i] + chosen_others
        random.shuffle(final_indexes)
        
        ans_idx = final_indexes.index(i)
        w['answer_index'] = ans_idx
        
        w['options_loc'] = {
            "en": [lvl_words[x]['meanings']['en'] for x in final_indexes],
            "ko": [lvl_words[x]['meanings']['ko'] for x in final_indexes],
            "ja": [lvl_words[x]['meanings']['ja'] for x in final_indexes],
            "zh": [lvl_words[x]['meanings']['zh'] for x in final_indexes],
            "vi": [lvl_words[x]['meanings']['vi'] for x in final_indexes],
        }
        w['options'] = w['options_loc']['ko']

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print("Batch translation formatting completed successfully! Check the vocaDB.json file.")
