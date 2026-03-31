import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// ==========================================
// ⚙️ 1. 설정 (Configuration)
// ==========================================

// TODO: 발급받으신 구글 Gemini API 키를 여기에 넣어주세요!
const GEMINI_API_KEY = "AIzaSyBvdY6geI-G6VAfyiTVVn5OWNdn434F-_Q";

// 봇이 로그인할 가상 계정 정보 (자동 회원가입 및 로그인용)
const BOT_EMAIL = "bot_vocaquest@gmail.com";
const BOT_PASSWORD = "vocaquestbot123!@";

// 봇 동작 주기 (밀리초 단위) - 예: 2시간 = 2 * 60 * 60 * 1000
const POST_INTERVAL_MS = 2 * 60 * 60 * 1000;
// 랜덤 오차 (±30분)
const JITTER_MS = 30 * 60 * 1000;

// Firebase 설정 (기존 프로젝트 설정 재사용)
const firebaseConfig = {
    apiKey: "AIzaSyBillXmxfj_vSWODqO-21uBgEuoi_1drGA",
    authDomain: "vocaquest-7ebea.firebaseapp.com",
    projectId: "vocaquest-7ebea",
    storageBucket: "vocaquest-7ebea.firebasestorage.app",
    messagingSenderId: "806999527929",
    appId: "1:806999527929:web:da34566d0b4cd1b4b12d28",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==========================================
// 👥 2. 가상 멤버 데이터베이스 (Virtual Profiles)
// ==========================================
// 다양한 국적, 성별, 나이대의 가상 사용자 프로필
const VIRTUAL_PROFILES = [
    { uid: "bot_01", name: "Minji_K", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Minji&backgroundColor=ffd5dc", lang: "ko" },
    { uid: "bot_02", name: "John.Study", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=b6e3f4", lang: "en" },
    { uid: "bot_03", name: "사쿠라🌸", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sakura&backgroundColor=c0aede", lang: "ja" },
    { uid: "bot_04", name: "Hao_Wang", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Hao&backgroundColor=ffdfbf", lang: "zh" },
    { uid: "bot_05", name: "Alex.Eng", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=ffd5dc", lang: "en" },
    { uid: "bot_06", name: "K-Drama_Fan", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Drama&backgroundColor=b6e3f4", lang: "en" },
    { uid: "bot_07", name: "찌니(Jjini)", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Jjini&backgroundColor=c0aede", lang: "ko" },
    { uid: "bot_08", name: "토익1000점가즈아", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Toeic&backgroundColor=ffdfbf", lang: "ko" },
    { uid: "bot_09", name: "Yukiito", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Yuki&backgroundColor=ffd5dc", lang: "ja" },
    { uid: "bot_10", name: "Lan.N", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Lan&backgroundColor=b6e3f4", lang: "vi" },
];

const CATEGORIES = ["FREE", "STUDY", "QNA", "EXCHANGE"];

// ==========================================
// 🧠 3. 핵심 로직 (Main Logic)
// ==========================================

// 지정된 언어에 따라 프롬프트 톤앤매너 설정
const getPromptByLang = (lang, name) => {
    let basePrompt = `당신은 언어 교환 앱(VocaQuest)의 커뮤니티 유저 '${name}'입니다. 
딱딱한 AI처럼 보이지 않고 "진짜 사람"이 커뮤니티에 남기는 소소하고 자연스러운 게시글을 1개 작성해주세요. 
이모지도 적절히 사용하세요. HTML 태그 덩어리는 피하고 줄바꿈을 많이 활용하세요.
응답은 오직 JSON 형식으로만 응답해야 합니다. 마크다운(\`\`\`)은 절대 포함하지 마세요.

필수 필드와 예시 형식:
{
  "title": "글 제목 (짧고 호기심을 유발하게)",
  "content": "가벼운 소통, 질문, 학습 팁 등 다양한 목적의 자연스러운 문장 (1~3문단)"
}
    `;

    if (lang === "ko") {
        basePrompt += `\n주제: 일상 소통, 공부 고민, 취업/시험 준비, 재미있는 에피소드 중 랜덤. 문체는 디시인사이드나 에브리타임, 네이버 카페 등 20~30대 한국인이 쓰는 자연스러운 인터넷 말투(해요체, 해라체 등 섞어서).`;
    } else if (lang === "en") {
        basePrompt += `\nTopic: Asking for K-drama recommendations, struggling with Korean grammar, looking for language exchange partners, or daily life. Write entirely in casual, natural English (like Reddit or Twitter).`;
    } else if (lang === "ja") {
        basePrompt += `\nTopic: 韓国語の勉強の悩み、日常の出来事、おすすめの韓国旅行についてなど。日本の20代が多く使う自然でカジュアルな日本語（TwitterやLINEのような口調、笑いや顔文字も少し入れて）で書いてください。`;
    } else {
        basePrompt += `\nTopic: Learning languages, daily life, culture exchange. Write in simple and natural language for the given language code '${lang}'.`;
    }

    return basePrompt;
};

// Gemini API를 이용해 게시물 데이터 생성
async function generatePostContent(profile) {
    const prompt = getPromptByLang(profile.lang, profile.name);

    // 카테고리 무작위 픽
    const targetCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.9,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const outputText = data.candidates[0].content.parts[0].text;

        let postData;
        try {
            postData = JSON.parse(outputText.trim());
        } catch (e) {
            // fallback parsing (in case Gemini wraps it with extra text)
            const match = outputText.match(/\{.*\}/s);
            if (match) postData = JSON.parse(match[0]);
            else throw e;
        }

        return {
            category: targetCategory,
            title: postData.title,
            content: postData.content,
        };
    } catch (error) {
        console.error("❌ 글 생성 중 에러 발생:", error);
        return null;
    }
}

// 봇이 한 번 글을 작성하는 함수
async function executeBotPosting() {
    if (GEMINI_API_KEY === "여기에_키를_입력하세요") {
        console.error("🚨 GEMINI_API_KEY를 먼저 설정해주세요!");
        process.exit(1);
    }

    // 1. 프로필 랜덤 선택
    const profile = VIRTUAL_PROFILES[Math.floor(Math.random() * VIRTUAL_PROFILES.length)];
    console.log(`🤖 [${new Date().toLocaleTimeString()}] 가상 유저 '${profile.name}' (${profile.lang}) 가 글쓰기를 시도합니다...`);

    // 2. 글 생성
    const generatedData = await generatePostContent(profile);
    if (!generatedData) {
        console.log("⚠️ 글 생성에 실패하여 건너뜁니다.");
        return;
    }

    // 3. Firestore 업로드
    try {
        const postDoc = {
            category: generatedData.category,
            title: generatedData.title,
            content: generatedData.content,
            mediaUrls: [],
            authorId: profile.uid,
            authorName: profile.name,
            authorAvatar: profile.avatar,
            originalLang: profile.lang,
            createdAt: serverTimestamp(),
            viewCount: Math.floor(Math.random() * 10), // 초기 뷰카운트도 자연스럽게
            commentCount: 0,
            isHidden: false
        };

        const docRef = await addDoc(collection(db, 'community_posts'), postDoc);
        console.log(`✅ 글 업로드 성공! [ID: ${docRef.id}] 카테고리: ${generatedData.category} | 제목: ${generatedData.title}`);
    } catch (err) {
        console.error("❌ Firebase 업로드 실패:", err);
    }
}

// 봇 로그인 함수 (Firebase Auth)
async function ensureBotAuthenticated() {
    try {
        await signInWithEmailAndPassword(auth, BOT_EMAIL, BOT_PASSWORD);
        console.log("🔒 봇 계정 로그인 성공!");
    } catch (error) {
        // 계정이 없으면 생성
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            console.log("🆕 봇 계정이 없어 새로 생성합니다...");
            try {
                await createUserWithEmailAndPassword(auth, BOT_EMAIL, BOT_PASSWORD);
                console.log("✅ 봇 계정 생성 및 초회 로그인 성공!");
            } catch (createError) {
                console.error("❌ 봇 계정 생성 실패:", createError);
                process.exit(1);
            }
        } else {
            console.error("❌ 봇 로그인 실패:", error);
            process.exit(1);
        }
    }
}

// ==========================================
// ⏳ 4. 실행 스케줄러 (Scheduler)
// ==========================================
async function startBot() {
    console.log("==================================================");
    console.log("🚀 VocaQuest 커뮤니티 자동 포스팅 봇 가동 시작!");
    console.log("멈추려면 터미널 창에서 [Ctrl + C] 를 누르세요.");
    console.log("==================================================");

    // 1. Firebase 로그인 (최초 1회 필수)
    await ensureBotAuthenticated();

    // 구동 직후 테스트삼아 즉시 1개 글 작성
    await executeBotPosting();

    // 이후 타이머 반복 실행
    const scheduleNextPost = () => {
        // 기본 쿨타임 + 랜덤 오차 (너무 기계적이지 않도록)
        const delay = POST_INTERVAL_MS + (Math.random() * JITTER_MS * 2 - JITTER_MS);
        console.log(`\n⏳ 다음 글은 약 ${Math.floor(delay / 1000 / 60)}분 뒤에 작성됩니다...`);

        setTimeout(async () => {
            await executeBotPosting();
            scheduleNextPost(); // 자기 자신을 재귀호출하여 영구 루프 생성
        }, delay);
    };

    scheduleNextPost();
}

startBot();
