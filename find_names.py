import json

# 흔한 영어 사람 이름 목록
common_names = {
    'adam', 'alan', 'alex', 'alice', 'amy', 'andrew', 'angela', 'anna', 'anne', 'anthony',
    'barbara', 'ben', 'beth', 'bob', 'brian', 'bruce', 'carl', 'carol', 'charles', 'charlie',
    'chris', 'christopher', 'claire', 'daniel', 'david', 'diana', 'donna', 'dorothy',
    'edward', 'elizabeth', 'emily', 'emma', 'eric', 'eva', 'frank', 'gary', 'george',
    'grace', 'greg', 'hannah', 'helen', 'henry', 'holly', 'jack', 'james', 'jane', 'jason',
    'jennifer', 'jessica', 'jim', 'joe', 'john', 'joseph', 'joshua', 'julia', 'karen',
    'kate', 'katherine', 'kevin', 'laura', 'lauren', 'leo', 'linda', 'lisa', 'luke',
    'margaret', 'maria', 'mark', 'mary', 'matthew', 'michael', 'mike', 'nancy', 'nathan',
    'nicholas', 'oliver', 'olivia', 'pat', 'patricia', 'paul', 'peter', 'philip', 'rachel',
    'richard', 'robert', 'roger', 'rose', 'ryan', 'samuel', 'sandra', 'sara', 'sarah',
    'scott', 'sharon', 'sophia', 'sophie', 'steven', 'susan', 'thomas', 'tim',
    'tom', 'victor', 'victoria', 'walter', 'william', 'bill', 'dan', 'ken', 'liz', 'max',
    'meg', 'neil', 'nick', 'sam', 'sue', 'ted', 'will', 'andy', 'ann', 'bella', 'betty',
    'brad', 'cindy', 'cynthia', 'debra', 'dennis', 'donald', 'douglas', 'dylan',
    'elaine', 'elijah', 'ella', 'ethan', 'evelyn', 'gloria', 'harry', 'ian',
    'irene', 'isabella', 'ivan', 'jake', 'janet', 'jean', 'jeff', 'jeffrey', 'jenny',
    'jerome', 'jimmy', 'joan', 'joanna', 'joel', 'johnny', 'jordan',
    'joyce', 'judy', 'julian', 'julie', 'justin', 'kathy', 'keith',
    'kelly', 'kim', 'kimberly', 'larry', 'lawrence', 'leah', 'lena', 'leonard', 'liam',
    'lily', 'lorraine', 'louise', 'lucy', 'madison', 'maggie', 'marcus', 'marilyn', 'mason',
    'megan', 'melissa', 'michelle', 'molly', 'monica', 'noah', 'nora', 'norma',
    'oscar', 'pamela', 'parker', 'penny', 'pete', 'phillip', 'phyllis', 'polly', 'ray',
    'rebecca', 'rick', 'robin', 'ruth', 'sally', 'shawn', 'shirley', 'simon', 'sonya',
    'stanley', 'stephanie', 'tamara', 'tanya', 'teresa', 'terry', 'tina', 'travis',
    'trevor', 'tyler', 'vera', 'vincent', 'virginia', 'vivian', 'wendy',
    'yolanda', 'yvonne', 'zachary', 'iris', 'ivy', 'jade', 'jay',
    'joy', 'june', 'kai', 'clara', 'dean', 'drew', 'duke', 'earl', 'eli',
    'emmy', 'erica', 'erin', 'evan', 'eve', 'fiona', 'gene', 'gina', 'glen', 'ida',
    'jill', 'jon', 'kent', 'kris', 'kurt', 'kyle', 'lea', 'leon', 'lori',
    'lou', 'lynn', 'marc', 'mel', 'mia', 'milo', 'mira', 'myra', 'nate', 'nell',
    'nina', 'norm', 'pete', 'phil', 'rae', 'rex', 'rob', 'rod', 'ron', 'rory',
    'ross', 'ruby', 'russ', 'sal', 'sean', 'seth', 'sid', 'stan',
    'tara', 'theo', 'tess', 'todd', 'toni', 'tony', 'troy', 'val',
    'vern', 'wade', 'walt', 'wayne', 'wes', 'zach', 'zoe', 'abbey', 'abby',
    'abigail', 'ada', 'adele', 'aiden', 'aileen', 'aimee', 'aisha', 'alana',
    'albert', 'alec', 'alexa', 'alexander', 'alexandra', 'alexia', 'alexis', 'alfred',
    'alicia', 'alison', 'allison', 'ally', 'alma', 'alvin', 'alyssa', 'amber', 'amelia',
    'amos', 'anastasia', 'andrea', 'angel', 'angelica', 'anita', 'annika',
    'benedict', 'blanche', 'bonnie', 'brenda', 'brent', 'brett', 'bridget', 'brittany',
    'brooke', 'caleb', 'candace', 'carl', 'carla', 'carlton', 'carmen', 'cassandra',
    'cassidy', 'cecilia', 'chad', 'charity', 'chester', 'christian', 'christmas',
    'clark', 'claude', 'claudia', 'clyde', 'cole', 'colleen', 'connie', 'constance',
    'corey', 'courtney', 'craig', 'crystal', 'curt', 'daisy', 'dallas', 'dana', 'darcy',
    'darren', 'darwin', 'dena', 'derek', 'derrick', 'desiree', 'devin', 'diane',
    'dirk', 'dolores', 'dominic', 'dora', 'doris', 'dorothea', 'dougal', 'duane',
    'dustin', 'dwayne', 'edith', 'edna', 'eileen', 'eleanor', 'elena', 'elisa',
    'elise', 'eliza', 'ellen', 'ellie', 'elliot', 'emma', 'enid', 'ernest', 'esther',
    'eunice', 'ezra', 'felicia', 'felicity', 'felix', 'flora', 'florence', 'floyd',
    'frances', 'francisca', 'freddie', 'frederick', 'gail', 'gareth', 'garrett',
    'gavin', 'gemma', 'genevieve', 'geoffrey', 'geraldine', 'gertrude', 'gideon',
    'gilbert', 'giles', 'gillian', 'gina', 'ginny', 'glenda', 'gordon', 'gretchen',
    'griffin', 'guadalupe', 'gwen', 'gwendolyn', 'hal', 'harriet', 'harvey', 'hazel',
    'heath', 'heather', 'hector', 'hershel', 'hilda', 'homer', 'horace', 'houston',
    'howard', 'hubert', 'hugo', 'humphrey', 'ingrid', 'irma', 'irving', 'isadora',
    'isaiah', 'isla', 'isobel', 'jacqueline', 'jasmine', 'javier', 'jayden', 'jenna',
    'jeremiah', 'jessie', 'jocelyn', 'joey', 'jonah', 'jonathan', 'jonathon', 'jorge',
    'jose', 'josephine', 'josie', 'juan', 'judith', 'julian', 'juliet', 'julius'
}

