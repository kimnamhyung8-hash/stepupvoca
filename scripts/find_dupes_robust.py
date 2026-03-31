
import re
from collections import Counter

def find_duplicates(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # We want to find duplicates within the same object literal.
    # A simple way is to track brace depth.
    
    brace_stack = []
    object_keys = {} # depth -> list of keys
    
    for i, line in enumerate(lines):
        # Count braces
        for char in line:
            if char == '{':
                brace_stack.append(i)
                object_keys[len(brace_stack)] = []
            elif char == '}':
                if brace_stack:
                    brace_stack.pop()
        
        # At current depth, find key
        if brace_stack:
            match = re.search(r'^\s*(\w+):', line)
            if match:
                key = match.group(1)
                depth = len(brace_stack)
                if key in object_keys[depth]:
                    print(f"Duplicate key '{key}' at line {i+1} at depth {depth}")
                else:
                    object_keys[depth].append(key)

if __name__ == "__main__":
    find_duplicates(r'd:\antigravity\stepupvoca\app\src\i18n.ts')
