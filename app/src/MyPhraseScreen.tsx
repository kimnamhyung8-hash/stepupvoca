import { useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { getActiveApiKey, LIGHTWEIGHT_MODEL } from './apiUtils';
import { t as globalT } from './i18n';
import {
    ChevronLeft, Plus, Trash2, Volume2, Sparkles, BookOpen,
    X, RefreshCw, Search,
    Mic, MicOff, ChevronDown
} from 'lucide-react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';


// ── 카테고리 데이터 설정 ───────────────────────────────────────────────────────
export const PHRASE_CATEGORIES = [
    { id: 'live_chat', emoji: '💬', labelKey: 'cat_live_chat' },
    { id: 'ai_conv', emoji: '🤖', labelKey: 'cat_ai_conv' },
    { id: 'ai_report', emoji: '📊', labelKey: 'cat_ai_report' },
    { id: 'ai_dict', emoji: '📖', labelKey: 'cat_ai_dict' },
    { id: 'daily', emoji: '💬', labelKey: 'cat_daily_talk' },
    { id: 'travel', emoji: '🗺️', labelKey: 'cat_travel' },
    { id: 'food', emoji: '🍽️', labelKey: 'cat_food_cafe' },
    { id: 'shopping', emoji: '🛒', labelKey: 'cat_shopping' },
    { id: 'business', emoji: '💼', labelKey: 'cat_business' },
    { id: 'greeting', emoji: '👋', labelKey: 'cat_greetings' },
    { id: 'emergency', emoji: '🏥', labelKey: 'cat_emergency' },
    { id: 'emotion', emoji: '❤️', labelKey: 'cat_emotions' },
    { id: 'etc', emoji: '📝', labelKey: 'cat_others' },
];

const VOICE_LANGS = [
    { code: 'ko', label: '한국어', locale: 'ko-KR', flag: '🇰🇷', imgCode: 'kr' },
    { code: 'en', label: 'English', locale: 'en-US', flag: '🇺🇸', imgCode: 'us' },
    { code: 'ja', label: '日本語', locale: 'ja-JP', flag: '🇯🇵', imgCode: 'jp' },
    { code: 'zh', label: '普通话', locale: 'zh-CN', flag: '🇨🇳', imgCode: 'cn' },
    { code: 'tw', label: '繁體中文', locale: 'zh-TW', flag: '🇹🇼', imgCode: 'tw' },
    { code: 'vi', label: 'Việt', locale: 'vi-VN', flag: '🇻🇳', imgCode: 'vn' },
];

const NATIVE_TTS_LOCALE: Record<string, string> = {
    ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tw: 'zh-TW', vi: 'vi-VN',
};

export interface SavedPhrase {
    id: number;
    original: string;
    english: string;
    englishPronunciation: string;
    nativeTranslation: string;
    originalPronunciation: string;
    inputLangCode: string;
    categoryId: string;
    createdAt: string;
}

// function loadPhrases(): SavedPhrase[] { ... }
// function savePhrases(phrases: SavedPhrase[]) { ... }

// ── 메인 화면 ─────────────────────────────────────────────────────────────────
export function MyPhraseScreen({ settings, setScreen, aiUsage, incrementAiUsage, phrases, setPhrases, isPremium, setShowApiModal, setShowQuotaModal }: any) {
    const lang = settings?.lang || 'ko';
    const t = useCallback((key: string) => globalT(lang, key) || key, [lang]);
    const getCatLabel = useCallback((cat: any) => globalT(lang, cat.labelKey) || cat.labelKey, [lang]);

    const [selectedCat, setSelectedCat] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isSpeakingSearch, setIsSpeakingSearch] = useState(false);
    const filtered = phrases.filter((p: any) => {
        const matchCat = selectedCat === 'all' || p.categoryId === selectedCat;
        const q = searchQuery.toLowerCase();
        const matchQ = !q ||
            (p.original?.toLowerCase() || '').includes(q) ||
            (p.english?.toLowerCase() || '').includes(q) ||
            (p.nativeTranslation?.toLowerCase() || '').includes(q);
        return matchCat && matchQ;
    });

    const handleDelete = (id: number) => {
        setPhrases((prev: any[]) => prev.filter((p: any) => p.id !== id));
        setDeleteId(null);
    };

    const handleAdd = (phrase: SavedPhrase) => {
        setPhrases((prev: any[]) => [phrase, ...prev]);
        setShowAddModal(false);
    };

    const playSearchTTS = async () => {
        if (!searchQuery.trim()) return;
        setIsSpeakingSearch(true);
        try {
            const ttsLang = NATIVE_TTS_LOCALE[lang] || 'ko-KR';
            await TextToSpeech.speak({ text: searchQuery, lang: ttsLang, rate: 0.9 });
        } catch (_) { } finally { setIsSpeakingSearch(false); }
    };

    return (
        <div className="screen bg-[#F8FAFC] h-[100svh] overflow-hidden flex flex-col select-none">
            {/* 헤더 */}
            <header className="flex items-center justify-between px-5 pb-3 sticky top-0 bg-white/95 backdrop-blur-xl z-30 border-b border-slate-100/60" style={{ paddingTop: 'calc(0.6rem + var(--safe-area-top))' }}>
                <button
                    onClick={() => setScreen('HOME')}
                    className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center active:scale-90 transition"
                >
                    <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shadow-md rotate-3">
                        <BookOpen size={14} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">
                        {t('phrase_bible_title')}
                    </h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition"
                >
                    <Plus size={20} className="text-white" />
                </button>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col max-w-2xl mx-auto w-full">
                {/* 검색창 */}
                <div className="px-5 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('phrase_search_placeholder')}
                                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-400 transition shadow-sm"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')}
 className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X size={16} className="text-slate-400" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={playSearchTTS}
                            disabled={!searchQuery.trim()}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${searchQuery.trim()
                                ? isSpeakingSearch ? 'bg-indigo-600 text-white animate-pulse' : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                : 'bg-slate-50 text-slate-200 border border-slate-100'
                                }`}
                        >
                            <Volume2 size={18} />
                        </button>
                    </div>
                </div>

                {/* 카테고리 탭 */}
                <div className="px-5 pb-3">
                    <div className="flex flex-wrap gap-2 pb-1">
                        {[{ id: 'all', emoji: '📚', labelKey: 'category_all' }, ...PHRASE_CATEGORIES].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCat(cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0 ${selectedCat === cat.id
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'bg-white text-slate-600 border border-slate-200'
                                    }`}
                            >
                                <span>{cat.emoji}</span>
                                <span>{getCatLabel(cat)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 목록 */}
                <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-300">
                            <div className="text-5xl mb-4 opacity-50">📖</div>
                            <p className="font-bold text-sm leading-relaxed">
                                {searchQuery ? t('phrase_search_empty') : t('phrase_empty_state')}
                            </p>
                        </div>
                    ) : (
                        filtered.map((phrase: any) => {
                            const cat = PHRASE_CATEGORIES.find(c => c.id === phrase.categoryId);
                            return (
                                <PhraseCard
                                    key={phrase.id}
                                    phrase={phrase}
                                    cat={cat}
                                    lang={lang}
                                    t={t}
                                    settings={settings}
                                    getCatLabel={getCatLabel}
                                    onDelete={() => setDeleteId(phrase.id)}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {showAddModal && <AddPhraseModal settings={settings} onAdd={handleAdd} onClose={() => setShowAddModal(false)} t={t} getCatLabel={getCatLabel} incrementAiUsage={incrementAiUsage} aiUsage={aiUsage} isPremium={isPremium} setShowApiModal={setShowApiModal} setShowQuotaModal={setShowQuotaModal} />}

            {deleteId !== null && (
                <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6">
                    <div className="bg-white rounded-[32px] p-6 w-full max-w-sm">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-3">🎉</div>
                            <h3 className="text-lg font-black text-slate-900">{t('deleteConfirmTitle')}</h3>
                            <p className="text-sm text-slate-500 font-bold mt-1 leading-relaxed">{t('deleteConfirmDesc')}</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)}
 className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl">{t('cancel')}</button>
                            <button onClick={() => handleDelete(deleteId)}
 className="flex-1 bg-red-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100">{t('delete')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── 카드 컴포넌트 ─────────────────────────────────────────────────────────────
function PhraseCard({ phrase, cat, t, getCatLabel, onDelete, settings }: any) {
    const [isSpeakingOriginal, setIsSpeakingOriginal] = useState(false);
    const [isSpeakingEn, setIsSpeakingEn] = useState(false);

    const playOriginalTTS = async () => {
        if (settings?.tts === false) return;
        setIsSpeakingOriginal(true);
        try {
            const ttsLang = NATIVE_TTS_LOCALE[phrase.inputLangCode] || 'en-US';
            await TextToSpeech.speak({ text: phrase.original, lang: ttsLang, rate: 0.85 });
        } catch (_) { } finally { setIsSpeakingOriginal(false); }
    };

    const playEnTTS = async () => {
        if (settings?.tts === false) return;
        setIsSpeakingEn(true);
        try { await TextToSpeech.speak({ text: phrase.english, lang: 'en-US', rate: 0.85 }); } catch (_) { }
        finally { setIsSpeakingEn(false); }
    };

    return (
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                    {cat ? `${cat.emoji} ${getCatLabel(cat)}` : 'ETC'}
                </span>
                <span className="text-[10px] text-slate-300 font-bold">{phrase.createdAt}</span>
            </div>

            {/* 메인 영어 문장 강조 */}
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <Sparkles size={12} className="text-indigo-400 shrink-0" />
                        <span className="text-[9px] font-black text-indigo-300 uppercase tracking-wider">Practice</span>
                    </div>
                    <h4 className="text-lg font-black text-indigo-900 leading-tight cursor-pointer active:opacity-60 transition" onClick={playEnTTS}>
                        {phrase.english}
                    </h4>
                    {phrase.englishPronunciation && (
                        <p className="text-[11px] text-indigo-300 font-bold mt-0.5 opacity-80">
                            [{phrase.englishPronunciation}]
                        </p>
                    )}
                </div>
                <button
                    onClick={playEnTTS}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${isSpeakingEn ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-400'
                        }`}
                >
                    <Volume2 size={18} />
                </button>
            </div>

            {/* 원문 및 해석 섹션 */}
            {(phrase.original || phrase.nativeTranslation) && (
                <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3 border border-slate-100/50">
                    {phrase.original ? (
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 opacity-50 mb-0.5">
                                <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                <span className="text-[9px] font-black text-slate-500 uppercase">원문 (Original)</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-bold text-slate-700 leading-tight">
                                    {phrase.original}
                                </p>
                                <button onClick={playOriginalTTS} className={`shrink-0 transition-all ${isSpeakingOriginal ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}>
                                    <Volume2 size={14} />
                                </button>
                            </div>
                            {phrase.originalPronunciation && (
                                <p className="text-[10px] text-orange-400 font-bold italic opacity-80 mt-0.5">{phrase.originalPronunciation}</p>
                            )}
                        </div>
                    ) : null}

                    {phrase.original && phrase.nativeTranslation && (
                        <div className="h-px bg-slate-200/50" />
                    )}

                    {phrase.nativeTranslation ? (
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 opacity-50 mb-0.5">
                                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                                <span className="text-[9px] font-black text-indigo-500 uppercase">해석 (Meaning)</span>
                            </div>
                            <p className="text-base font-black text-slate-800 leading-normal">
                                {phrase.nativeTranslation}
                            </p>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="flex gap-3 pt-0.5">
                <button
                    onClick={onDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 rounded-xl text-red-500 font-black text-xs active:scale-95 transition"
                >
                    <Trash2 size={14} /> {t('mastered')}
                </button>
            </div>
        </div>
    );
}

// ── 추가 모달 ────────────────────────────────────────────────────────────────
function AddPhraseModal({ settings, onAdd, onClose, t, getCatLabel, incrementAiUsage, aiUsage, isPremium, setShowApiModal, setShowQuotaModal }: any) {
    const lang = settings?.lang || 'ko';
    const [inputText, setInputText] = useState('');
    const [selectedCat, setSelectedCat] = useState('daily');
    const [isTranslating, setIsTranslating] = useState(false);
    const [translated, setTranslated] = useState<any>(null);
    const [voiceLang, setVoiceLang] = useState<string>(['ko', 'en', 'ja', 'zh', 'tw', 'vi'].includes(lang) ? lang : 'ko');
    const [isRecording, setIsRecording] = useState(false);
    const webRecognitionRef = useRef<any>(null); // 웹 음성 인식용 레프 추가
    const [showCatPicker, setShowCatPicker] = useState(false);

    const startRecording = async () => {
        try {
            const isWeb = typeof (window as any).Capacitor === 'undefined' || (window as any).Capacitor.getPlatform() === 'web';
            const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (isWeb && WebSR) {
                if (isRecording) {
                    if (webRecognitionRef.current) {
                        try { webRecognitionRef.current.stop(); } catch(e) {}
                        webRecognitionRef.current = null;
                    }
                    setIsRecording(false);
                    return;
                }

                setIsRecording(true);
                const recognition = new WebSR();
                webRecognitionRef.current = recognition;

                const locale = VOICE_LANGS.find(v => v.code === voiceLang)?.locale || 'ko-KR';
                recognition.lang = locale;
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                recognition.onresult = (e: any) => {
                    const txt = e.results[0][0].transcript;
                    if (txt) { setInputText(txt); setTranslated(null); }
                };
                recognition.onerror = (e: any) => {
                    console.error('Web SR Error:', e);
                    setIsRecording(false);
                    webRecognitionRef.current = null;
                };
                recognition.onend = () => {
                    setIsRecording(false);
                    webRecognitionRef.current = null;
                };
                recognition.start();
                return;
            }

            // Native (Capacitor) path
            const { available } = await SpeechRecognition.available();
            if (!available) {
                if (WebSR) {
                    setIsRecording(true);
                    const rec = new WebSR();
                    rec.lang = VOICE_LANGS.find(v => v.code === voiceLang)?.locale || 'ko-KR';
                    rec.onresult = (e: any) => {
                        const txt = e.results[0][0].transcript;
                        if (txt) { setInputText(txt); setTranslated(null); }
                };
                    rec.onend = () => setIsRecording(false);
                    rec.start();
                }
                return;
            }

            await SpeechRecognition.requestPermissions();
            setIsRecording(true);
            const res: any = await SpeechRecognition.start({
                language: VOICE_LANGS.find(v => v.code === voiceLang)?.locale || 'ko-KR',
                partialResults: false, popup: true
            });
            setIsRecording(false);
            if (res.matches?.length > 0) { setInputText(res.matches[0]); setTranslated(null); }
        } catch (e) { setIsRecording(false); }
    };

    const handleTranslate = async () => {
        const text = inputText.trim();
        if (!text) return;

            const userSavedKey = localStorage.getItem('vq_gemini_key');
            const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
            if (!activeKey) {
                if (setShowApiModal) setShowApiModal(true);
                return;
            }

        // 사용 성공 시점에 카운트 증가
        if (incrementAiUsage && !incrementAiUsage()) return;
        setIsTranslating(true);
        const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', tw: 'Traditional Chinese', vi: 'Vietnamese' };
        const nativeLangLabel = langMap[lang] || 'English';
        const inputLangLabel = langMap[voiceLang] || 'English';

        try {
            const prompt = `Task: Translate the following sentence into natural English and ${nativeLangLabel}.
- Input Sentence: "${text}"
- Detected Input Language Hint: ${inputLangLabel} (Determine actual language automatically if different)

Required Response JSON Format (Return ONLY valid JSON):
{
  "detectedLangCode": "Two-letter code of the input sentence: ko, en, ja, zh, tw, or vi",
  "english": "Natural English translation",
  "englishPronunciation": "English pronunciation written in ${nativeLangLabel} characters",
  "nativeTranslation": "The exact meaning of the input sentence in ${nativeLangLabel} (REQUIRED)",
  "originalPronunciation": "How to read the input '${text}' in ${nativeLangLabel} characters"
}`;

            const userSavedKey = localStorage.getItem('vq_gemini_key');
            const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
            if (incrementAiUsage && !incrementAiUsage()) return;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`,
 {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData?.error?.message || 'API request failed');
            }

            const data = await res.json();
            if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('No candidates found in AI response');
            }

            const textContent = data.candidates[0].content.parts[0].text;
            const jsonPart = textContent.match(/\{[\s\S]*\}/)?.[0];
            if (!jsonPart) throw new Error('Invalid AI response format');

            const result = JSON.parse(jsonPart);
            if (!result.nativeTranslation) result.nativeTranslation = t('translation_error');
            setTranslated(result);
        } catch (e: any) {
            console.error('Translation Error:', e);
            const msg = e.message || '';
            if (msg.toLowerCase().includes('quota') || msg.includes('429')) {
                if (setShowQuotaModal) setShowQuotaModal(true);
            } else {
                alert(`${t('error_occurred')}: ${msg}`);
            }
        } finally { setIsTranslating(false); }
    };


    const handleSave = () => {
        if (!translated) return;
        onAdd({
            id: Date.now(),
            original: inputText,
            english: translated.english,
            englishPronunciation: translated.englishPronunciation,
            nativeTranslation: translated.nativeTranslation,
            originalPronunciation: translated.originalPronunciation,
            inputLangCode: translated.detectedLangCode || voiceLang,
            categoryId: selectedCat,
            createdAt: new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end justify-center">
            <div
                className="bg-white w-full max-w-lg rounded-t-[40px] p-6 max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl"
                style={{
                    paddingBottom: (Capacitor.getPlatform() !== 'web' && !isPremium) ? 'calc(var(--ad-height) + env(safe-area-inset-bottom, 0px) + 48px)' : 'calc(env(safe-area-inset-bottom, 0px) + 48px)'
                }}
            >
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 opacity-50" />
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-xl font-black text-slate-900">{t('add_phrase_title')}</h2>
                    <button onClick={onClose}
 className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                        {VOICE_LANGS.map(v => (
                            <button
                                key={v.code}
                                onClick={() => setVoiceLang(v.code)}
                                className={`flex items-center justify-center gap-2 py-2 rounded-[16px] border-2 transition-all ${voiceLang === v.code
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                    : 'bg-slate-50 border-slate-50 text-slate-600'
                                    }`}
                            >
                                <img
                                    src={`https://flagcdn.com/w40/${v.imgCode}.png`}
                                    alt={v.label}
                                    className="w-6 h-4 rounded-sm object-cover shadow-sm"
                                />
                                <span className="text-[11px] font-black uppercase tracking-tight">{v.code}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <textarea
                            value={inputText}
 onChange={(e) => { setInputText(e.target.value); setTranslated(null); }}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-[32px] p-6 pr-14 text-base font-bold min-h-[140px] outline-none focus:border-indigo-400 focus:bg-white transition shadow-inner"
                            placeholder={t('phrase_input_placeholder')}
                        />
                        <button onClick={startRecording}
 className={`absolute right-4 bottom-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white shadow-lg' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'}`}>
                            {isRecording ? <MicOff size={20} /> : <Mic size={22} />}
                        </button>
                    </div>

                    <button onClick={() => setShowCatPicker(!showCatPicker)}
 className="w-full flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 font-black text-[14px] text-slate-700">
                        <span>{PHRASE_CATEGORIES.find(c => c.id === selectedCat)?.emoji} {getCatLabel(PHRASE_CATEGORIES.find(c => c.id === selectedCat))}</span>
                        <ChevronDown size={20} className={`transition-transform ${showCatPicker ? 'rotate-180' : ''}`} />
                    </button>
                    {showCatPicker && (
                        <div className="grid grid-cols-3 gap-2 animate-fade-in">
                            {PHRASE_CATEGORIES.map(c => (
                                <button key={c.id}
 onClick={() => { setSelectedCat(c.id); setShowCatPicker(false); }}
 className={`flex flex-col items-center p-3.5 rounded-[20px] border-2 font-black text-[11px] transition-all ${selectedCat === c.id ? 'bg-indigo-50 border-indigo-400 text-indigo-800' : 'bg-white border-slate-50 text-slate-500'}`}>
                                    <span className="text-2xl mb-1.5">{c.emoji}</span>{getCatLabel(c)}
                                </button>
                            ))}
                        </div>
                    )}

                    {!translated ? (
                        <button onClick={handleTranslate}
 disabled={!inputText.trim() || isTranslating}
 className="w-full bg-indigo-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-indigo-200 active:scale-[0.98] transition flex items-center justify-center gap-2.5">
                            {isTranslating ? <RefreshCw className="animate-spin" size={22} /> : <><Sparkles size={22} /> {t('ai_translate_create')}</>}
                        </button>
                    ) : (
                        <div className="space-y-4 animate-fade-in border-t border-slate-100 pt-6">
                            <div className="bg-indigo-50/50 rounded-[32px] p-6 space-y-5 border border-indigo-100/50">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[11px] uppercase font-black text-indigo-400 flex items-center gap-1.5">
                                            <div className="w-1 h-1 bg-indigo-400 rounded-full" /> {VOICE_LANGS.find(v => v.code === voiceLang)?.label} {t('original_text_label')}
                                        </p>
                                        <button
                                            onClick={() => {
                                                if (settings?.tts !== false) {
                                                    TextToSpeech.speak({
                                                        text: inputText,
                                                        lang: NATIVE_TTS_LOCALE[translated.detectedLangCode] || VOICE_LANGS.find(v => v.code === voiceLang)?.locale || 'ko-KR',
                                                        rate: 0.9
                                                    });
                                                }
                                            }}
                                            className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center active:scale-95 transition-all"
                                        >
                                            <Volume2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-lg font-black text-slate-800 leading-tight">{inputText}</p>
                                    <p className="text-sm text-orange-400 font-bold italic mt-1.5">{translated.originalPronunciation}</p>
                                </div>
                                <div className="h-px bg-indigo-100/30" />
                                <div>
                                        <p className="text-[11px] uppercase font-black text-indigo-400 mb-2 flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-indigo-400 rounded-full" /> {t('meaning_title_label')}
                                    </p>
                                    <p className="text-[19px] font-black text-indigo-900 leading-tight mb-2">{translated.english}</p>
                                    <div className="bg-white/80 rounded-[20px] px-4 py-3 border border-indigo-100/50 shadow-sm">
                                        <p className="text-[15px] font-bold text-slate-700 leading-normal">{translated.nativeTranslation}</p>
                                    </div>
                                    <p className="text-[11px] text-indigo-300 font-black italic mt-2 ml-1 opacity-70">[{translated.englishPronunciation}]</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setTranslated(null)}
 className="flex-1 bg-slate-100 text-slate-500 font-black py-4.5 rounded-[22px] active:scale-95 transition">{t('reenter')}</button>
                                <button onClick={handleSave}
 className="flex-[2] bg-indigo-600 text-white font-black py-4.5 rounded-[22px] shadow-lg shadow-indigo-100 active:scale-95 transition">{t('save_btn_labeled')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

const style = document.createElement('style');
style.innerText = `
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.32, 0.72, 0, 1) both; }
    .scroll-hide::-webkit-scrollbar { display: none; }
`;
document.head.appendChild(style);
