import os

def fix_file(path, fixes):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    modified = False
    for line_num, old_text, new_text in fixes:
        idx = line_num - 1
        if idx < len(lines) and old_text in lines[idx]:
            lines[idx] = lines[idx].replace(old_text, new_text)
            print(f"Fixed {os.path.basename(path)} line {line_num}")
            modified = True
        else:
            # Try searching near the line number (+/- 5 lines)
            found = False
            for i in range(max(0, idx-5), min(len(lines), idx+6)):
                if old_text in lines[i]:
                    lines[i] = lines[i].replace(old_text, new_text)
                    print(f"Fixed {os.path.basename(path)} line {i+1} (nearest match)")
                    modified = True
                    found = True
                    break
            if not found:
                print(f"FAILED to fix {os.path.basename(path)} at line {line_num}: '{old_text}' not found")

    if modified:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(lines)

# Fixes for LiveChatScreen.tsx
lc_fixes = [
    (1830, "setRecordingStatus('idle'); }", "setRecordingStatus('idle'); }}"),
    (1889, "handleSpeak(msg.translatedEn); }} }", "handleSpeak(msg.translatedEn); }}"),
    (1913, "handleSpeak(msg.translatedEn || msg.text); }} }", "handleSpeak(msg.translatedEn || msg.text); }}"),
    (2056, "            )", "            )}"),
    (2057, "            }", ""), # Remove this line
    (2063, "setShowRecordings(false); }} }", "setShowRecordings(false); }}"),
    (2290, "            )}", ""), # Remove this redundant close
]

# Fixes for ConversationScreens.tsx
cs_fixes = [
    (1346, "setIsListening(false); }}", "setIsListening(false); }"),
    (1585, "setIsListening(false); }}", "setIsListening(false); }"),
    (1796, "setIsListening(false); }}}", "setIsListening(false); }}"),
]

fix_file(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", lc_fixes)
fix_file(r"d:\antigravity\stepupvoca\app\src\ConversationScreens.tsx", cs_fixes)

# Clean up empty lines from removed closes
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "r", encoding="utf-8") as f:
    lc_content = f.read()
lc_content = lc_content.replace("\n\n\n", "\n\n")
with open(r"d:\antigravity\stepupvoca\app\src\LiveChatScreen.tsx", "w", encoding="utf-8") as f:
    f.write(lc_content)
