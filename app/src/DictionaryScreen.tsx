import { useState } from 'react';
import { Mic, MicOff, Volume2, Plus, ChevronLeft, ArrowRight, Book, RefreshCw, Globe } from 'lucide-react';
import { PcAdSlot } from './components/PcComponents';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { t } from './i18n';
import { getActiveApiKey, LIGHTWEIGHT_MODEL } from './apiUtils';


// 국기 이모지 맵 (외부 CDN 의존 제거 — 오프라인 대응)
const FLAG_EMOJI: Record<string, string> = {
    kr: '🇰🇷', us: '🇺🇸', jp: '🇯🇵', cn: '🇨🇳', tw: '🇹🇼', vn: '🇻🇳',
};

interface DictionaryResult {
    word: string;
    pronunciation: string;
    translation: string;
    explanation: string;
    examples: string[];
    meaning_loc?: {
        ko: string;
        en: string;
        ja: string;
        zh: string;
        tw: string;
        vi: string;
    };
}

// ── 음성 인식 언어 매핑 ──────────────────────────────────────────────────
const VOICE_LANGS = [
    { code: 'ko', label: '한국어', locale: 'ko-KR', flag: 'kr', imgCode: 'kr' },
    { code: 'en', label: 'English', locale: 'en-US', flag: 'us', imgCode: 'us' },
    { code: 'ja', label: '日本語', locale: 'ja-JP', flag: 'jp', imgCode: 'jp' },
    { code: 'zh', label: '普通话', locale: 'zh-CN', flag: 'cn', imgCode: 'cn' },
    { code: 'tw', label: '繁體中文', locale: 'zh-TW', flag: 'tw', imgCode: 'tw' },
    { code: 'vi', label: 'Tiếng Việt', locale: 'vi-VN', flag: 'vn', imgCode: 'vn' },
];

