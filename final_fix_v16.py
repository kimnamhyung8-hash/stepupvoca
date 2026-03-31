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

# 1. MyPhraseScreen 431 fix (extra brace before next line's brace)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx",
    r"if \(txt\) \{ setInputText\(txt\); setTranslated\(null\);\s*\}\}\s*\n\s*\};",
    "if (txt) { setInputText(txt); setTranslated(null); }\n                };"
)

# 2. MyPhraseScreen 451 fix (same as above)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx",
    r"if \(txt\) \{ setInputText\(txt\); setTranslated\(null\);\s*\}\}\s*\n\s*\};",
    "if (txt) { setInputText(txt); setTranslated(null); }\n                    };"
)

# 3. MyPhraseScreen 597 fix (triple brace)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx",
    r"setTranslated\(null\);\s*\}\}\}",
    "setTranslated(null); }}"
)

# 4. BattleScreen 659 fix (missing brace)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\BattleScreen.tsx",
    r"setSearchResult\(null\);\s*\}",
    "setSearchResult(null); }}"
)
