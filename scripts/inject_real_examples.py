import json

path = r'd:\antigravity\stepupvoca\app\src\data\vocaDB.json'

with open(path, 'r', encoding='utf-8') as f:
    db = json.load(f)

custom_examples = {
    'Apple': ('I eat an apple every morning.', '나는 매일 아침 사과를 먹습니다.', '私は毎朝リンゴを食べます。', '我每天早上吃一个苹果。', 'Tôi ăn một quả táo mỗi sáng.'),
    'Dog': ('My dog is very playful.', '내 개는 장난기가 많습니다.', '私の犬はとても遊び好きです。', '我的狗非常顽皮。', 'Con chó của tôi rất ham chơi.'),
    'Cat': ('The cat is sleeping on the sofa.', '고양이가 소파 위에서 자고 있습니다.', '猫はソファの上で寝ています。', '猫正在沙发上睡觉。', 'Con mèo đang ngủ trên ghế sofa.'),
    'Book': ('She is reading a book in the library.', '그녀는 도서관에서 책을 읽고 있습니다.', '彼女は図書館で本を読んでいます。', '她在图书馆看书。', 'Cô ấy đang đọc sách trong thư viện.'),
    'Water': ('Please give me a glass of water.', '물 한 잔 주세요.', '水を一杯ください。', '请给我一杯水。', 'Làm ơn cho tôi một ly nước.'),
    'School': ('Children go to school to learn.', '아이들은 배우기 위해 학교에 갑니다.', '子供たちは学ぶために学校に行きます。', '孩子们去学校学习。', 'Trẻ em đến trường để học.'),
    'Friend': ('He is my best friend.', '그는 나의 가장 친한 친구입니다.', '彼は私の親友です。', '他是我最好的朋友。', 'Anh ấy là người bạn tốt nhất của tôi.'),
    'Happy': ('I am so happy to see you.', '당신을 만나서 정말 행복합니다.', 'あなたに会えてとても嬉しいです。', '见到你我很高兴。', 'Tôi rất vui khi gặp bạn.'),
    'Sad': ('The movie has a sad ending.', '그 영화는 슬픈 결말을 가지고 있습니다.', 'その映画は悲しい結末を持っています。', '这部电影有一个悲伤的结局。', 'Bộ phim có một kết thúc buồn.'),
    'Big': ('They live in a big house.', '그들은 큰 집에 살고 있습니다.', '彼らは大きな家に住んでいます。', '他们住在一栋大房子里。', 'Họ sống trong một ngôi nhà lớn.'),
    'Small': ('A small bird is on the tree.', '작은 새가 나무 위에 있습니다.', '小さな鳥が木の上にいます。', '树上有一只小鸟。', 'Một con chim nhỏ đang ở trên cây.'),
    'Run': ('I run in the park every morning.', '나는 매일 아침 공원에서 달립니다.', '私は毎朝公園を走っています。', '我每天早上在公园里跑步。', 'Tôi chạy trong công viên mỗi sáng.'),
    'Eat': ('We eat dinner at 7 PM.', '우리는 저녁 7시에 밥을 먹습니다.', '私たちは午後7時に夕食を食べます。', '我们在晚上7点吃晚饭。', 'Chúng tôi ăn tối lúc 7 giờ tối.'),
    'Drink': ('Don\'t forget to drink milk.', '우유를 마시는 것을 잊지 마세요.', '牛乳を飲むのを忘れないでください。', '别忘了喝牛奶。', 'Đừng quên uống sữa.'),
    'Sleep': ('Babies need to sleep a lot.', '아기들은 잠을 많이 자야 합니다.', '赤ちゃんはたくさん眠る必要があります。', '婴儿需要大量睡眠。', 'Trẻ sơ sinh cần ngủ nhiều.'),
    'House': ('They are building a new house.', '그들은 새 집을 짓고 있습니다.', '彼らは新しい家を建てています。', '他们正在建一座新房子。', 'Họ đang xây một ngôi nhà mới.'),
    'Car': ('He drives a red car.', '그는 빨간색 차를 운전합니다.', '彼は赤い車を運転しています。', '他开着一辆红色的车。', 'Anh ấy lái một chiếc xe màu đỏ.')
}

for lvl in db:
    for item in lvl['words']:
        word = item['word']
        
        if word in custom_examples:
            en, ko, ja, zh, vi = custom_examples[word]
            item['example_en'] = en
            item['example_ko'] = ko
            item['examples_loc'] = {
                'ko': ko,
                'en': en,
                'ja': ja,
                'zh': zh,
                'vi': vi
            }

with open(path, 'w', encoding='utf-8') as f:
    json.dump(db, f, ensure_ascii=False, indent=2)

print('Updated first batch of real examples.')
