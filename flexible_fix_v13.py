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

# 1. EvalScreen brace
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\screens\EvalScreen.tsx",
    r"onClick=\{async \(\) => \{ await showAdIfFree\(\); setScreen\('HOME'\);\s*\}",
    "onClick={async () => { await showAdIfFree(); setScreen('HOME'); }}"
)

# 2. AdminScreens startEditing
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx",
    r"onClick=\{\(\) => startEditing\(n\);\s*\}\}",
    "onClick={() => startEditing(n)}"
)

# 3. MyPhraseScreen setInputText
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\MyPhraseScreen.tsx",
    r"setInputText\(e\.target\.value\);\s*setTranslated\(null\);\s*\}",
    "setInputText(e.target.value); setTranslated(null); }}"
)

# 4. AdminScreens translateWord (1817)
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx",
    r"onClick=\{\(\) => translateWord\(lang\.langName, lang\.code\)\s*\}",
    "onClick={() => translateWord(lang.langName, lang.code)}"
)

# 5. AdminScreens nicknames re-re-fix
flexible_fix(
    r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx",
    r"nickname: u.nickname\s*,",
    "nickname: u.nickname || \"\","
)
