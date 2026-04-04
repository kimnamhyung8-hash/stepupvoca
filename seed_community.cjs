const admin = require('firebase-admin');
const fs = require('fs');

// Load service account (Ensure this targets your production DB like other scripts)
const serviceAccount = require('./serviceAccountKey.json.json');
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\r/g, '');
}
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// 1. Define Virtual Users
const virtualUsers = [
    { uid: 'v_user_1_ko', nickname: '영어초보탈출', email: 'vuser1@example.com', photoURL: 'https://ui-avatars.com/api/?name=영&background=random', level: 3, language: 'ko-KR' },
    { uid: 'v_user_2_en', nickname: 'Alex', email: 'vuser2@example.com', photoURL: 'https://ui-avatars.com/api/?name=A&background=random', level: 12, language: 'en-US' },
    { uid: 'v_user_3_ja', nickname: 'Sakura_99', email: 'vuser3@example.com', photoURL: 'https://ui-avatars.com/api/?name=Sa&background=random', level: 8, language: 'ja-JP' },
    { uid: 'v_user_4_ko', nickname: '보카마스터', email: 'vuser4@example.com', photoURL: 'https://ui-avatars.com/api/?name=보&background=random', level: 15, language: 'ko-KR' },
    { uid: 'v_user_5_en', nickname: 'Sarah_T', email: 'vuser5@example.com', photoURL: 'https://ui-avatars.com/api/?name=S&background=random', level: 7, language: 'en-US' },
    { uid: 'v_user_6_ko', nickname: '열공러', email: 'vuser6@example.com', photoURL: 'https://ui-avatars.com/api/?name=열&background=random', level: 5, language: 'ko-KR' },
    { uid: 'v_user_7_ja', nickname: 'Kenji', email: 'vuser7@example.com', photoURL: 'https://ui-avatars.com/api/?name=K&background=random', level: 4, language: 'ja-JP' }
];

// Helper to get a date n days ago
const getPastDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return admin.firestore.Timestamp.fromDate(d);
};

// 2. Define Posts
const postsData = [
    {
        author: virtualUsers[0],
        category: 'FREE',
        title: '드디어 레벨 3 달성했습니다! 🎉',
        content: '요즘 출퇴근길에 조금씩 꾸준히 하고 있는데 확실히 실력이 느는 것 같아서 너무 뿌듯하네요. 다들 화이팅입니다!',
        title_en: 'Finally reached level 3! 🎉',
        content_en: 'I’ve been studying consistently on my way to work, and I feel my skills are improving. Cheer up everyone!',
        originalLang: 'ko-KR',
        daysAgo: 4,
        views: 124
    },
    {
        author: virtualUsers[1],
        category: 'STUDY',
        title: 'What is the exact difference between "effect" and "affect"?',
        content: 'I always get confused when writing essays... Can someone explain it simply?',
        title_en: 'What is the exact difference between "effect" and "affect"?',
        content_en: 'I always get confused when writing essays... Can someone explain it simply?',
        originalLang: 'en-US',
        daysAgo: 3.5,
        views: 312
    },
    {
        author: virtualUsers[2],
        category: 'EXCHANGE',
        title: '韓国語の勉強を始めました！言語交換しませんか？',
        content: 'こんにちは。日本から来たサクラです。韓国語の発音がとても難しいです。お互いに助け合える方を探しています😊',
        title_en: 'I started studying Korean! Language exchange anyone?',
        content_en: 'Hello. I am Sakura from Japan. Korean pronunciation is very difficult. I am looking for someone we can help each other 😊',
        originalLang: 'ja-JP',
        daysAgo: 2,
        views: 89
    },
    {
        author: virtualUsers[3],
        category: 'STUDY',
        title: '단어 그냥 외우지 마세요! 저만의 꿀팁 💡',
        content: '보카퀘스트 스피킹 모드로 예문을 통째로 읽어버리는 게 최고입니다. 그냥 뜻만 외우면 다음날 다 까먹는데, 문맥으로 외우니 2배는 오래 갑니다.',
        title_en: 'Don\'t just memorize words! My personal tip 💡',
        content_en: 'Reading the whole example sentence aloud using VocaQuest speaking mode is the best. If you just memorize the meaning, you forget it the next day, but in context, it lasts twice as long.',
        originalLang: 'ko-KR',
        daysAgo: 1.5,
        views: 450
    },
    {
        author: virtualUsers[4],
        category: 'FREE',
        title: 'Hello everyone! New here 👋',
        content: 'Just downloaded the app today. The UI is super clean and the gamification keeps me motivated.',
        title_en: 'Hello everyone! New here 👋',
        content_en: 'Just downloaded the app today. The UI is super clean and the gamification keeps me motivated.',
        originalLang: 'en-US',
        daysAgo: 0.8,
        views: 56
    },
    {
        author: virtualUsers[5],
        category: 'FREE',
        title: '와 커뮤니티 기능 생겼네요!! 대박 👍',
        content: '혼자 공부해서 가끔 외로웠는데 번역기능까지 있어서 진짜 글로벌 플랫폼 느낌 나네요 ㅋㅋㅋ 개발자님 열일 감사합니다!',
        title_en: 'Wow, community feature is here!! Awesome 👍',
        content_en: 'I felt a bit lonely studying alone, but with the translation feature, it really feels like a global platform lol. Thanks to the dev for hard work!',
        originalLang: 'ko-KR',
        daysAgo: 0.2,
        views: 210
    }
];

