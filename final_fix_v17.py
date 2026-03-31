import os
import re

def flexible_fix(path, pattern, replacement):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content)
    if content != new_content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {os.path.basename(path)}")
    else:
        print(f"No changes for {os.path.basename(path)}")

# 1. BibleScreen.tsx 262 (missing brace)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\BibleScreen.tsx",
    r"setScreen\('HOME'\);\s*\}",
    "setScreen('HOME'); }}"
)

# 2. MyPhraseScreen.tsx 466-467 (restructure for clarity)
# This will fix the "catch (e)" error by making sure the try block ends correctly.
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx",
    r"if \(res\.matches\?\.length > 0\) \{ setInputText\(res\.matches\[0\]\); setTranslated\(null\);\s*\}\}\s*\n\s*\} catch",
    "if (res.matches?.length > 0) { setInputText(res.matches[0]); setTranslated(null); }\n        } catch"
)
