import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Capacitor } from '@capacitor/core';
import { getActiveApiKey, LIGHTWEIGHT_MODEL } from './apiUtils';
import { ChevronDown, BookOpen, Volume2, X, RefreshCw, Sparkles } from 'lucide-react';
import { play20sFemaleTTS } from './utils/ttsUtils';
import { showAdIfFree } from './admob';
import { t } from './i18n';
import { PcAdSlot } from './components/PcComponents';

// --- DATA: The 50 Core English Function Words ---
const bibleData = [
    {
        categoryId: 'prepositions',
        categoryName: {
            ko: '전치사 (Prepositions)', en: 'Prepositions', ja: '前置詞', zh: '介词', tw: '介詞', vi: 'Giới từ'
        },
        desc: {
            ko: '대화에서 장소, 시간, 방향, 관계 등 문장의 뼈대를 잡아주지만 가장 많이 틀리는 녀석들이야.',
            en: 'Forms the backbone of sentences for place, time, direction, but often misused.',
            ja: '場所、時間、方向、関係など文の骨組みを作りますが、一番間違えやすいです。',
            zh: '在对话中为地点、时间、方向等奠定基础，但也是最容易错的。',
            tw: '在對話中為地點、時間、方向等奠定基礎，但也是最容易錯的。',
            vi: 'Tạo thành xương sống của câu cho địa điểm, thời gian, hướng đi, nhưng thường bị lạm dụng.'
        },
        items: [
            { word: 'in', desc: { ko: '공간/시간의 안, 넓은 범위', en: 'Inside space/time, broad area', ja: '空間/時間の中、広い範囲', zh: '空间/时间之内，大范围', tw: '空間/時間之內，大範圍', vi: 'Trong không gian/thời gian, phạm vi rộng' } },
            { word: 'on', desc: { ko: '표면 접촉, 특정한 날', en: 'Surface contact, specific day', ja: '表面への接触、特定の日', zh: '表面接触，特定日子', tw: '表面接觸，特定日子', vi: 'Tiếp xúc bề mặt, ngày cụ thể' } },
            { word: 'at', desc: { ko: '정확한 지점, 구체적인 시각', en: 'Exact point, specific time', ja: '正確な地点、具体的な時刻', zh: '准确地点，具体时间', tw: '準確地點，具體時間', vi: 'Điểm chính xác, thời gian cụ thể' } },
            { word: 'to', desc: { ko: '방향, 목적지, ~에게', en: 'Direction, destination, to', ja: '方向、目的地、～へ', zh: '方向，目的地，向', tw: '方向，目的地，向', vi: 'Hướng, điểm đến, tới' } },
            { word: 'for', desc: { ko: '목적, 기간, ~를 위해', en: 'Purpose, duration, for', ja: '目的、期間、～のために', zh: '目的，期间，为了', tw: '目的，期間，為了', vi: 'Mục đích, thời gian, cho' } },
            { word: 'with', desc: { ko: '함께, 도구를 사용하여', en: 'Together, using a tool', ja: '一緒に、道具を使って', zh: '同伴，使用工具', tw: '同伴，使用工具', vi: 'Cùng với, sử dụng công cụ' } },
            { word: 'about', desc: { ko: '~에 대하여, 대략', en: 'About, approximately', ja: '～について、約', zh: '关于，大约', tw: '關於，大約', vi: 'Về, khoảng' } },
            { word: 'from', desc: { ko: '출발점, 출처', en: 'Starting point, origin', ja: '出発点、起源', zh: '起点，来源', tw: '起點，來源', vi: 'Điểm bắt đầu, nguồn gốc' } },
            { word: 'by', desc: { ko: '수단, ~옆에, ~까지', en: 'Means, beside, by', ja: '手段、～のそば、～までに', zh: '手段，在...旁边，到...为止', tw: '手段，在...旁邊，到...為止', vi: 'Phương tiện, bên cạnh, bởi' } },
            { word: 'of', desc: { ko: '소유, ~중에서, ~에 대한', en: 'Possession, among, of', ja: '所有、～の中で、～の', zh: '所有，其中，关于', tw: '所有，其中，關於', vi: 'Sở hữu, trong số, của' } },
            { word: 'as', desc: { ko: '~로서, ~처럼', en: 'As, like', ja: '～として、～のように', zh: '作为，像', tw: '作為，像', vi: 'Như, như là' } },
            { word: 'into', desc: { ko: '안으로 들어가는 움직임', en: 'Movement into something', ja: '中に入っていく動き', zh: '进入内部的动作', tw: '進入內部的動作', vi: 'Di chuyển vào trong' } },
            { word: 'like', desc: { ko: '~처럼, 비슷한', en: 'Like, similar to', ja: '～のような、似た', zh: '像，类似', tw: '像，類似', vi: 'Giống như, tương tự' } },
            { word: 'over', desc: { ko: '~너머, 포물선을 그리는 위', en: 'Over, above in an arc', ja: '～を越えて、放物線を描く上', zh: '越过，呈抛物线之上', tw: '越過，呈拋物線之上', vi: 'Vượt qua, phía trên' } },
            { word: 'through', desc: { ko: '~을 통과하여, 처음부터 끝까지', en: 'Through, from start to finish', ja: '～を通過して、最初から最後まで', zh: '穿过，从头到尾', tw: '穿過，從頭到尾', vi: 'Xuyên qua, từ đầu đến cuối' } }
        ]
    },
    {
        categoryId: 'conjunctions',
        categoryName: {
            ko: '접속사 (Conjunctions)', en: 'Conjunctions', ja: '接続詞', zh: '连词', tw: '連詞', vi: 'Liên từ'
        },
        desc: {
            ko: '짧은 단어들을 길고 유창한 문장으로 이어주는 접착제 역할을 해.',
            en: 'Acts as glue to connect short words into long, fluent sentences.',
            ja: '短い単語を長くて流暢な文に繋ぐ接着剤の役目をします。',
            zh: '就像胶水一样，将短词连接成长而流畅的句子。',
            tw: '就像膠水一樣，將短詞連接成長而流暢的句子。',
            vi: 'Hoạt động như chất keo để kết nối các từ ngắn thành các câu dài, trôi chảy.'
        },
        items: [
            { word: 'and', desc: { ko: '그리고, 그래서', en: 'And, so', ja: 'そして、それで', zh: '和，所以', tw: '和，所以', vi: 'Và, vì vậy' } },
            { word: 'but', desc: { ko: '하지만, 그러나', en: 'But, however', ja: 'しかし、でも', zh: '但是，然而', tw: '但是，然而', vi: 'Nhưng, tuy nhiên' } },
            { word: 'so', desc: { ko: '그래서, 그럴 정도로', en: 'So, to that extent', ja: 'だから、それほど', zh: '所以，到那种程度', tw: '所以，到那種程度', vi: 'Vì vậy, đến mức đó' } },
            { word: 'or', desc: { ko: '또는, 그렇지 않으면', en: 'Or, otherwise', ja: 'または、さもないと', zh: '或者，否则', tw: '或者，否則', vi: 'Hoặc, nếu không' } },
            { word: 'because', desc: { ko: '왜냐하면', en: 'Because', ja: 'なぜなら', zh: '因为', tw: '因為', vi: 'Bởi vì' } },
            { word: 'if', desc: { ko: '만약 ~라면', en: 'If', ja: 'もし～なら', zh: '如果', tw: '如果', vi: 'Nếu' } },
            { word: 'when', desc: { ko: '~할 때', en: 'When', ja: '～する時', zh: '当...时', tw: '當...時', vi: 'Khi' } },
            { word: 'while', desc: { ko: '~하는 동안, 반면에', en: 'While, whereas', ja: '～の間、一方で', zh: '在...期间，然而', tw: '在...期間，然而', vi: 'Trong khi, nhưng' } },
            { word: 'although', desc: { ko: '비록 ~일지라도', en: 'Although', ja: 'たとえ～でも', zh: '尽管', tw: '儘管', vi: 'Mặc dù' } },
            { word: 'than', desc: { ko: '~보다 (비교할 때 필수)', en: 'Than (for comparisons)', ja: '～よりも（比較に必須）', zh: '比（比较时必须）', tw: '比（比較時必須）', vi: 'Hơn (khi so sánh)' } }
        ]
    },
    {
        categoryId: 'auxiliary',
        categoryName: {
            ko: '조동사 (Auxiliary / Modal Verbs)', en: 'Auxiliary Verbs', ja: '助動詞', zh: '助动词', tw: '助動詞', vi: 'Trợ động từ'
        },
        desc: {
            ko: '동사 앞에서 화자의 감정, 의도, 예의, 가능성 등 \'뉘앙스\'를 결정짓는 핵심이야.',
            en: 'Core words that determine nuance like emotion, intent, politeness, and possibility.',
            ja: '動詞の前で話者の感情、意図、礼儀、可能性などの「ニュアンス」を決める核心です。',
            zh: '决定诸如情感、意图、礼貌和可能性等细微差别。',
            tw: '決定諸如情感、意圖、禮貌和可能性等細微差別。',
            vi: 'Đứng trước động từ để quyết định sắc thái câu.'
        },
        items: [
            { word: 'do / did', desc: { ko: '강조, 의문문, 부정문 만들기', en: 'Emphasis, questions, negatives', ja: '強調、疑問文、否定文を作る', zh: '强调，疑问句，否定句', tw: '強調，疑問句，否定句', vi: 'Nhấn mạnh, câu hỏi, phủ định' } },
            { word: 'have / had', desc: { ko: '과거부터 지금까지의 경험/완료 표현', en: 'Experience/completion from past to present', ja: '過去から現在までの経験・完了', zh: '从过去到现在的经验/完成状态', tw: '從過去到現在的經驗/完成狀態', vi: 'Kinh nghiệm/hoàn thành từ trước đến nay' } },
            { word: 'can', desc: { ko: '능력, 가벼운 허락', en: 'Ability, casual permission', ja: '能力、軽い許可', zh: '能力，随意允许', tw: '能力，隨意允許', vi: 'Khả năng, cho phép' } },
            { word: 'could', desc: { ko: '과거의 능력, 공손한 요청, 약한 추측', en: 'Past ability, polite request, weak guess', ja: '過去の能力、丁寧な依頼、弱い推量', zh: '过去的能力，礼貌请求，弱猜测', tw: '過去的能力，禮貌請求，弱猜測', vi: 'Khả năng trong quá khứ, yêu cầu lịch sự' } },
            { word: 'will', desc: { ko: '미래의 의지, 예측', en: 'Future will, prediction', ja: '未来の意志、予測', zh: '未来意愿，预测', tw: '未來意願，預測', vi: 'Tương lai, dự đoán' } },
            { word: 'would', desc: { ko: '상상, 공손한 제안, 과거의 습관', en: 'Imagination, polite suggestion, past habit', ja: '想像、丁寧な提案、過去の習慣', zh: '想象，礼貌建议，过去习惯', tw: '想像，禮貌建議，過去習慣', vi: 'Tưởng tượng, đề nghị lịch sự, thói quen cũ' } },
            { word: 'should', desc: { ko: '가벼운 의무, 조언, 추천', en: 'Mild duty, advice, recommendation', ja: '軽い義務、忠告、おすすめ', zh: '轻微义务，建议，推荐', tw: '輕微義務，建議，推薦', vi: 'Nghĩa vụ nhẹ, lời khuyên, giới thiệu' } },
            { word: 'may', desc: { ko: '허락, 불확실한 추측', en: 'Permission, uncertain guess', ja: '許可、不確かな推量', zh: '许可，不确定的猜测', tw: '許可，不確定的猜測', vi: 'Cho phép, suy đoán không chắc' } },
            { word: 'might', desc: { ko: 'may보다 더 희박한 가능성/추측', en: 'Lower probability/guess than may', ja: 'mayより低い可能性・推量', zh: '比may可能性更低的猜测', tw: '比may可能性更低的猜測', vi: 'Khả năng thấp hơn may' } },
            { word: 'must', desc: { ko: '강한 의무, 강한 확신', en: 'Strong duty, strong conviction', ja: '強い義務、強い確信', zh: '强烈的义务，坚定的信念', tw: '強烈的義務，堅定的信念', vi: 'Nghĩa vụ mạnh, niềm tin mạnh' } }
        ]
    },
    {
        categoryId: 'pronouns',
        categoryName: {
            ko: '대명사 (Pronouns)', en: 'Pronouns', ja: '代名詞', zh: '代词', tw: '代詞', vi: 'Đại từ'
        },
        desc: {
            ko: '같은 명사의 반복을 피하고 대화의 템포를 끌어올려 주는 단어들이지.',
            en: 'Words that avoid repetition and speed up the tempo of conversation.',
            ja: '同じ名詞の繰り返しを避け、会話のテンポを上げる単語たちです。',
            zh: '避免重复并加快对话节奏的单词。',
            tw: '避免重複並加快對話節奏的單詞。',
            vi: 'Tránh lặp lại danh từ và tăng nhịp độ đàm thoại.'
        },
        items: [
            { word: 'it', desc: { ko: '그것, 날씨/시간 등을 나타낼 때', en: 'It, weather/time etc.', ja: 'それ、天気や時間を表す時', zh: '它，表示天气/时间等', tw: '它，表示天氣/時間等', vi: 'Nó, thời tiết/thời gian' } },
            { word: 'that', desc: { ko: '저것, 앞서 말한 내용 전체', en: 'That, the entire previous statement', ja: 'あれ、前に話した内容全体', zh: '那个，前面提到的整个内容', tw: '那個，前面提到的整個內容', vi: 'Điều đó, nội dung trước đó' } },
            { word: 'this', desc: { ko: '이것, 지금 말하려는 내용', en: 'This, what I am about to say', ja: 'これ、今から話す内容', zh: '这个，现在要说的内容', tw: '這個，現在要說的內容', vi: 'Điều này, nội dung sắp nói' } },
            { word: 'what', desc: { ko: '무엇, ~하는 것', en: 'What, the thing that', ja: '何、〜するもの', zh: '什么，～的事物', tw: '什麼，～的事物', vi: 'Cái gì, điều mà' } },
            { word: 'which', desc: { ko: '어느 것 (선택지가 있을 때)', en: 'Which (when there are choices)', ja: 'どれ（選択肢がある時）', zh: '哪个（有选项时）', tw: '哪個（有選項時）', vi: 'Cái nào (khi có lựa chọn)' } },
            { word: 'who', desc: { ko: '누구', en: 'Who', ja: '誰', zh: '谁', tw: '誰', vi: 'Ai' } },
            { word: 'someone', desc: { ko: '누군가 (주로 긍정문)', en: 'Someone (mostly affirmative)', ja: '誰か（主に肯定文）', zh: '某人（主要用于肯定句）', tw: '某人（主要用於肯定句）', vi: 'Ai đó (khẳng định)' } },
            { word: 'anyone', desc: { ko: '누구든 (부정문, 의문문, 조건문)', en: 'Anyone (negative, questions, conditions)', ja: '誰でも（否定文・疑問文・条件文）', zh: '任何人（否定句，疑问句，条件句）', tw: '任何人（否定句，疑問句，條件句）', vi: 'Bất kỳ ai' } },
            { word: 'everything', desc: { ko: '모든 것', en: 'Everything', ja: '全てのもの', zh: '一切', tw: '一切', vi: 'Mọi thứ' } },
            { word: 'nothing', desc: { ko: '아무것도 아님', en: 'Nothing', ja: '何もない', zh: '什么都没有', tw: '什麼都沒有', vi: 'Không có gì' } }
        ]
    },
    {
        categoryId: 'determiners',
        categoryName: {
            ko: '한정사 (Determiners)', en: 'Determiners', ja: '限定詞', zh: '限定词', tw: '限定詞', vi: 'Từ hạn định'
        },
        desc: {
            ko: '명사 앞에 붙어서 그 명사가 얼마나 구체적인지, 양이 얼마나 되는지 한정해 줘.',
            en: 'Attaches before a noun to clarify how specific or how much it is.',
            ja: '名詞の前について、その名詞がどれくらい具体的か、量がどれくらいかを限定します。',
            zh: '放在名词前面，限制它的具体性及数量。',
            tw: '放在名詞前面，限制它的具體性及數量。',
            vi: 'Đứng trước danh từ để làm rõ sự cụ thể hay số lượng.'
        },
        items: [
            { word: 'the', desc: { ko: '그 (서로 알고 있는 특정한 것)', en: 'The (known specific thing)', ja: 'その（お互いに知っている特定のもの）', zh: '那个（大家都知道的特定事物）', tw: '那個（大家都知道的特定事物）', vi: 'Cái (cụ thể, đã biết)' } },
            { word: 'a / an', desc: { ko: '하나의 (불특정한 어떤 것)', en: 'A / an (unspecified thing)', ja: '一つの（特定のしない何か）', zh: '一个（不特定的某物）', tw: '一個（不特定的某物）', vi: 'Một (không cụ thể)' } },
            { word: 'some', desc: { ko: '약간의 (긍정문, 권유할 때)', en: 'Some (affirmative, offering)', ja: '少しの（肯定文、勧める時）', zh: '一些（肯定句，提议时）', tw: '一些（肯定句，提議時）', vi: 'Một số, một chút' } },
            { word: 'any', desc: { ko: '어떤 ~라도 (부정문, 의문문)', en: 'Any (negative, questions)', ja: 'どんな〜でも（否定文・疑問文）', zh: '任何人（否定句，疑问句）', tw: '任何人（否定句，疑問句）', vi: 'Bất kỳ' } },
            { word: 'all', desc: { ko: '모든', en: 'All', ja: '全ての', zh: '所有的', tw: '所有的', vi: 'Tất cả' } }
        ]
    },
    {
        categoryId: 'basic_verbs',
        categoryName: {
            ko: '기본 핵심 동사 (Basic Core Verbs)', en: 'Basic Core Verbs', ja: '基本核心動詞', zh: '基本核心动词', tw: '基本核心動詞', vi: 'Động từ cốt lõi cơ bản'
        },
        desc: {
            ko: '단순히 뜻만 외우는 게 아니라, 영어식 사고의 전체를 지배하는 가장 강력한 동사 10가지야.',
            en: 'The 10 most powerful verbs that rule English thinking, not just dictionary definitions.',
            ja: '単純な意味だけでなく、英語の思考全体を支配する最も強力な10個の動詞です。',
            zh: '这10个动词不仅是单词，它们支撑着整个英语思维体系。',
            tw: '這10個動詞不僅是單詞，它們支撐著整個英語思維體系。',
            vi: '10 động từ quyền năng nhất chi phối toàn bộ tư duy tiếng Anh.'
        },
        items: [
            { word: 'have', desc: { ko: '소유하다, (어떤 상태를) 가지고 있다', en: 'To possess or hold a state', ja: '持っている、所有する', zh: '有，拥有', tw: '有，擁有', vi: 'Có, sở hữu' } },
            { word: 'get', desc: { ko: '얻다, 상태가 변화하다, 움직이다', en: 'To obtain, change state, or move', ja: '手に入れる、（状態に）なる', zh: '得到，变成', tw: '得到，變成', vi: 'Được, trở nên' } },
            { word: 'make', desc: { ko: '만들다, (없던 것을) 생겨나게 하다', en: 'To create or cause to exist', ja: '作る、生じさせる', zh: '制作，使', tw: '製作，使', vi: 'Làm, tạo ra' } },
            { word: 'take', desc: { ko: '가지고 가다, 시간/노력이 들다, 선택하다', en: 'To take, require time/effort, or choose', ja: '手に取る、連れて行く、時間がかかる', zh: '拿，花费，采取', tw: '拿，花費，採取', vi: 'Lấy, tốn (thời gian)' } },
            { word: 'do', desc: { ko: '하다, (구체적인 행동을) 수행하다', en: 'To perform or carry out an action', ja: 'する、行う', zh: '做，执行', tw: '做，執行', vi: 'Làm, thực hiện' } },
            { word: 'let', desc: { ko: '허락하다, ~하게 두다', en: 'To allow or let happen', ja: '許す、〜させる', zh: '让，允许', tw: '讓，允許', vi: 'Để, cho phép' } },
            { word: 'give', desc: { ko: '주다, 에너지를 전달하다', en: 'To give or transfer energy', ja: '与える、渡す', zh: '给，给予', tw: '給，給補', vi: 'Cho, tặng' } },
            { word: 'work', desc: { ko: '작동하다, 일하다, 효과가 있다', en: 'To operate, work, or be effective', ja: '働く、機能する', zh: '工作，起作用', tw: '工作，起作用', vi: 'Làm việc, hoạt động' } },
            { word: 'keep', desc: { ko: '유지하다, 계속 ~하다', en: 'To maintain or continue', ja: '保つ、維持する', zh: '保持，继续', tw: '保持，繼續', vi: 'Giữ, duy trì' } },
            { word: 'go', desc: { ko: '가다, (진행 방향으로) 움직이다', en: 'To go or move in a direction', ja: '行く、進む', zh: '去, 进行', tw: '去, 進行', vi: 'Đi, di chuyển' } }
        ]
    }
];

