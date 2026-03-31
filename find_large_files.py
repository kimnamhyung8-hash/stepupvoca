
import os

def find_large_text_blocks(directory, min_length=1000):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith(('.ts', '.tsx', '.html', '.txt', '.md', '.json')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if len(content) > min_length:
                            # Check for continuous text blocks (no large gaps of punctuation/code)
                            # Actually, just reporting files > 1000 is a good start.
                            print(f"FILE: {path} (Size: {len(content)})")
                except:
                    pass

if __name__ == "__main__":
    find_large_text_blocks('d:/antigravity/stepupvoca')
