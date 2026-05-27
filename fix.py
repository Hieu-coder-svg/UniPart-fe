import os
import re

src_dir = r'c:\Users\Hp\Desktop\UniPart-fe\src'
pattern = re.compile(r'\s*\|\|\s*[\'\"`]http://localhost:8080(?:/api)?[\'\"`]')

count = 0
for root, dirs, files in os.walk(src_dir):
    for filename in files:
        if filename.endswith(('.ts', '.tsx')):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if pattern.search(content):
                # Replace with " as string" to maintain TypeScript types
                new_content = pattern.sub(' as string', content)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f"Updated {filepath}")

print(f"Replaced in {count} files")