export function BibleScreen({ settings, setScreen, aiUsage, incrementAiUsage, isPremium, setShowApiModal }: any) {
    const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['prepositions']));
    const [selectedWord, setSelectedWord] = useState<any | null>(null);
    const [wordDetails, setWordDetails] = useState<any | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

    const lang = settings.lang || 'ko';

    const getLocalStr = (obj: any) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[lang] || obj['en'] || obj['ko'] || '';
    };

    const toggleCategory = (catId: string) => {
        setExpandedCats(prev => {
            const next = new Set(prev);
            if (next.has(catId)) next.delete(catId);
            else next.add(catId);
            return next;
        });
    };



    const playTTS = async (text: string) => {
        try {
            if (settings?.tts === false) return;
            await play20sFemaleTTS(text, 'en-US');
        } catch (err) {
            console.warn("TTS Error:", err);
        }
    };

    const fetchWordDetails = async (item: any) => {
        // 1. 인게이지먼트 한도 및 키 획득
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const apiKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);

        if (!apiKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        // 사용 성공 시점에 카운트 증가 - 한도 초과 시 중단
        if (incrementAiUsage && !incrementAiUsage()) return;

        setIsLoadingDetails(true);
        setDetailError(null);
        setWordDetails(null);

        try {
            const prompt = `
        You are an expert English teacher. The user's native language is ${lang}.
        The target word/phrase is: "${item.word}" (Basic meaning: ${getLocalStr(item.desc)}).

        Provide:
        1. The core nuance and usage of this word in ${lang}.
        2. 3 highly practical sentence examples.
        3. A specific, actionable tip on how to best acquire and internalize this word.

        Return ONLY pure JSON format:
        {
          "nuance": "Detailed nuance and usage explanation",
          "examples": ["Example 1 | Translation 1", "Example 2 | Translation 2", "Example 3 | Translation 3"],
          "tip": "How to practice and remember this word effectively or suggest the best way to acquire it."
        }
        `;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!res.ok) throw new Error("API Request Failed");

            const data = await res.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonPart = textContent.match(/\{[\s\S]*\}/)?.[0];

            if (!jsonPart) throw new Error("Invalid AI response");

            setWordDetails(JSON.parse(jsonPart));
        } catch (err: any) {
            setDetailError(t(lang, 'analysis_failed'));
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <div className="screen animate-fade-in bg-[#F8FAFC] flex flex-col overflow-hidden">
            <header className="flex items-center justify-between p-6 pb-4 border-b border-indigo-50 bg-white shadow-sm z-20 shrink-0" style={{ paddingTop: 'calc(1.5rem + var(--safe-area-top))' }}>
                <button onClick={async () => { await showAdIfFree(); setScreen('HOME'); }}
 className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm"><X size={20} /></button>
                <div className="flex flex-col items-center">
                    <h2 className="text-sm font-black text-indigo-600 flex items-center gap-1.5 uppercase tracking-wide leading-none mb-1"><BookOpen size={16} /> {t(lang, 'core_50_bible')}</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t(lang, 'essential_function_words')}</span>
                </div>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">

                {/* Intro Card */}
                <div className="bg-indigo-600 text-white p-6 rounded-[32px] relative overflow-hidden shadow-xl shadow-indigo-500/20 shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h3 className="text-2xl font-black mb-2 tracking-tight italic">{t(lang, 'bible_intro_title')}</h3>
                    <p className="font-medium text-indigo-100 text-sm leading-relaxed max-w-[95%]">
                        {t(lang, 'bible_intro_desc')}
                    </p>
                </div>

                {/* Categories */}
                <div className="space-y-4 pb-12">
                    {bibleData.map((category) => {
                        const isExpanded = expandedCats.has(category.categoryId);

                        return (
                            <div key={category.categoryId}
 className={`bg-white border-2 transition-colors duration-300 rounded-[24px] overflow-hidden shadow-sm ${isExpanded ? 'border-indigo-200' : 'border-slate-100'}`}>
                                <button
                                    onClick={() => toggleCategory(category.categoryId)}
                                    className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                                >
                                    <div>
                                        <h4 className="font-black text-slate-800 text-base">{getLocalStr(category.categoryName)}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{category.items.length} words</p>
                                    </div>
                                    <div className={`p-2 rounded-full transition-transform duration-300 ${isExpanded ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                >
                                    <div className="px-5 pb-5">
                                        <p className="text-xs text-indigo-600 font-bold mb-4 px-2 py-2 bg-indigo-50/50 rounded-xl leading-relaxed">
                                            💡 {getLocalStr(category.desc)}
                                        </p>
                                        <div className="grid gap-2">
                                            {category.items.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedWord(item);
                                                        fetchWordDetails(item);
                                                    }}
                                                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 hover:bg-white cursor-pointer transition-colors shadow-sm text-left"
                                                >
                                                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                                                        <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{item.word}</span>
                                                        <span className="text-xs font-bold text-slate-500 leading-snug break-keep">{getLocalStr(item.desc)}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playTTS(item.word.split(' / ')[0]);
                                                        }}
                                                        className="w-10 h-10 bg-white rounded-xl shadow-sm text-slate-400 flex items-center justify-center active:scale-90 hover:text-indigo-500 hover:border-indigo-100 transition-all border border-slate-100 shrink-0"
                                                    >
                                                        <Volume2 size={18} />
                                                    </button>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <PcAdSlot variant="horizontal" className="mt-4" />
                </div>
            </div>

            {/* Modal Overlay for Word Details */}
            {selectedWord && createPortal(
                <div className="fixed inset-0 z-[99999] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedWord(null)}>
                    <div
                        className="bg-white max-h-[85vh] rounded-t-[32px] overflow-hidden flex flex-col shadow-2xl animate-slide-up pb-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 relative">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full" />
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 mt-2">{selectedWord.word}</h3>
                                <p className="text-sm font-bold text-indigo-500">{getLocalStr(selectedWord.desc)}</p>
                            </div>
                            <button onClick={() => setSelectedWord(null)}
 className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition mt-2">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={`p-6 pb-[calc(var(--nav-height)+${(Capacitor.getPlatform() !== 'web' && !isPremium) ? 'var(--ad-height)' : '0px'}+40px)] overflow-y-auto space-y-6 flex-1 bg-slate-50 relative animate-fade-in`}>
                            {isLoadingDetails ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <RefreshCw size={36} className="text-indigo-500 animate-spin" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">
                                        {t(lang, 'generating_details')}
                                    </p>
                                </div>
                            ) : detailError ? (
                                <div className="bg-red-50 text-red-500 p-5 rounded-2xl font-bold text-sm border border-red-100">
                                    <p className="text-center mb-4">{detailError}</p>
                                    <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 text-left">
                                        <p className="text-[11px] text-indigo-500 font-bold mb-2 leading-relaxed">
                                            {isPremium
                                                ? (lang === 'ko' ? "💡 현재 프리미엄 혜택으로 AI 기능을 무제한 이용 중입니다. 일시적인 서버 오류일 수 있으니 잠시 후 다시 시도해 주세요!" : "💡 You are using unlimited AI features with Premium. This might be a temporary error, please try again soon!")
                                                : (lang === 'ko' ? "💡 오류가 발생하거나 한도를 초과했나요? 프리미엄(PRO)을 구독하시거나 포인트를 충전하시면 최상의 AI 기능을 무제한으로 누릴 수 있습니다." : "💡 Error or limit reached? Subscribe to PRO for unlimited high-quality AI features.")
                                            }
                                        </p>
                                        {!isPremium && (
                                            <button
                                                onClick={() => setScreen('STORE')}
                                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Sparkles size={14} />
                                                {lang === 'ko' ? "프리미엄 가입 / 포인트 충전하기" : "Subscribe to PRO / Recharge Points"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : wordDetails ? (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="space-y-3">
                                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t(lang, 'practical_examples')}</h4>
                                        {wordDetails.examples.map((ex: string, i: number) => {
                                            const [eng, trans] = ex.split('|').map(s => s.trim());
                                            return (
                                                <div key={i}
 className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-indigo-200 transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <p className="text-base font-black text-slate-800 mb-1 leading-snug">{eng}</p>
                                                            <p className="text-[13px] font-bold text-slate-500 leading-snug pr-2">{trans}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => playTTS(eng)}
                                                            className="w-10 h-10 rounded-xl bg-indigo-50/80 text-indigo-500 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                                                        >
                                                            <Volume2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl relative overflow-hidden group shadow-sm">
                                        <Sparkles className="absolute -top-4 -right-4 text-indigo-500/10 w-24 h-24 group-hover:rotate-12 transition-transform duration-700" />
                                        <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><BookOpen size={14} /> {t(lang, 'nuance_explanation')}</h4>
                                        <p className="text-sm font-bold text-indigo-950 leading-relaxed z-10 relative">{wordDetails.nuance}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 p-5 rounded-3xl shadow-sm text-amber-900 mt-8">
                                        <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-1.5">💡 {t(lang, 'how_to_acquire')}</h4>
                                        <p className="text-sm font-bold leading-relaxed">{wordDetails.tip}</p>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>, document.body
            )}

        </div>
    );
}
