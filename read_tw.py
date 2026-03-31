import sys

file_path = r'd:\antigravity\stepupvoca\app\src\i18n\tw.ts'
with open(file_path, 'rb') as f:
    lines = f.readlines()

start = 510
end = 530

for i in range(start-1, min(end, len(lines))):
    try:
        line = lines[i].decode('utf-8')
        print(f"{i+1}: {line}", end='')
    except UnicodeDecodeError:
        print(f"{i+1}: [BINARY CONTENT] {lines[i]!r}")
