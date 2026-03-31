
import sys
import re

def extract_component(file_path, component_name):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to find something like "...function PaywallPopup(..." or "...PaywallPopup=function(..."
    # or just look for the string and some context.
    pattern = re.compile(r'([a-zA-Z0-9_$]+)?\s*=?\s*function\s+' + re.escape(component_name) + r'\s*\(')
    match = pattern.search(content)
    
    if not match:
        print(f"Could not find {component_name} in {file_path}")
        return
    
    start_idx = match.start()
    # Try to find the end of the function by balancing braces
    brace_count = 0
    found_first_brace = False
    for i in range(start_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
            found_first_brace = True
        elif content[i] == '}':
            brace_count -= 1
        
        if found_first_brace and brace_count == 0:
            print(f"--- Found {component_name} ---")
            print(content[start_idx:i+1])
            print("--- End ---")
            break

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python search.py <file_path> <component_name>")
    else:
        extract_component(sys.argv[1], sys.argv[2])
