
import re

file_path = r'd:\antigravity\stepupvoca\app\src\conversationScripts.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix corrupted hint_loc (remove Korean characters bleeding into other languages)
# This is a bit risky to do with regex, but let's try specific fixes found.

fixes = [
    # Interview fixes
    (r'hint_ko: "네, 긴장되지만 준비됐습니다."', r'hint_ko: "네, 기대됩니다. 준비됐습니다."'),
    (r'hint_loc: \{ ja: "はい、わくわくしていますが、準備はできています。"', r'hint_loc: { ja: "はい, 楽しみです。準備はできています。"'),
    (r'ja: "私の最大の強みは、複雑한問題を解決하는 能力だと思います。"', r'ja: "私の最大の強みは、複雑な問題を解決する能力だと思います。"'),
    (r'ja: "タ스크의 優先順位를 付け、集中력을 維持하도록 하려고 합니다."', r'ja: "タスクの優先順位を付け、集中力を維持するようにしています。"'),
    (r'ja: "タ스크의 優先順位를 付け、集中력을 維持하도록.." ', r'ja: "タスクの優先順位を付け、集中力を維持するように.." '),

    # Directions fixes
    (r'ja: "もち로んです！このまま2ブロック直進してください。"', r'ja: "もちろんです！このまま2ブロック直進してください。"'),
    (r'ja: "はい、大きな図書館의 隣에 있습니다。"', r'ja: "はい、大きな図書館の隣にあります。"'),
    (r'ja: "はい、大きな図書館의 隣에 있습니다."', r'ja: "はい、大きな図書館の隣にあります。"'),
    (r'ja: "はい、大きな図書館의 隣にあります。"', r'ja: "はい、大きな図書館の隣にあります。"'),

    # Emergency fixes
    (r'ja: "メイン・ストリート과 5番街의 交叉点입니다. けが인이 있습니다."', r'ja: "メイン・ストリートと5番街の交差点입니다. けが人がいます。"'), # ja fixes later
    (r'zh: "我在主街（Main Street）和第五大道（5th Avenue）의 交界處。有人受傷了。"', r'zh: "我在主街（Main Street）和第五大道（5th Avenue）的交界处。有人受傷了。"'),
    (r'vi: "Tôi đang ở ngã tư đường Main 및 Đại lộ số 5. Có một số người bị thương."', r'vi: "Tôi đang ở ngã tư đường Main và Đại lộ số 5. Có một số người bị thương."'),
    (r'vi: "Tên tôi là Chris 및 số điện thoại의 tôi là 555-0199."', r'vi: "Tên tôi là Chris và số điện thoại của tôi là 555-0199."'),
    (r'tw: "我叫크리스, 我的電話號碼는 555-0199입니다."', r'tw: "我叫克里斯，我的電話號碼是 555-0199。"'),

    # Hobbies fixes
    (r'vi: "Tôi là fan cuồng의 phim hành động."', r'vi: "Tôi là fan cuồng của phim hành động."'),

    # Appointments fixes
    (r'vi: "Vâng, hãy cứ cẩn thận 및 ở trong nhà."', r'vi: "Vâng, hãy cứ cẩn thận và ở trong nhà."'),
    (r'tw: "是的，保險起見，我們待ใน室內吧。"', r'tw: "是的，保險起見，我們待在室內吧。"'),
]

for old, new in fixes:
    content = content.replace(old, new)

# Add ai_ko for better user experience in new scenarios
# Hospital
content = content.replace('ai: "I see. How long have you been feeling this way?"', 'ai: "I see. How long have you been feeling this way?",\n            ai_ko: "그렇군요. 언제부터 그렇게 느끼셨나요?"')
content = content.replace('ai: "Let me take your temperature... It\'s 38.5°C. You have a mild fever."', 'ai: "Let me take your temperature... It\'s 38.5°C. You have a mild fever.",\n            ai_ko: "체온을 좀 재볼게요... 38.5도네요. 미열이 있습니다."')
content = content.replace('ai: "Nothing serious. Looks like a mild viral infection. Are you allergic to any medications?"', 'ai: "Nothing serious. Looks like a mild viral infection. Are you allergic to any medications?",\n            ai_ko: "심각한 건 아닙니다. 가벼운 바이러스성 감염인 것 같네요. 알레르기가 있는 약이 있나요?"')

# Taxi
content = content.replace('ai: "The Grand Hotel — got it! Do you know the exact address, or should I look it up?"', 'ai: "The Grand Hotel — got it! Do you know the exact address, or should I look it up?",\n            ai_ko: "그랜드 호텔요, 알겠습니다! 정확한 주소를 아시나요, 아니면 제가 찾아볼까요?"')

# Cafe
content = content.replace('ai: "Great choice! What size would you like — small, medium, or large?"', 'ai: "Great choice! What size would you like — small, medium, or large?",\n            ai_ko: "좋은 선택입니다! 사이즈는 어떤 것으로 하시겠어요? 소, 중, 대가 있습니다."')

# More manual fixes for the ja/ko mixed strings I found
# ja: "昨日の朝부터 시작됐습니다." -> "昨日の朝からです。"
content = content.replace('ja: "昨日の朝부터 시작됐습니다."', 'ja: "昨日の朝からです。"')
# ja: "私の名前은 くりす이고, 電話番号는 555-0199입니다." -> "私の名前はクリスで、電話番号は555-0199です。"
content = content.replace('ja: "私の名前은 くりす이고, 電話番号는 555-0199입니다."', 'ja: "私の名前はクリスで、電話番号は555-0199입니다。"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fix completed.")