// 3. Define Comments
// Note: We will associate comments by post array index.
const commentsData = [
    // Comments for Post 1 (effect vs affect)
    { postIndex: 1, author: virtualUsers[3], content: '"Affect"는 주로 동사(영향을 미치다), "effect"는 주로 명사(결과/영향)입니다! Affect=Action으로 외우시면 쉬워요.', content_en: '"Affect" is usually a verb, and "effect" is usually a noun! It\'s easy if you memorize Affect=Action.', originalLang: 'ko-KR', daysAgo: 3.4 },
    { postIndex: 1, author: virtualUsers[4], content: 'Wow, that mnemonic is brilliant! Thank you so much!', content_en: 'Wow, that mnemonic is brilliant! Thank you so much!', originalLang: 'en-US', daysAgo: 3.3 },

    // Comments for Post 2 (Language Exchange Sakura)
    { postIndex: 2, author: virtualUsers[5], content: '안녕하세요! 저 일본어 공부 중인데 교환환영입니다 언제든 톡주세요~', content_en: 'Hello! I am studying Japanese, exchange is welcome, ping me anytime~', originalLang: 'ko-KR', daysAgo: 1.8 },
    { postIndex: 2, author: virtualUsers[2], content: 'ありがとうございます！メッセージ送りますね。', content_en: 'Thank you! I will send you a message.', originalLang: 'ja-JP', daysAgo: 1.5 },

    // Comments for Post 3 (Word Tip)
    { postIndex: 3, author: virtualUsers[0], content: '진짜 공감합니다. 스피킹 모드가 신의 한수인듯요 ㅠㅠ', content_en: 'I totally agree. Speaking mode is a godsend ㅠㅠ', originalLang: 'ko-KR', daysAgo: 1.4 },
    { postIndex: 3, author: virtualUsers[6], content: '確かにその通りですね。私も試してみます！', content_en: 'That is definitely true. I will try it too!', originalLang: 'ja-JP', daysAgo: 1.0 },

    // Comments for Post 5 (New Community feature)
    { postIndex: 5, author: virtualUsers[1], content: 'Yeah, the auto-translation is crazy good!', content_en: 'Yeah, the auto-translation is crazy good!', originalLang: 'en-US', daysAgo: 0.1 }
];

async function seedData() {
    console.log('--- Seeding Script Started ---');
    try {
        // 1. Create Virtual Users in Firestore
        console.log('Seeding Virtual Users...');
        for (const user of virtualUsers) {
            const userRef = db.collection('users').doc(user.uid);
            await userRef.set({
                nickname: user.nickname,
                email: user.email,
                photoURL: user.photoURL,
                level: user.level,
                language: user.language,
                role: 'USER',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        console.log(`Created ${virtualUsers.length} virtual users.`);

        // 2. Create Posts
        console.log('Seeding Posts...');
        const generatedPosts = [];
        for (const post of postsData) {
            const docRef = await db.collection('community_posts').add({
                category: post.category,
                title: post.title,
                content: post.content,
                title_en: post.title_en || '',
                content_en: post.content_en || '',
                mediaUrls: [],
                authorId: post.author.uid,
                authorName: post.author.nickname,
                authorAvatar: post.author.photoURL,
                originalLang: post.originalLang,
                createdAt: getPastDate(post.daysAgo),
                viewCount: post.views,
                commentCount: 0 // Will increment as we add comments
            });
            generatedPosts.push(docRef.id);
        }
        console.log(`Created ${generatedPosts.length} posts.`);

        // 3. Create Comments and Update Comment Count
        console.log('Seeding Comments...');
        for (const comment of commentsData) {
            const postId = generatedPosts[comment.postIndex];
            if (!postId) continue;

            await db.collection('community_comments').add({
                postId: postId,
                authorId: comment.author.uid,
                authorName: comment.author.nickname,
                authorAvatar: comment.author.photoURL,
                content: comment.content,
                content_en: comment.content_en || '',
                originalLang: comment.originalLang,
                createdAt: getPastDate(comment.daysAgo)
            });

            // Increment comment count in Post
            const postRef = db.collection('community_posts').doc(postId);
            await postRef.update({
                commentCount: admin.firestore.FieldValue.increment(1)
            });
        }
        console.log(`Created ${commentsData.length} comments.`);

        console.log('--- Seeding Script Finished Successfully! ---');

    } catch (error) {
        console.error('Error during seeding:', error);
    }
}

seedData().then(() => process.exit(0));
