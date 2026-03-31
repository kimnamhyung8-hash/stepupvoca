import os

def final_cleanup_v8():
    # 1. AdminScreens.tsx 정밀 수정
    p1 = r"d:\antigravity\stepupvoca\app\src\AdminScreens.tsx"
    with open(p1, "r", encoding="utf-8") as f:
        c1 = f.read()
    
    # toggleSelectOne(u.id); } -> toggleSelectOne(u.id); }}
    c1 = c1.replace('toggleSelectOne(u.id); }', 'toggleSelectOne(u.id); }}')
    
    # Add export default if missing
    if 'export default AdminDashboardScreen;' not in c1:
        c1 = c1.strip() + '\n\nexport default AdminDashboardScreen;\n'

    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. OnboardingScreen.tsx 정밀 수정 (한 번 더 확인)
    p2 = r"d:\antigravity\stepupvoca\app\src\screens\OnboardingScreen.tsx"
    with open(p2, "r", encoding="utf-8") as f:
        c2 = f.read()
    
    # 139라인 Mixed quotes fix 다시 한 번 적용 (replace가 정확해야 함)
    # view_file에서 본 실제 텍스트: { word: 'Sophisticated', meaning: '?련", answer_index: 3, options: ['?순", '복잡", '거친', '?련"] },
    c2 = c2.replace("meaning: '?련\", answer_index: 3, options: ['?순\", '복잡\", '거친', '?련\"] }",
                    "meaning: '세련된', answer_index: 3, options: ['단순한', '복잡한', '거친', '세련된'] }")
    
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

    print("Cleanup v8 complete.")

if __name__ == "__main__":
    final_cleanup_v8()
