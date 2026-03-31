
import os
import re

file_path = r"d:\antigravity\stepupvoca\app\dist\assets\index-DPCQEoAK.js"
target_keys = ["settings", "setSettings", "setScreen", "userInfo", "setUserInfo", "firebaseUser", "setCurrentLevel", "userPoints", "equippedSkin"]
output_path = r"d:\antigravity\stepupvoca\app\src\recovered_chunks.txt"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

matches = []
for key in target_keys:
    cursor = 0
    while True:
        pos = content.find(key, cursor)
        if pos == -1: break
        matches.append((pos, key))
        cursor = pos + 1

matches.sort()
printed_ranges = []

with open(output_path, "w", encoding="utf-8") as out:
    for i in range(len(matches)):
        pos, key = matches[i]
        count = 1
        for j in range(i+1, min(i+20, len(matches))):
            if matches[j][0] - pos < 1000:
                count += 1
        
        if count >= 6:
            overlap = False
            for start, end in printed_ranges:
                if pos >= start and pos <= end:
                    overlap = True
                    break
            if overlap: continue
            
            out.write(f"Found match density at {pos} (count {count}):\n")
            chunk = content[max(0, pos-4000):pos+10000]
            out.write(chunk)
            out.write("\n" + "-" * 80 + "\n")
            printed_ranges.append((pos, pos+10000))
