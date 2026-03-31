import os

def final_surgical_repair_v11():
    # 1. EvalScreen.tsx (105라인 중괄호 누락 복구)
    p1 = r"d:\antigravity\stepupvoca\app\src\screens\EvalScreen.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    c1 = c1.replace("setScreen('HOME'); }", "setScreen('HOME'); }}")
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. AdminScreens.tsx (여러 지점의 중괄호 불균형 정밀 복구)
    p2 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    
    # 누락된 중괄호들 추가
    c2 = c2.replace("translateWord(lang.langName, lang.code); }", "translateWord(lang.langName, lang.code); }}")
    c2 = c2.replace("setEditingUser(u); }", "setEditingUser(u); }}")
    c2 = c2.replace("setEditingUser(null); }", "setEditingUser(null); }}")
    
    # 과잉 중괄호 제거 (Line 1863 area)
    # Target: setEditingWord(newEdited); \n } \n }}
    # We want: setEditingWord(newEdited); \n } \n }
    c2 = c2.replace("setEditingWord(newEdited);\n\n                    }\n                }}", 
                    "setEditingWord(newEdited);\n\n                    }\n                }")
    
    # Just in case of different indentation
    c2 = c2.replace("setEditingWord(newEdited); } }}", "setEditingWord(newEdited); }}") # No, this depends on nesting.
    # From view_file line 1863:
    # 1862:                     }
    # 1863:                 }}
    c2 = c2.replace("setEditingWord(newEdited);\n\n                    }\n                }}", "setEditingWord(newEdited);\n                }}")
    # Actually, simpler:
    c2 = c2.replace('setEditingWord(newEdited);\n\n                    }\n                }}', 'setEditingWord(newEdited);\n                }}')
    
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

final_surgical_repair_v11()
print("Final surgical repair v11 complete.")
