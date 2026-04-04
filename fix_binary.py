import os
import re

def fix_file(path):
    if not os.path.exists(path):
        print(f"Not found: {path}")
        return
    
    with open(path, 'rb') as f:
        data = f.read()
    
    data = data.replace(b'\r\n', b'\n')
    data = data.replace(b'\r', b'\n')
    
    lines = data.split(b'\n')
    new_lines = []
    
    for line in lines:
        # AdminScreens logic
        if b"id: 'dashboard', label:" in line:
            line = "        { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={16} /> },".encode('utf-8')
        elif b"id: 'members', label:" in line:
            line = "        { id: 'members', label: '회원관리', icon: <Users size={16} /> },".encode('utf-8')
        elif b"id: 'sales', label:" in line:
            line = "        { id: 'sales', label: '매출', icon: <DollarSign size={16} /> },".encode('utf-8')
        elif b"id: 'b2b', label:" in line:
            line = "        { id: 'b2b', label: 'B2B', icon: <Building2 size={16} /> },".encode('utf-8')
        elif b"id: 'content', label:" in line:
            line = "        { id: 'content', label: '콘텐츠', icon: <BookOpen size={16} /> },".encode('utf-8')
        elif b"id: 'marketing', label:" in line:
            line = "        { id: 'marketing', label: '마케팅센터', icon: <Megaphone size={16} /> },".encode('utf-8')
        elif b"id: 'support', label:" in line:
            line = "        { id: 'support', label: '일반문의', icon: <MessageSquare size={16} /> },".encode('utf-8')
        elif b"id: 'reports', label:" in line:
            line = "        { id: 'reports', label: '채팅신고', icon: <ShieldAlert size={16} /> },".encode('utf-8')
        elif b"id: 'system', label:" in line:
            line = "        { id: 'system', label: '시스템', icon: <SettingsIcon size={16} /> },".encode('utf-8')
            
        if b'StatCard title="' in line:
            if b'revenue.toFixed' in line:
                line = re.sub(rb'title="[^"]*"', 'title="총 매출"'.encode('utf-8'), line)
            elif b'users.length' in line:
                line = re.sub(rb'title="[^"]*"', 'title="가입 회원수"'.encode('utf-8'), line)
            elif b'points.toLocaleString' in line:
                line = re.sub(rb'title="[^"]*"', 'title="보유 포인트"'.encode('utf-8'), line)
            elif b'feedback.filter' in line:
                line = re.sub(rb'title="[^"]*"', 'title="미처리 문의"'.encode('utf-8'), line)

        # StoreScreen logic
        if b"id: 'king'" in line:
            line = "        { id: 'king', emoji: '👑', label: 'King', price: 5000 },".encode('utf-8')
        if b"id: 'dragon'" in line:
            line = "        { id: 'dragon', emoji: '🐉', label: 'Dragon', price: 10000 },".encode('utf-8')
        if b"code: 'ko', label:" in line:
            line = "        { code: 'ko', label: '한국어', flag: '🇰🇷' },".encode('utf-8')
        if b"code: 'ja', label:" in line:
            line = "        { code: 'ja', label: '日本語', flag: '🇯🇵' },".encode('utf-8')

        # Generic fixes
        line = line.replace(b'handleActiot', b'handleAction')
        line = line.replace(b'.assigt(', b'.assign(')
        line = line.replace(b'.jsot(', b'.json(')
        line = line.replace(b'console.wart(', b'console.warn(')
        line = line.replace(b'joit(', b'join(')
        line = line.replace('?로고침'.encode('utf-8'), '새로고침'.encode('utf-8'))
        
        new_lines.append(line)
        
    with open(path, 'wb') as f:
        f.write(b'\n'.join(new_lines))
    print(f"Fixed {path}")

fix_file(r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx')
fix_file(r'd:\antigravity\stepupvoca\app\src\screens\StoreScreen.tsx')
