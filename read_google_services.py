import json
with open('google-services.json', 'r', encoding='utf-16') as f:
    data = json.load(f)
print(json.dumps(data, indent=2))
