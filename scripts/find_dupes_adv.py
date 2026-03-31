
import re
from collections import Counter

def find_all_duplicates(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_object = None
    object_lines = []
    
    for i, line in enumerate(lines):
        # Start of an object
        if '{' in line:
            # Simple heuristic for object start
            match = re.search(r'(\w+):\s*\{', line)
            if match:
                obj_name = match.group(1)
                print(f"Checking object: {obj_name}")
                # We need to find the matching closing brace
                # This is a simple stack-based approach
                keys = []
                brace_count = 1
                for j in range(i + 1, len(lines)):
                    l = lines[j]
                    brace_count += l.count('{')
                    brace_count -= l.count('}')
                    
                    key_match = re.search(r'^\s*(\w+):', l)
                    if key_match:
                        keys.append(key_match.group(1))
                    
                    if brace_count == 0:
                        break
                
                counts = Counter(keys)
                dupes = [(k, v) for k, v in counts.items() if v > 1]
                if dupes:
                    print(f"!!! DUPLICATES in {obj_name}: {dupes}")

if __name__ == "__main__":
    find_all_duplicates(r'd:\antigravity\stepupvoca\app\src\i18n.ts')