files_to_check = [
    r'd:\antigravity\stepupvoca\app\src\data\vocaDB_core.json',
    r'd:\antigravity\stepupvoca\app\src\data\vocaDB_ja.json',
    r'd:\antigravity\stepupvoca\app\src\data\vocaDB_tw.json',
    r'd:\antigravity\stepupvoca\app\src\data\vocaDB_vi.json',
    r'd:\antigravity\stepupvoca\app\src\data\vocaDB_zh.json',
]

all_found = {}

for filepath in files_to_check:
    lang = filepath.split('vocaDB_')[-1].replace('.json', '').upper()
    if 'core' in filepath:
        lang = 'CORE(EN)'
    
    try:
        with open(filepath, encoding='utf-8') as f:
            data = json.load(f)
        
        found = []
        for level_data in data:
            level = level_data['level']
            for word in level_data['words']:
                w = word['w'].lower()
                if w in common_names:
                    found.append({'level': level, 'word': word['w'], 'meaning': word['m']})
        
        if found:
            all_found[lang] = found
            print(f"\n[{lang}] - {len(found)}개 발견:")
            for item in sorted(found, key=lambda x: x['level']):
                print(f"  레벨 {item['level']:2d}: {item['word']:<20} ({item['meaning']})")
        else:
            print(f"\n[{lang}] - 사람 이름 없음")
    except Exception as e:
        print(f"\n[{lang}] - 오류: {e}")

print(f"\n\n=== 요약 ===")
total = sum(len(v) for v in all_found.values())
print(f"총 {total}개의 사람 이름 어휘 발견")
