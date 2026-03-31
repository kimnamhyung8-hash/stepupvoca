
import os

path = r'd:\antigravity\stepupvoca\app\src\ConversationScreens.tsx'
with open(path, 'rb') as f:
    lines = f.readlines()

new_block_str = [
    "    {\n",
    "        id: 'taxi', emoji: '🚕',\n",
    "        title_ko: '택시 / 교통', title_en: 'Taxi / Transport', title_ja: 'タクシー/交通', title_zh: '出租车/交通', title_vi: 'Taxi / Giao thông', title_tw: '出租車/交通',\n",
    "        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',\n",
    "        subScenarios: [\n",
    "            {\n",
    "                id: 'taxi_dest', \n",
    "                title_ko: '목적지 말하기', title_en: 'Setting Destination', title_ja: '目的地を伝える', title_zh: '告知目的地', title_vi: 'Nói điểm đến', title_tw: '告知目的地',\n",
    "                description_ko: '주소 알려주기, 소요 시간 묻기', description_en: 'Giving address, asking time', description_ja: '住所を伝える、所要時間を聞く', description_zh: '告知地址，询问时间', description_vi: 'Nói địa chỉ, hỏi thời gian', description_tw: '告知地址，詢問時間'\n",
    "            }\n",
    "        ]\n",
    "    },\n",
    "    {\n",
    "        id: 'interview', emoji: '🤝',\n",
    "        title_ko: '취업 면접', title_en: 'Job Interview', title_ja: '面接', title_zh: '面试', title_vi: 'Phỏng vấn', title_tw: '面試',\n",
    "        level_ko: '⭐⭐⭐ 중급', level_en: '⭐⭐⭐ Intermediate', level_ja: '⭐⭐⭐ 中級', level_zh: '⭐⭐⭐ 中级', level_vi: '⭐⭐⭐ Trung cấp', level_tw: '⭐⭐⭐ 中級',\n",
    "        subScenarios: [\n",
    "            {\n",
    "                id: 'interview_intro',\n",
    "                title_ko: '자기소개', title_en: 'Self Introduction', title_ja: '自己紹介', title_zh: '自我介绍', title_vi: 'Giới thiệu bản thân', title_tw: '自我介紹',\n",
    "                description_ko: '경력 설명, 포부 말하기', description_en: 'Explaining experience, sharing goals', description_ja: '経歴の説明、抱負を語る', description_zh: '说明经历，谈论抱负', description_vi: 'Giải thích kinh nghiệm, chia sẻ mục tiêu', description_tw: '說明經歷，分享抱負'\n",
    "            }\n",
    "        ]\n",
    "    },\n"
]

new_block = [s.encode('utf-8') for s in new_block_str]

# Find where the next scenario starts to avoid deleting too much
next_pos = -1
for i in range(210, len(lines)):
    try:
        decoded = lines[i].decode('utf-8')
        if "id: '" in decoded and "subScenarios" not in decoded:
            next_pos = i
            break
    except:
        continue

if next_pos == -1:
    for i in range(210, len(lines)):
        if b"];" in lines[i]:
            next_pos = i
            break

if next_pos == -1: next_pos = 210

print(f"Replacing lines 174 to {next_pos}")
result = lines[:174] + new_block + lines[next_pos:]

with open(path, 'wb') as f:
    f.writelines(result)
