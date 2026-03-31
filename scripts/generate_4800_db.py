import ssl
import json
import urllib.request
import random
from concurrent.futures import ThreadPoolExecutor

# Make sure we don't have ssl cert issues
ssl._create_default_https_context = ssl._create_unverified_context

import nltk
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)
from nltk.corpus import wordnet as wn

from deep_translator import GoogleTranslator

# Function words (top CEFR)
function_words = [
    "is", "am", "are", "was", "were", "be", "being", "been",
    "do", "does", "did", "have", "has", "had", 
    "can", "could", "will", "would", "shall", "should", "may", "might", "must",
    "very", "too", "so", "but", "and", "or", "because", "if", "when", "while",
    "good", "bad", "big", "small", "hot", "cold", "fast", "slow", "happy", "sad",
    "in", "on", "at", "to", "for", "with", "about", "from", "by", "of", "off",
    "he", "she", "it", "they", "we", "you", "i", "me", "him", "her", "us", "them",
    "this", "that", "these", "those", "here", "there", "where", "why", "who", "which"
]

print("Downloading top English words (frequency based)...")
url = "https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        raw_words = response.read().decode('utf-8').splitlines()
except Exception as e:
    print(f"Error downloading: {e}")
    raw_words = []

print(f"Downloaded {len(raw_words)} words.")

levels = 160
words_per_lvl = 30
target_count = levels * words_per_lvl

seen = set()

def fetch_word_info(w):
    w = w.lower().strip()
    if w in seen or len(w) < 2 and w not in ["i", "a"]:
        return None
        
    synsets = wn.synsets(w)
    if not synsets:
        return None
        
    syn = None
    for s in synsets:
        if s.examples():
            syn = s
            break
            
    if not syn:
        syn = synsets[0]
        ex_en = f"What does the word '{w}' mean?"
    else:
        ex_en = syn.examples()[0]
        
    meaning_en = syn.definition()
    
    # Prettify example
    if len(ex_en) > 1:
        ex_en = ex_en[0].upper() + ex_en[1:]
    if not ex_en.endswith('.') and not ex_en.endswith('?'):
        ex_en += '.'
        
    seen.add(w)
    return {
        "word": w,
        "meaning_en": meaning_en,
        "example_en": ex_en
    }

print("Selecting words from Wordnet...")

# 1. Fetch function words
valid_func_words = []
for w in function_words:
    res = fetch_word_info(w)
    if res:
        valid_func_words.append(res)
        
# 2. Fetch content words
valid_content_words = []
for w in raw_words:
    if len(valid_content_words) + len(valid_func_words) >= target_count + 100:
        # Fetch a bit more just in case
        break
    res = fetch_word_info(w)
    if res:
        valid_content_words.append(res)

print(f"Collected total {len(valid_func_words)} function words and {len(valid_content_words)} content words.")

# Mix them: We want to distribute function words across the early to mid levels (e.g. first 80 levels)
valid_words = []
func_idx = 0
content_idx = 0

while len(valid_words) < target_count:
    # Every level is 30 words.
    # In each level for the first 80 levels, inject 1 function word, 29 content words.
    current_level_idx = len(valid_words) // words_per_lvl
    
    # Are we at the start of a level? And do we have function words left?
    if len(valid_words) % words_per_lvl == 0 and func_idx < len(valid_func_words):
        valid_words.append(valid_func_words[func_idx])
        func_idx += 1
    else:
        if content_idx < len(valid_content_words):
            valid_words.append(valid_content_words[content_idx])
            content_idx += 1
        elif func_idx < len(valid_func_words):
            # If we run out of content words, add function words (fallback)
            valid_words.append(valid_func_words[func_idx])
            func_idx += 1
        else:
            break

# Ensure we have precisely the target_count
valid_words = valid_words[:target_count]

print(f"Collected total {len(valid_words)} unique english words for {levels} levels.")

print("Starting deep-translator to translate meaning and example... (this may take a minute)")
ko_translator = GoogleTranslator(source='en', target='ko')

def translate_word(w):
    try:
        combined = w['meaning_en'] + " ||| " + w['example_en']
        t_res = ko_translator.translate(text=combined)
        parts = t_res.split("|||")
        if len(parts) >= 2:
            w['meaning_ko'] = parts[0].strip()
            w['example_ko'] = parts[1].strip()
        else:
            w['meaning_ko'] = ko_translator.translate(text=w['meaning_en'])
            w['example_ko'] = ko_translator.translate(text=w['example_en'])
    except:
        w['meaning_ko'] = w['meaning_en']
        w['example_ko'] = w['example_en']
    return w

translated_words = []
with ThreadPoolExecutor(max_workers=10) as executor:
    for i, res in enumerate(executor.map(translate_word, valid_words)):
        translated_words.append(res)
        if (i+1) % 500 == 0:
            print(f"Translated {i+1} / {len(valid_words)}...")

print("Organizing into JSON database...")
final_db = []

def get_random_options(correct_meaning, all_meanings, count=4):
    options = [correct_meaning]
    while len(options) < count:
        cand = random.choice(all_meanings)
        if cand not in options:
            options.append(cand)
    random.shuffle(options)
    return options

all_meanings = [x['meaning_ko'] for x in translated_words]

# Determine CEFR level texts
def get_cefr_desc(lvl):
    if lvl <= 30:
        return "CEFR A1 (Beginner)"
    elif lvl <= 70:
        return "CEFR A2 (Elementary)"
    elif lvl <= 110:
        return "CEFR B1 (Intermediate)"
    elif lvl <= 140:
        return "CEFR B2 (Upper Intermediate)"
    else:
        return "CEFR C1 (Advanced)"

for lvl in range(1, levels + 1):
    lvl_words = []
    start_idx = (lvl - 1) * words_per_lvl
    end_idx = start_idx + words_per_lvl
    chunk = translated_words[start_idx:min(end_idx, len(translated_words))]
    
    cefr_tag = get_cefr_desc(lvl)
    
    for i, w in enumerate(chunk):
        opts = get_random_options(w['meaning_ko'], all_meanings, 4)
        ans_idx = opts.index(w['meaning_ko'])
        
        word_obj = {
            "id": f"L{lvl}_{i}",
            "level": lvl,
            "word": w['word'],
            "meaning": w['meaning_ko'],
            "meaning_en": w['meaning_en'],
            "example_en": w['example_en'],
            "example_ko": w['example_ko'],
            "answer_index": ans_idx,
            "options": opts,
            "options_loc": {
                "ko": opts
            },
            "examples_loc": {
                "ko": w['example_ko']
            }
        }
        lvl_words.append(word_obj)
        
    final_db.append({
        "level": lvl,
        "description": {
            "ko": f"{cefr_tag} 레벨 {lvl} 영단어", 
            "en": f"{cefr_tag} Level {lvl} Words",
            "ja": f"{cefr_tag} レベル {lvl} 英単語",
            "vi": f"Từ vựng {cefr_tag} cấp độ {lvl}"
        },
        "words": lvl_words
    })
    
out_path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(final_db, f, ensure_ascii=False, indent=2)

print(f"Completed! Wrote {levels} levels to {out_path}.")
