
import re

def find_duplicates(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the placeholderEn object
    en_match = re.search(r'const placeholderEn = \{(.*?)\};', content, re.DOTALL)
    if en_match:
        en_lines = en_match.group(1).split('\n')
        en_keys = []
        for line in en_lines:
            match = re.search(r'^\s*(\w+):', line)
            if match:
                en_keys.append(match.group(1))
        
        from collections import Counter
        en_counts = Counter(en_keys)
        en_dupes = [k for k, v in en_counts.items() if v > 1]
        if en_dupes:
            print(f"Duplicate keys in placeholderEn: {en_dupes}")
        else:
            print("No duplicates in placeholderEn")

    # Find the ko block inside translations
    ko_match = re.search(r'ko: \{(.*?)\},', content, re.DOTALL)
    if ko_match:
        ko_lines = ko_match.group(1).split('\n')
        ko_keys = []
        for line in ko_lines:
            match = re.search(r'^\s*(\w+):', line)
            if match:
                ko_keys.append(match.group(1))
        
        ko_counts = Counter(ko_keys)
        ko_dupes = [k for k, v in ko_counts.items() if v > 1]
        if ko_dupes:
            print(f"Duplicate keys in ko: {ko_dupes}")
        else:
            print("No duplicates in ko")

if __name__ == "__main__":
    find_duplicates(r'd:\antigravity\stepupvoca\app\src\i18n.ts')
