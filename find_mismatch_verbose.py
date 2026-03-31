import os
import re

def find_mismatch_verbose(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Clean content
    lines = content.split('\n')
    depth = 0
    for i, line in enumerate(lines):
        clean_line = re.sub(r'`[\s\S]*?`', '', line)
        clean_line = re.sub(r'"[\s\S]*?"', '', clean_line)
        clean_line = re.sub(r"'[\s\S]*?'", '', clean_line)
        clean_line = re.sub(r'//.*', '', clean_line)
        
        for char in clean_line:
            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth < 0:
                    print(f"ERROR: Extra }} at {path}:{i+1} -> {line.strip()}")
                    depth = 0 # Reset to continue search
    print(f"Final depth for {path}: {depth}")

find_mismatch_verbose(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx")
find_mismatch_verbose(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx")