export function DictionaryScreen({ settings, setScreen, setIncorrectNotes, aiUsage, incrementAiUsage, isPremium, setShowApiModal, setShowQuotaModal }: any) {
    const [query, setQuery] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DictionaryResult | null>(null);
    const [voiceLang, setVoiceLang] = useState<string>(settings?.lang || 'ko');

    const lang = settings?.lang || 'ko';
    const currentVoiceLang = VOICE_LANGS.find(l => l.code === voiceLang) || VOICE_LANGS[0];

    // UI 다국어 문자열
    const dictI18n: Record<string, any> = {
        ko: { title: 'AI 영어사전', placeholder: '단어 또는 문장을 입력하세요...', explaining: 'AI가 분석 중입니다...', added: '단어장에 추가되었습니다!', voiceSelect: '음성 입력 언어' },
        en: { title: 'AI Dictionary', placeholder: 'Type a word or sentence...', explaining: 'AI is analyzing...', added: 'Added to notes!', voiceSelect: 'Voice input language' },
        ja: { title: 'AI 英語辞書', placeholder: '単語または文章を入力...', explaining: 'AIが分析中です...', added: '単語帳に追加されました！', voiceSelect: '音声入力言語' },
        zh: { title: 'AI 英语词典', placeholder: '请输入单词或句子...', explaining: 'AI正在分析中...', added: '已添加到单词本！', voiceSelect: '语音输入语言' },
        tw: { title: 'AI 英語詞典', placeholder: '請輸入單詞或句子...', explaining: 'AI正在分析中...', added: '已添加到單詞本！', voiceSelect: '語音輸入語言' },
        vi: { title: 'Từ điển tiếng Anh AI', placeholder: 'Nhập một từ hoặc câu...', explaining: 'AI đang phân tích...', added: 'Đã thêm vào ghi chú!', voiceSelect: 'Ngôn ngữ giọng nói' },
    };
    const ui = dictI18n[lang] || dictI18n['en'];

    const callGemini = async (prompt: string, apiKey: string) => {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            }
        );

        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.error?.message || `HTTP ${res.status}`);
        }

        return res.json();
    };

    const handleTranslate = async (text: string) => {
        if (!text || !text.trim()) return;

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        // 사용 성공 시점에 카운트 증가
        if (incrementAiUsage && !incrementAiUsage()) return;

        // 2. 오프라인 체크 — AI 기능은 인터넷 필요
        if (!navigator.onLine) {
            alert(t(lang, 'offline_ai_warning') || (lang === 'ko' ? '📵 현재 오프라인 상태입니다.\nAI 사전은 인터넷 연결이 필요합니다.' : '📵 You are offline.\nAI Dictionary requires internet.'));
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const prompt = `
You are a smart English-learning dictionary expert.
The user's set language is: ${lang}.
User input word or phrase: "${text}"

Task:
1. If input is in English:
   - Provide its translation into ${lang}.
   - Provide a brief usage explanation in ${lang}.
   - Provide 2 detailed examples in English with translations in ${lang}.
2. If input is NOT English (e.g., in ${lang}, or another language):
   - Find the most appropriate English equivalent word.
   - Use that English word as the main "word" in the JSON.
   - Provide the pronunciation (IPA) for that English word.
   - Provide the translation of that English word into ${lang}.
   - Provide its usage explanation in ${lang}.
   - Provide 2 English examples for that word with translations in ${lang}.

Return ONLY in PURE JSON format (no markdown):
{
  "word": "The English word",
  "pronunciation": "Phonetic pronunciation (IPA)",
  "translation": "Meaning in ${lang}",
  "explanation": "Context or usage tips in ${lang}",
  "examples": ["Eng Example 1 | ${lang} Example 1", "Eng Example 2 | ${lang} Example 2"],
  "meaning_loc": {
    "ko": "Meaning of the word in Korean",
    "en": "Meaning of the word in English",
    "ja": "Meaning of the word in Japanese",
    "zh": "Meaning of the word in Simplified Chinese",
    "tw": "Meaning of the word in Traditional Chinese",
    "vi": "Meaning of the word in Vietnamese"
  }
}`;

            const data = await callGemini(prompt, activeKey);
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonPart = textContent.match(/\{[\s\S]*\}/)?.[0];
            if (!jsonPart) throw new Error('AI returned a non-JSON response.');
            setResult(JSON.parse(jsonPart));
        } catch (err: any) {
            console.error('Dictionary API Error:', err);
            const msg = err.message || '';
            if (msg.toLowerCase().includes('quota') || msg.includes('429')) {
                setShowQuotaModal(true);
            } else {
                alert(`[Error] ${msg}`);
            }
        } finally {
            setIsLoading(false);
        }
    };


    let recognitionInstance: any = null;

    const startVoice = async () => {
        try {
            if (isRecording) {
                if (recognitionInstance) {
                    try { recognitionInstance.stop(); } catch(e) {}
                }
                try { await SpeechRecognition.stop(); } catch(e) {}
                setIsRecording(false);
                return;
            }

            const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (WebSR) {
                setIsRecording(true);
                const recognition = new WebSR();
                recognitionInstance = recognition;
                
                recognition.lang = currentVoiceLang.locale;
                recognition.interimResults = true;
                recognition.maxAlternatives = 1;

                let currentText = '';
                recognition.onresult = (e: any) => {
                    let interimTranscript = '';
                    let tempFinal = '';
                    for (let i = e.resultIndex; i < e.results.length; ++i) {
                        if (e.results[i].isFinal) tempFinal += e.results[i][0].transcript;
                        else interimTranscript += e.results[i][0].transcript;
                    }
                    currentText = tempFinal + interimTranscript;
                    if (currentText) { setQuery(currentText); }
                };

                recognition.onend = () => {
                    setIsRecording(false);
                    if (currentText.trim()) {
                        handleTranslate(currentText.trim());
                    }
                };

                recognition.onerror = () => setIsRecording(false);

                recognition.start();
                return;
            }

            // Native (Capacitor) path fallback
            const { available } = await SpeechRecognition.available();
            if (available) {
                await SpeechRecognition.requestPermissions();
                setIsRecording(true);
                const res: any = await SpeechRecognition.start({
                    language: currentVoiceLang.locale,
                    partialResults: false,
                    popup: true,
                });
                setIsRecording(false);
                if (res.matches?.length > 0) { setQuery(res.matches[0]); handleTranslate(res.matches[0]); }
            }
        } catch (e) {
            setIsRecording(false);
        }
    };

    const addToNotes = () => {
        if (!result) return;
        
        let optionsLoc: any = undefined;
        if (result.meaning_loc) {
            optionsLoc = {
                ko: [result.meaning_loc.ko || result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
                en: [result.meaning_loc.en || result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
                ja: [result.meaning_loc.ja || result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
                zh: [result.meaning_loc.zh || result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
                tw: [result.meaning_loc.tw || result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
                vi: [result.meaning_loc.vi || result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
            };
        }

        setIncorrectNotes((prev: any[]) => [{
            id: Date.now(),
            word: result.word,
            meaning: result.translation,
            meaning_loc: result.meaning_loc,
            options_loc: optionsLoc,
            level: 1,
            options: [result.translation, 'wrong 1', 'wrong 2', 'wrong 3'],
            answer_index: 0,
        }, ...prev]);
        alert(ui.added);
    };

    const playTTS = async (text: string) => {
        try { await TextToSpeech.speak({ text, lang: 'en-US', rate: 0.9 }); } catch (_) { /* ignore */ }
    };

    return (
        <div className="screen bg-[#0A0A0E] flex flex-col text-white animate-fade-in pb-20 overflow-y-auto">
            {/* ── 헤더 ── */}
            <div className="p-6 flex items-center justify-between sticky top-0 bg-[#0A0A0E]/80 backdrop-blur-xl z-20" style={{ paddingTop: 'calc(1.5rem + var(--safe-area-top))' }}>
                <button onClick={() => setScreen('HOME')}
 className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 transition">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-black tracking-widest uppercase text-slate-400">{ui.title}</span>
                <div className="w-10" />
            </div>

            <div className="px-6 space-y-6">
                {/* ── 음성 언어 선택 (스크린샷 기반 3열 그리드 레이아웃) ── */}
                <div className="flex items-start gap-4">
                    <div className="flex items-center gap-1.5 pt-2 shrink-0 w-16">
                        <Globe size={11} className="text-slate-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">
                            {ui.voiceSelect.split(' ').map((word: string, i: number) => (
                                <span key={i}
 className="block">{word}</span>
                            ))}
                        </span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                        {VOICE_LANGS.map(vl => (
                            <button
                                key={vl.code}
                                onClick={() => setVoiceLang(vl.code)}
                                className={`flex items-center justify-center gap-2 py-2 rounded-[16px] border-2 transition-all active:scale-95
                                    ${voiceLang === vl.code
                                        ? 'bg-[#4F46E5] border-[#4F46E5] text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.4)]'
                                        : 'bg-[#161B22] border-white/[0.03] text-slate-400'
                                    }`}
                            >
                                <img
                                    src={`https://flagcdn.com/w40/${vl.imgCode}.png`}
                                    alt={vl.label}
                                    className="w-6 h-4 rounded-sm object-cover shadow-sm"
                                />
                                <span className="text-[11px] font-black uppercase tracking-tight">{vl.code}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── 검색창 (스크린샷 기반) ── */}
                <div className="relative group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTranslate(query)}
                        placeholder={ui.placeholder}
                        className="w-full bg-[#161C2C] border-2 border-white/5 rounded-[28px] px-6 py-5 text-base font-bold outline-none focus:border-primary/50 transition-all shadow-2xl pr-36"
                    />
                    <div className="absolute right-3 top-3 flex gap-2">
                        <button
                            onClick={startVoice}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative
                                ${isRecording
                                    ? 'bg-red-500 animate-pulse text-white'
                                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                            {!isRecording && (
                                <span className="absolute -bottom-1 -right-1 flex items-center justify-center bg-[#0A0A0E] rounded-full p-0.5 border border-white/10 text-[10px] leading-none">
                                    {FLAG_EMOJI[currentVoiceLang.imgCode] || '🌐'}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => handleTranslate(query)}
                            className="w-12 h-12 rounded-2xl bg-[#4F46E5] text-white flex items-center justify-center shadow-lg shadow-[#4F46E5]/20 hover:scale-105 active:scale-95 transition"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* ── 현재 인식 언어 배너 (스크린샷 기반) ── */}
                <div className="flex items-center gap-4 bg-[#161B22] border border-white/5 rounded-2xl px-5 py-4">
                    <span className="text-3xl leading-none">{FLAG_EMOJI[currentVoiceLang.imgCode] || '🌐'}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white">{currentVoiceLang.label}</p>
                        <p className="text-[10px] text-slate-500 font-bold tracking-tight">{currentVoiceLang.locale} - 마이크 인식 언어</p>
                    </div>
                </div>

                {/* ── 로딩 ── */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 space-y-4">
                        <RefreshCw size={36} className="text-primary animate-spin" />
                        <p className="text-xs font-black text-slate-500 animate-pulse uppercase tracking-widest">{ui.explaining}</p>
                    </div>
                )}

                {/* ── 광고 슬롯 ── */}
                {!result && !isLoading && (
                    <PcAdSlot variant="horizontal" className="my-4" />
                )}

                {/* ── 결과 ── */}
                {result && !isLoading && (
                    <div className="space-y-6 animate-slide-up pb-10">
                        <div className="bg-gradient-to-br from-[#4F46E5]/10 to-[#7C3AED]/10 rounded-[36px] p-8 border border-white/10 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">AI Analysis</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => playTTS(result.word)}
 className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Volume2 size={18} />
                                        </button>
                                        <button onClick={addToNotes}
 className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shadow-lg">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-white mb-1">{result.word}</h2>
                                <p className="text-indigo-300 font-bold italic mb-6">{result.pronunciation}</p>
                                <div className="h-px bg-white/5 w-full mb-6" />
                                <h3 className="text-xl font-black text-white mb-2">{result.translation}</h3>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{result.explanation}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">{t(lang, 'practical_examples')}</label>
                            {result.examples.map((ex, i) => (
                                <div key={i}
 className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                    <p className="text-sm font-bold text-slate-200 leading-relaxed">{ex}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── 빈 상태 (스크린샷 기반) ── */}
                {!result && !isLoading && !query && (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-40">
                        <Book size={64} className="text-slate-500" />
                        <p className="text-[13px] font-bold text-slate-400 max-w-[240px] leading-relaxed">
                            {t(lang, 'dictionary_empty_placeholder')}
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
