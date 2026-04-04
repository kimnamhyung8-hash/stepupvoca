import os

def sanitize(line):
    # If a line ends with ) } or similar and then starts with something else, it might be merged
    # But usually merged lines in this case look like "code_partA_partB"
    # Actually, let's just use the build errors to identify the worst lines.
    return line

path = r'd:\antigravity\stepupvoca\app\src\AdminScreens.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Look for known jumbled patterns
    if 'onClick={() => handleAction(r, \'ban\')}onRefresh}: any)' in line:
        line = line.replace('onRefresh}: any)', '')
    if 'onClick={() => handleAction(r, \'dismiss\')}_reports\'),' in line:
        line = line.replace('_reports\'),', '')
    
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
