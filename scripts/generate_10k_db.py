import json
import random
import asyncio
import aiohttp
import traceback
from wordfreq import top_n_list

LANGS = {
    'ko': 'ko',
    'zh': 'zh-CN',
    'ja': 'ja',
    'vi': 'vi'
}

async def fetch_translation(session, sem, lang_code, words_list, max_retries=5):
    url = "https://translate.googleapis.com/translate_a/single"
    text = '\n'.join(words_list)
    params = {
        'client': 'gtx',
        'sl': 'en',
        'tl': lang_code,
        'dt': 't',
        'q': text
    }
    
    for attempt in range(max_retries):
        async with sem:
            try:
                async with session.get(url, params=params, timeout=10) as resp:
                    if resp.status == 200:
                        text = await resp.text(encoding='utf-8')
                        data = json.loads(text)
                        raw_results = []
                        if data and data[0]:
                            for item in data[0]:
                                if item[0]:
                                    # clean up trailing newlines
                                    raw_results.append(item[0].strip())
                        # the translation might split lines slightly differently or lose empty lines
                        # we assume 1:1 match if lengths match
                        if len(raw_results) == len(words_list):
                            return raw_results
                        else:
                            # if length mismatched, just return best effort filling
                            out = raw_results[:len(words_list)]
                            while len(out) < len(words_list):
                                out.append("err")
                            return out
                    elif resp.status == 429:
                        await asyncio.sleep(2 * (attempt + 1))
            except Exception as e:
                await asyncio.sleep(2 * (attempt + 1))
    
    # fallback on failure
    return ["err"] * len(words_list)

async def translate_chunk(session, sem, words_chunk):
    tasks = []
    for lang_key, api_lang in LANGS.items():
        tasks.append(fetch_translation(session, sem, api_lang, words_chunk))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # results is a list of [ko_list, zh_list, ja_list, vi_list]
    parsed_res = {}
    for i, lang_key in enumerate(LANGS.keys()):
        res = results[i]
        if isinstance(res, Exception):
            parsed_res[lang_key] = ["err"] * len(words_chunk)
        else:
            parsed_res[lang_key] = res
            
    return parsed_res

async def main():
    print("Step 1: Fetching english words using wordfreq...")
    raw_words = top_n_list('en', 30000)
    
    # Filter content and function words (length >= 4)
    valid_words = []
    for w in raw_words:
        # Keep alphabetic only
        if len(w) >= 4 and w.isalpha():
            valid_words.append(w)
            if len(valid_words) == 10020:
                break
                
    if len(valid_words) < 10020:
        print(f"Only found {len(valid_words)} valid words. Adjusting limits.")
        # repeat slightly if not enough
        diff = 10020 - len(valid_words)
        valid_words.extend(valid_words[:diff])
        
    print(f"Step 2: Found {len(valid_words)} valid words. Initializing generation.")

    # chunk into levels of 30
    chunk_size = 30
    levels = []
    for i in range(0, len(valid_words), chunk_size):
        levels.append(valid_words[i:i+chunk_size])
        
    final_db = []
    
    # Connection pooling and concurrency limits
    sem = asyncio.Semaphore(15) # 15 concurrent request limit to avoid Google ban
    timeout = aiohttp.ClientTimeout(total=60)
    connector = aiohttp.TCPConnector(limit=15)
    
    print(f"Step 3: Translating {len(levels)} levels across 4 languages...")
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        for lvl_idx, chunk in enumerate(levels, start=1):
            if lvl_idx % 20 == 0:
                print(f"Progress: Level {lvl_idx}/{len(levels)}...")
            
            # translates the chunk of 30 words into all 4 languages
            trans_result = await translate_chunk(session, sem, chunk)
            
            level_obj = {
                "level": lvl_idx,
                "words": []
            }
            
            for win_idx, w in enumerate(chunk):
                # get meanings
                m_ko = trans_result['ko'][win_idx] if win_idx < len(trans_result['ko']) else "의미"
                m_zh = trans_result['zh'][win_idx] if win_idx < len(trans_result['zh']) else "意思"
                m_ja = trans_result['ja'][win_idx] if win_idx < len(trans_result['ja']) else "意味"
                m_vi = trans_result['vi'][win_idx] if win_idx < len(trans_result['vi']) else "nghĩa"
                
                # build options logic
                # we need 3 distractors out of the remaining 29 items from the SAME chunk
                distractor_indices = list(range(len(chunk)))
                distractor_indices.remove(win_idx)
                selected_dist_idx = random.sample(distractor_indices, 3)
                
                ko_opts = [m_ko] + [trans_result['ko'][i] if i < len(trans_result['ko']) else "err" for i in selected_dist_idx]
                zh_opts = [m_zh] + [trans_result['zh'][i] if i < len(trans_result['zh']) else "err" for i in selected_dist_idx]
                ja_opts = [m_ja] + [trans_result['ja'][i] if i < len(trans_result['ja']) else "err" for i in selected_dist_idx]
                vi_opts = [m_vi] + [trans_result['vi'][i] if i < len(trans_result['vi']) else "err" for i in selected_dist_idx]
                
                # shuffle them synchronously so index matches
                # easiest is to create a random permutation mapping [0..3]
                perm = [0, 1, 2, 3]
                random.shuffle(perm)
                
                ko_shuffled = [ko_opts[p] for p in perm]
                zh_shuffled = [zh_opts[p] for p in perm]
                ja_shuffled = [ja_opts[p] for p in perm]
                vi_shuffled = [vi_opts[p] for p in perm]
                
                ans_idx = perm.index(0)
                
                word_obj = {
                    "id": f"L{lvl_idx}_{win_idx}",
                    "level": lvl_idx,
                    "word": w,
                    "meaning": m_ko,      # App.tsx legacy fallback
                    "answer_index": ans_idx,
                    "options": ko_shuffled,
                    "options_loc": {
                        "ko": ko_shuffled,
                        "zh": zh_shuffled,
                        "ja": ja_shuffled,
                        "vi": vi_shuffled
                    }
                }
                level_obj["words"].append(word_obj)
            
            final_db.append(level_obj)

    print("Step 4: Writing to vocaDB.json...")
    with open('d:/antigravity/stepupvoca/app/src/data/vocaDB.json', 'w', encoding='utf-8') as f:
        json.dump(final_db, f, ensure_ascii=False, indent=2)

    print("Generation complete! Total Levels:", len(final_db), "Total Words:", sum(len(x['words']) for x in final_db))

if __name__ == "__main__":
    asyncio.run(main())
