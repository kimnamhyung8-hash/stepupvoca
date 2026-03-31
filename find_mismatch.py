import os
import re

def find_mismatch(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Clean content but keep line structure
    lines = content.split('\n')
    depth = 0
    for i, line in enumerate(lines):
        clean_line = re.sub(r'`[\s\S]*?`', '', line)
        clean_line = re.sub(r'"[\s\S]*?"', '', clean_line)
        clean_line = re.sub(r"'[\s\S]*?'", '', clean_line)
        clean_line = re.sub(r'//.*', '', clean_line)
        
        opened = clean_line.count('{')
        closed = clean_line.count('}')
        
        old_depth = depth
        depth += (opened - closed)
        
        if depth < 0:
            print(f"{os.path.basename(path)} Error at line {i+1}: Depth went below 0 (Extra }}?). Line: {line.strip()}")
            return
    print(f"{os.path.basename(path)} Final Depth: {depth}")

find_mismatch(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx")
find_mismatch(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx")
