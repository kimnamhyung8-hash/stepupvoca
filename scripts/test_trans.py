from deep_translator import GoogleTranslator

words = ["is", "run", "book", "fast", "benevolent"]

for w in words:
    ko = GoogleTranslator(source='en', target='ko').translate(w)
    ja = GoogleTranslator(source='en', target='ja').translate(w)
    zh = GoogleTranslator(source='en', target='zh-CN').translate(w)
    vi = GoogleTranslator(source='en', target='vi').translate(w)
    print(f"{w} -> KO:{ko}, JA:{ja}, ZH:{zh}, VI:{vi}")
