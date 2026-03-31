// src/LevelTestScreens.tsx
import { useState, useEffect } from 'react';
import {
    ChevronRight, X, CheckCircle2,
    BookOpen, Brain, FileText, BarChart2, Sparkles, Star
} from 'lucide-react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import {
    LEVEL_TEST_UI, SELF_ASSESSMENT_OPTIONS,
    VOCAB_CHIP_PAGES,
    VOCAB_QUESTION_BANKS, GRAMMAR_QUESTION_BANKS, READING_PASSAGES_BANKS,
    type SupportedLang, type GrammarQuestion, type VocabQuestion, type ReadingPassage, type TranslationText,
} from './LevelTestData';
import { CEFR_CONFIG } from './constants/appConstants';

// ─── i18n 훅 ────────────────────────────────────────────────────
function useLT(lang: string) {
    const l = lang as SupportedLang;
    return {
        t: (key: string): string => {
            const entry = LEVEL_TEST_UI[key];
            if (!entry) return key;
            return (entry as any)[l] ?? entry['en'];
        },
        lang: l,
    };
}

function getTx(obj: Record<string, string>, lang: SupportedLang): string {
    return obj[lang] ?? obj['en'] ?? '';
}

// ─── Progress Steps ──────────────────────────────────────────────
const STEPS = ['self', 'vocab', 'grammar', 'reading', 'result'] as const;
type Step = typeof STEPS[number];

function ProgressBar({ current, total, lang }: { current: number; total: number; lang: string }) {
    const { t } = useLT(lang);
    const stepLabels: Record<string, string> = {
        self: t('step_self'),
        vocab: t('step_vocab'),
        grammar: t('step_grammar'),
        reading: t('step_reading'),
    };
    const icons = [Brain, BookOpen, Sparkles, FileText];

    return (
        <div className="w-full bg-white border-b border-slate-100 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
                {(['self', 'vocab', 'grammar', 'reading'] as const).map((s, i) => {
                    const done = i < current - 1;
                    const active = i === current - 1;
                    const Icon = icons[i];
                    return (
                        <div key={s}
 className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'bg-indigo-600 text-white' : active ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-600' : 'bg-slate-100 text-slate-300'}`}>
                                {done ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:block ${active ? 'text-indigo-600' : done ? 'text-indigo-400' : 'text-slate-300'}`}>{stepLabels[s]}</span>
                        </div>
                    );
                })}
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${((current - 1) / total) * 100}%` }}
                />
            </div>
        </div>
    );
}

// ─── 1. 자가 진단 화면 ─────────────────────────────────────────
function SelfAssessmentScreen({ lang, onNext }: { lang: string; onNext: (level: string) => void }) {
    const { t } = useLT(lang);
    const [selected, setSelected] = useState<string | null>(null);
    const l = lang as SupportedLang;

    return (
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 space-y-4">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
                    <Brain size={32} className="text-indigo-600" />
                </div>
                <h2 className="text-xl font-black text-slate-800 leading-tight">{t('self_assessment_title')}</h2>
            </div>

            <div className="space-y-3">
                {SELF_ASSESSMENT_OPTIONS.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => setSelected(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${selected === opt.id
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'}`}
                    >
                        <span className="text-3xl shrink-0">{opt.emoji}</span>
                        <div className="text-left flex-1">
                            <p className={`font-black text-base leading-tight ${selected === opt.id ? 'text-white' : 'text-slate-800'}`}>{getTx(opt.label, l)}</p>
                            <p className={`text-xs font-bold mt-0.5 ${selected === opt.id ? 'text-indigo-200' : 'text-slate-400'}`}>{getTx(opt.desc, l)}</p>
                        </div>
                        {selected === opt.id && <CheckCircle2 size={20} className="text-white shrink-0" />}
                    </button>
                ))}
            </div>

            <button
                disabled={!selected}
                onClick={() => {
                    const opt = SELF_ASSESSMENT_OPTIONS.find(o => o.id === selected);
                    onNext(opt?.targetLevel ?? 'A2');
                }}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-40 mt-4"
            >
                {t('next')} →
            </button>
        </div>
    );
}

// ─── Level colour palette per tier ─────────────────────────────
const TIER_STYLES = [
    { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', ring: 'ring-emerald-400', chip: 'bg-emerald-500 border-emerald-400', bar: 'bg-emerald-500' },
    { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', ring: 'ring-blue-400', chip: 'bg-blue-500 border-blue-400', bar: 'bg-blue-500' },
    { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', ring: 'ring-purple-400', chip: 'bg-purple-600 border-purple-500', bar: 'bg-purple-600' },
];

// ─── 2. 어휘 테스트 화면 (3단계 인식 + 퀴즈) ─────────────────────
function VocabTestScreen({ lang, onNext }: { lang: string; onNext: (score: number) => void }) {
    const { t } = useLT(lang);
    const l = lang as SupportedLang;

    // 3페이지 단어 인식 단계
    const [chipPage, setChipPage] = useState(0);          // 0,1,2 = tier index
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [phase, setPhase] = useState<'chips' | 'quiz'>('chips');

    // 퀴즈 단계
    const [vocabQuestions] = useState<VocabQuestion[]>(() => {
        const getQ = (level: 'a2' | 'b1' | 'b2' | 'c1') => {
            const arr = VOCAB_QUESTION_BANKS[level];
            return arr[Math.floor(Math.random() * arr.length)];
        };
        return [getQ('a2'), getQ('b1'), getQ('b2'), getQ('c1')];
    });
    const [qIndex, setQIndex] = useState(0);
    const [answered, setAnswered] = useState<number | null>(null);
    const [correct, setCorrect] = useState(0);

    const currentTier = VOCAB_CHIP_PAGES[chipPage];
    const style = TIER_STYLES[chipPage];
    const totalWords = VOCAB_CHIP_PAGES.flatMap(p => p.words).length;

    const toggleWord = (w: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(w) ? next.delete(w) : next.add(w);
            return next;
        });
    };

    const goNextChipPage = () => {
        if (chipPage < VOCAB_CHIP_PAGES.length - 1) {
            setChipPage(p => p + 1);
        } else {
            setPhase('quiz');
        }
    };

    const handleQuizSelect = (idx: number) => {
        if (answered !== null) return;
        setAnswered(idx);
        if (idx === vocabQuestions[qIndex].answerIndex) setCorrect(c => c + 1);
    };

    const nextQ = () => {
        if (qIndex < vocabQuestions.length - 1) {
            setQIndex(i => i + 1);
            setAnswered(null);
        } else {
            // 최종 점수: 인식률 60% + 퀴즈 40%
            const recognitionScore = (selected.size / totalWords) * 60;
            const quizScore = (correct / vocabQuestions.length) * 40;
            onNext(Math.round(recognitionScore + quizScore));
        }
    };

    // ── 퀴즈 화면 ────────────────────────────────────────────────
    if (phase === 'quiz') {
        const q = vocabQuestions[qIndex];
        return (
            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 space-y-5">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('vocab_quiz_title')}</p>
                    <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-slate-50">
                        <p className="text-4xl font-black text-slate-800 italic tracking-tighter">{q.word}</p>
                    </div>
                </div>
                <div className="space-y-3">
                    {q.options.map((opt: TranslationText, idx: number) => {
                        let cls = 'bg-white border-slate-100 text-slate-700';
                        if (answered !== null) {
                            if (idx === q.answerIndex) cls = 'bg-emerald-500 border-emerald-400 text-white';
                            else if (idx === answered) cls = 'bg-red-400 border-red-400 text-white opacity-80';
                        }
                        return (
                            <button key={idx}
 onClick={() => handleQuizSelect(idx)}
 disabled={answered !== null}
                                className={`w-full py-4 px-5 rounded-2xl border-2 font-black text-left transition-all active:scale-[0.98] ${cls}`}>
                                <span className="text-xs opacity-60 mr-2">{String.fromCharCode(65 + idx)}.</span>
                                {getTx(opt, l)}
                            </button>
                        );
                    })}
                </div>
                {answered !== null && (
                    <button onClick={nextQ}
 className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-all">
                        {qIndex < vocabQuestions.length - 1 ? t('next') : t('submit')} →
                    </button>
                )}
                <div className="text-center text-xs font-black text-slate-300 uppercase tracking-widest">
                    {qIndex + 1} / {vocabQuestions.length}
                </div>
            </div>
        );
    }

    // ── 3단계 단어 칩 화면 ────────────────────────────────────────
    const tierSelected = currentTier.words.filter(w => selected.has(w)).length;
    const tierTotal = currentTier.words.length;

    return (
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 flex flex-col gap-4">

            {/* 단계 헤더 */}
            <div className={`rounded-[24px] p-4 ${style.light} ${style.border} border-2`}>
                {/* 페이지 인디케이터 */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1.5">
                        {VOCAB_CHIP_PAGES.map((_, i) => (
                            <div key={i}
 className={`h-1.5 rounded-full transition-all duration-300 ${i < chipPage ? `w-8 ${TIER_STYLES[i].bar}` :
                                i === chipPage ? `w-12 ${style.bar}` : 'w-8 bg-slate-200'
                                }`} />
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {chipPage + 1} / {VOCAB_CHIP_PAGES.length}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-3xl">{currentTier.levelEmoji}</span>
                    <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${style.text}`}>{t(currentTier.labelKey)}</p>
                        <p className="text-slate-800 font-black text-base leading-tight">{t('vocab_title')}</p>
                    </div>
                    <div className={`ml-auto px-3 py-1.5 rounded-xl ${style.bg} text-white text-xs font-black shrink-0`}>
                        {currentTier.level}
                    </div>
                </div>

                {/* 이 페이지 진행바 */}
                <div className="mt-3 w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full ${style.bar} rounded-full transition-all duration-300`}
                        style={{ width: `${(tierSelected / tierTotal) * 100}%` }} />
                </div>
                <p className="text-right text-[10px] font-black mt-1 opacity-60 text-slate-600">
                    {tierSelected}/{tierTotal}
                </p>
            </div>

            {/* 단어 칩 그리드 */}
            <div className="flex flex-wrap gap-2 justify-center">
                {currentTier.words.map(word => {
                    const isSel = selected.has(word);
                    return (
                        <button
                            key={word}
                            onClick={() => toggleWord(word)}
                            className={`px-4 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 border-2 shadow-sm ${isSel
                                ? `${style.chip} text-white shadow-md`
                                : 'bg-white text-slate-700 border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            {isSel && <span className="mr-1 text-xs">✓</span>}
                            {word}
                        </button>
                    );
                })}
            </div>

            {/* 전체 인식 수 요약 */}
            <div className="bg-white rounded-2xl px-4 py-3 border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-wider">총 인식 단어</span>
                <span className="font-black text-slate-700 text-sm">
                    <span className="text-indigo-600 text-lg">{selected.size}</span>
                    <span className="text-slate-300"> / {totalWords}</span>
                </span>
            </div>

            {/* 하단 버튼 */}
            <button
                onClick={goNextChipPage}
                className={`w-full ${style.bg} text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
                {chipPage < VOCAB_CHIP_PAGES.length - 1 ? (
                    <>{t('next')} <span className="opacity-70 text-sm">({VOCAB_CHIP_PAGES[chipPage + 1].levelEmoji} {VOCAB_CHIP_PAGES[chipPage + 1].level})</span> →</>
                ) : (
                    <>{t('vocab_quiz_title')} →</>
                )}
            </button>
        </div>
    );
}

// ─── 3. 문법 테스트 (단어 블록 조립) ───────────────────────────
function GrammarTestScreen({ lang, onNext }: { lang: string; onNext: (score: number) => void }) {
    const { t } = useLT(lang);
    const l = lang as SupportedLang;

    const [grammarQuestions] = useState<GrammarQuestion[]>(() => {
        const getQ = (level: 'a2' | 'b1' | 'b2' | 'c1') => {
            const arr = GRAMMAR_QUESTION_BANKS[level];
            return arr[Math.floor(Math.random() * arr.length)];
        };
        return [getQ('a2'), getQ('b1'), getQ('b2'), getQ('c1')];
    });

    const [qIndex, setQIndex] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [assembled, setAssembled] = useState<string[]>([]);
    const [bank, setBank] = useState<string[]>([]);
    const [checked, setChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const q: GrammarQuestion = grammarQuestions[qIndex];

    useEffect(() => {
        // 섞기: 모든 단어를 소문자로 변환하여 '첫 단어' 힌트 제거 (단, 'I'는 대문자 유지 원할 수도 있지만 요청대로 소문자 처리)
        setBank([...q.englishWords].map(w => w.toLowerCase()).sort(() => Math.random() - 0.5));
        setAssembled([]);
        setChecked(false);
        setIsCorrect(null);
    }, [qIndex]);

    const addWord = (word: string, bankIdx: number) => {
        if (checked) return;
        setBank(prev => prev.filter((_, i) => i !== bankIdx));
        setAssembled(prev => [...prev, word]);
    };

    const removeWord = (word: string, assembledIdx: number) => {
        if (checked) return;
        setAssembled(prev => prev.filter((_, i) => i !== assembledIdx));
        setBank(prev => [...prev, word]);
    };

    const checkAnswer = () => {
        // 정규화: 소문자 변환 및 문장 부호(,.?!) 제거 후 비교
        const normalize = (words: string[]) =>
            words.join(' ').toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim();

        const ok = normalize(assembled) === normalize(q.correctOrder);
        setIsCorrect(ok);
        if (ok) setCorrect(c => c + 1);
        setChecked(true);
    };

    const goNext = () => {
        if (qIndex < grammarQuestions.length - 1) {
            setQIndex(i => i + 1);
        } else {
            const score = Math.round((correct / grammarQuestions.length) * 100);
            onNext(score);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-5 pb-32 flex flex-col gap-5 min-h-full">
                {/* 제목 */}
                <div className="text-center">
                    <div className="w-14 h-14 bg-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-3">
                        <Sparkles size={28} className="text-purple-600" />
                    </div>
                    <h2 className="text-base font-black text-slate-800">{t('grammar_title')}</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1">{t('grammar_hint')}</p>
                </div>

                {/* 모국어 문장 */}
                <div className="bg-purple-50 rounded-3xl p-5 border-2 border-purple-100">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2 text-center">
                        {lang === 'ko' ? '한국어' : lang === 'ja' ? '日本語' : lang === 'zh' ? '中文' : lang === 'tw' ? '繁體中文' : lang === 'vi' ? 'Tiếng Việt' : 'English'}
                    </p>
                    <p className="text-xl font-black text-purple-800 text-center leading-tight">
                        {getTx(q.baseSentence, l)}
                    </p>
                </div>

                {/* 조립 영역 */}
                <div className={`min-h-[80px] rounded-3xl border-2 p-4 flex flex-wrap gap-2 transition-all ${checked
                    ? isCorrect
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-red-50 border-red-300'
                    : 'bg-slate-50 border-slate-200 border-dashed'
                    }`}>
                    {assembled.length === 0 && !checked && (
                        <p className="text-slate-300 font-black text-sm m-auto">{t('grammar_hint')}</p>
                    )}
                    {assembled.map((word, idx) => (
                        <button
                            key={`${word}-${idx}`}
                            onClick={() => removeWord(word, idx)}
                            disabled={checked}
                            className={`px-4 py-2.5 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 ${checked
                                ? isCorrect
                                    ? 'bg-emerald-500 text-white border-emerald-400'
                                    : 'bg-red-400 text-white border-red-300'
                                : 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                }`}
                        >
                            {idx === 0
                                ? word.charAt(0).toUpperCase() + word.slice(1)
                                : (word === 'i' ? 'I' : word)}
                        </button>
                    ))}
                </div>

                {/* 단어 뱅크 */}
                <div className="flex flex-wrap gap-2 justify-center min-h-[64px]">
                    {bank.map((word, idx) => (
                        <button
                            key={`bank-${word}-${idx}`}
                            onClick={() => addWord(word, idx)}
                            disabled={checked}
                            className="px-4 py-2.5 rounded-2xl font-black text-sm bg-white border-2 border-slate-100 text-slate-700 shadow-sm active:scale-95 transition-all hover:border-indigo-200 disabled:opacity-40"
                        >
                            {word}
                        </button>
                    ))}
                </div>

                {/* 피드백 */}
                {checked && (
                    <div className={`rounded-3xl p-4 flex items-center gap-3 ${isCorrect ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
                        {isCorrect
                            ? <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                            : <X className="text-red-500 shrink-0" size={24} />}
                        <div>
                            <p className={`font-black text-sm ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                            </p>
                            {!isCorrect && (
                                <p className="text-xs font-bold text-red-500 mt-1">
                                    ✓ {q.correctOrder.join(' ')}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 버튼 */}
                {!checked ? (
                    <button
                        onClick={checkAnswer}
                        disabled={assembled.length === 0}
                        className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-40"
                    >
                        {t('confirm')} ✓
                    </button>
                ) : (
                    <button
                        onClick={goNext}
                        className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-all"
                    >
                        {qIndex < grammarQuestions.length - 1 ? t('next') : t('submit')} →
                    </button>
                )}

                <div className="text-center text-xs font-black text-slate-300 uppercase tracking-widest">
                    {qIndex + 1} / {grammarQuestions.length}
                </div>
            </div>
        </div>
    );
}

// ─── 4. 독해 테스트 (TTS 포함) ─────────────────────────────────
function ReadingTestScreen({ lang, onNext }: { lang: string; onNext: (score: number) => void }) {
    const { t } = useLT(lang);
    const l = lang as SupportedLang;

    const [passages] = useState<ReadingPassage[]>(() => {
        const easy = READING_PASSAGES_BANKS.easy;
        const medium = READING_PASSAGES_BANKS.medium;
        const hard = READING_PASSAGES_BANKS.hard;
        const p1 = easy[Math.floor(Math.random() * easy.length)];
        const p2 = Math.random() > 0.5
            ? medium[Math.floor(Math.random() * medium.length)]
            : hard[Math.floor(Math.random() * hard.length)];
        return [p1, p2];
    });
    const [passageIndex, setPassageIndex] = useState(0);
    const [qIndex, setQIndex] = useState(0);
    const [answered, setAnswered] = useState<number | null>(null);
    const [correct, setCorrect] = useState(0);

    // TTS state
    const [isSpeaking, setIsSpeaking] = useState(false);

    const currentPassage = passages[passageIndex];
    const q = currentPassage.questions[qIndex];

    // TTS: 지문 읽기
    const handleSpeak = async () => {
        if (isSpeaking) {
            await TextToSpeech.stop();
            setIsSpeaking(false);
            return;
        }

        try {
            setIsSpeaking(true);
            await TextToSpeech.speak({ text: currentPassage.passage, lang: 'en-US', rate: 0.88 });
            setIsSpeaking(false);
        } catch (e) {
            console.warn("TTS Error:", e);
            setIsSpeaking(false);
        }
    };

    // 화면 벗어날 때 TTS 중지
    useEffect(() => {
        return () => { TextToSpeech.stop().catch(() => { }); };
    }, []);

    const handleSelect = (idx: number) => {
        if (answered !== null) return;
        TextToSpeech.stop().catch(() => { }); // 답 선택하면 TTS 중지
        setIsSpeaking(false);
        setAnswered(idx);
        if (idx === q.answerIndex) setCorrect(c => c + 1);
    };

    const goNext = () => {
        if (qIndex < currentPassage.questions.length - 1) {
            setQIndex(i => i + 1);
            setAnswered(null);
        } else if (passageIndex < passages.length - 1) {
            setPassageIndex(i => i + 1);
            setQIndex(0);
            setAnswered(null);
        } else {
            const totalQuestions = passages.reduce((acc, p) => acc + p.questions.length, 0);
            const finalScore = Math.round((correct / totalQuestions) * 100);
            onNext(finalScore);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="px-5 pt-5 pb-32 flex flex-col gap-5 min-h-full">
                {/* 헤더 */}
                <div className="text-center">
                    <div className="w-14 h-14 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-3">
                        <FileText size={28} className="text-amber-600" />
                    </div>
                    <h2 className="text-base font-black text-slate-800">{t('reading_title')}</h2>
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-1">Passage {passageIndex + 1} of {passages.length}</p>
                </div>

                {/* 지문 카드 - TTS 버튼 포함 */}
                <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
                    {/* 지문 헤더 + 재생 버튼 */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{currentPassage.title}</p>

                        <button
                            onClick={handleSpeak}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${isSpeaking
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 animate-pulse'
                                : 'bg-amber-50 text-amber-600 border-2 border-amber-100 hover:bg-amber-100'
                                }`}
                        >
                            {/* 스피커 아이콘 - SVG 직접 삽입 */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                {isSpeaking ? (
                                    <>
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                    </>
                                ) : (
                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                )}
                            </svg>
                            {isSpeaking ? (
                                <span className="flex items-center gap-1">
                                    <span className="w-1 h-3 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                                    <span className="w-1 h-4 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" />
                                    <span className="w-1 h-2 bg-white rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" />
                                </span>
                            ) : 'Listen'}
                        </button>
                    </div>

                    {/* 지문 본문 */}
                    <div className="px-5 py-4">
                        <p className={`text-sm leading-[1.85] font-medium transition-colors duration-300 ${isSpeaking ? 'text-amber-800' : 'text-slate-700'}`}>
                            {currentPassage.passage}
                        </p>
                    </div>
                </div>

                {/* 질문 */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-amber-500 text-white text-xs font-black rounded-lg flex items-center justify-center shrink-0">
                            Q{qIndex + 1}
                        </span>
                        <p className="text-sm font-black text-slate-700">{getTx(q.question, l)}</p>
                    </div>

                    <div className="space-y-2.5">
                        {q.options.map((opt: TranslationText, idx: number) => {
                            let cls = 'bg-white border-slate-100 text-slate-700';
                            if (answered !== null) {
                                if (idx === q.answerIndex) cls = 'bg-emerald-500 border-emerald-400 text-white';
                                else if (idx === answered) cls = 'bg-red-400 border-red-400 text-white opacity-80';
                            }
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    disabled={answered !== null}
                                    className={`w-full py-4 px-5 rounded-2xl border-2 font-bold text-sm text-left transition-all active:scale-[0.98] ${cls}`}
                                >
                                    <span className="font-black mr-2 opacity-60">{String.fromCharCode(65 + idx)}.</span>
                                    {getTx(opt, l)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {answered !== null && (
                    <button
                        onClick={goNext}
                        className="w-full bg-amber-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                    >
                        {(qIndex < currentPassage.questions.length - 1 || passageIndex < passages.length - 1) ? t('next') : t('submit')} →
                    </button>
                )}

                <div className="text-center text-xs font-black text-slate-300 uppercase tracking-widest pb-2">
                    {qIndex + 1} / {currentPassage.questions.length} (Passage {passageIndex + 1}/{passages.length})
                </div>
            </div>
        </div>
    );
}


// ─── 5. 결과 화면 (리디자인) ─────────────────────────────────────
function TestResultScreen({
    lang, scores, setScreen, onRetake
}: {
    lang: string;
    scores: { vocab: number; grammar: number; reading: number };
    setScreen: (s: string) => void;
    onRetake: () => void;
}) {
    const { t } = useLT(lang);
    const l = lang as SupportedLang;

    const overall = Math.round((scores.vocab + scores.grammar + scores.reading) / 3);

    const getCEFR = (score: number): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' => {
        if (score >= 96) return 'C2';
        if (score >= 85) return 'C1';
        if (score >= 70) return 'B2';
        if (score >= 50) return 'B1';
        if (score >= 30) return 'A2';
        return 'A1';
    };

    const resultLevel = getCEFR(overall);
    const isUpper = resultLevel === 'B2' || resultLevel === 'C1' || resultLevel === 'C2';
    const recommendedLevel = CEFR_CONFIG.find(c => c.id === resultLevel)?.range[0] || 1;

    useEffect(() => {
        try {
            localStorage.setItem('vq_level_test_result', JSON.stringify({
                level: resultLevel,
                scores: scores,
                overall: overall,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {
            console.error("Failed to save level test result", e);
        }
    }, [resultLevel, scores, overall]);

    // ── 레벨별 AI 코멘트 (다국어) ─────────────────────────────────
    type CommentMap = Record<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2', TranslationText>;
    const AI_COMMENTS: CommentMap = {
        A1: {
            ko: '아직 영어가 낯설게 느껴지시나요? 괜찮아요. 모든 고수는 여기서 출발했습니다. Vocaquest와 함께라면 하루 10분으로도 놀라운 변화를 경험할 수 있어요.',
            en: 'Feeling new to English? That\'s okay—every expert started at zero. With Vocaquest, just 10 minutes a day will bring surprising results.',
            ja: '英語が難しく感じますか？大丈夫です。すべての上級者はここからスタートしました。Vocaquestとなら、1日10分で驚くほど変われます。',
            zh: '英语感觉陌生？没关系，所有高手都从这里出发。和Vocaquest一起，每天10分钟就能带来惊喜变化。',
            tw: '英語感覺陌生？沒關係，每個高手都從這裡出發。和Vocaquest一起，每天10分鐘就能帶來驚喜變化。',
            vi: 'Tiếng Anh còn xa lạ với bạn? Không sao cả—mọi cao thủ đều bắt đầu từ đây. Với Vocaquest, chỉ 10 phút mỗi ngày sẽ tạo ra sự thay đổi đáng ngạc nhiên.',
        },
        A2: {
            ko: '탄탄한 영어의 뼈대를 이미 가지고 계시네요! 확인된 기초 레벨은 A2 수준입니다. 가끔 헷갈리는 단어와 문법만 Vocaquest로 확실히 잡아주면, 금방 다음 레벨로 도약할 수 있어요.',
            en: 'You already have a solid English foundation! Your confirmed level is A2. A little targeted practice with Vocaquest on tricky words and grammar will take you to the next level in no time.',
            ja: '英語の基礎はしっかりしています！確認されたレベルはA2です。VocaquestでF苦手な単語と文法を仕上げれば、すぐに次のレベルへ跳躍できます。',
            zh: '您已经有了扎实的英语基础！确认词汇水平为A2。用Vocaquest专项练习薄弱的单词和语法，您很快就能跃升到下一个级别。',
            tw: '您已具備紮實的英語基礎！確認詞彙程度為A2。用Vocaquest針對薄弱單詞和文法重點練習，很快就能躍升到下一個級別。',
            vi: 'Bạn đã có nền tảng tiếng Anh vững chắc! Trình độ xác nhận của bạn là A2. Chỉ cần luyện tập có mục tiêu với Vocaquest về từ vựng và ngữ pháp còn thiếu, bạn sẽ lên cấp tiếp theo ngay thôi.',
        },
        B1: {
            ko: '탄탄한 영어의 뼈대를 이미 가지고 계시네요! 현재 확인된 레벨은 B1 수준입니다. 가끔 헷갈리는 단어와 문법만 Vocaquest로 확실히 잡아주면, 금방 B2로 도약할 수 있어요.',
            en: 'You have a solid English structure! Your confirmed level is B1. Nail those tricky words and grammar gaps with Vocaquest, and a B2 leap is just around the corner.',
            ja: '英語のしっかりとした土台をお持ちです！確認されたレベルはB1です。VocaquestでF苦手箇所を攻略すれば、B2への跳躍がすぐそこです。',
            zh: '您已拥有扎实的英语基础！确认水平为B1。用Vocaquest攻克薄弱点，B2的飞跃就在眼前。',
            tw: '您已具備紮實的英語基礎！確認程度為B1。用Vocaquest攻克薄弱點，B2的飛躍就在眼前。',
            vi: 'Bạn đã có nền tảng tiếng Anh vững chắc! Trình độ xác nhận là B1. Luyện tập với Vocaquest để lấp đầy những điểm yếu, và bước nhảy lên B2 chỉ còn trong tầm tay.',
        },
        B2: {
            ko: '이 짧은 테스트에서 훌륭한 직관력을 보여주셨어요! 당신의 잠재 레벨은 B2입니다. 하지만 진짜 실력은 \'어렴풋이 아는 것\'을 \'실전에서 1초 만에 꺼내 쓰는 것\'에서 나옵니다. Vocaquest와 함께 숨어있는 빈틈을 채우고 완벽한 B2를 완성해 볼까요?',
            en: 'You showed great instincts in this short test! Your estimated potential is B2. But true mastery means pulling words and grammar in 1 second in real-life—not just vaguely knowing them. Let\'s close the hidden gaps together with Vocaquest.',
            ja: 'この短いテストで素晴らしい直感力を発揮しました！予測レベルはB2です。しかし本物の実力は「うっすら知っている」を「実戦で瞬時に引き出せる」ことです。Vocaquestで隠れたギャップを埋め、完璧なB2を目指しましょう。',
            zh: '您在这次短测中展现出了出色的直觉！预估潜力水平为B2。但真正的实力在于"隐约知道"变成"实战中1秒调用"。让我们和Vocaquest一起填补隐藏的短板吧。',
            tw: '您在這次短測中展現了出色的直覺！預估潛力程度為B2。但真正的實力在於「隱約知道」變成「實戰中1秒調用」。讓我們和Vocaquest一起填補隱藏的短板吧。',
            vi: 'Bạn đã thể hiện bản năng tốt trong bài kiểm tra ngắn này! Tiềm năng ước tính của bạn là B2. Nhưng thực lực thật sự là "biết mơ hồ" thành "lấy ra trong 1 giây khi thực chiến". Hãy cùng Vocaquest lấp đầy những khoảng trống ẩn nhé.',
        },
        C1: {
            ko: '짧은 테스트에서 훌륭한 직관력을 보여주셨어요! 당신의 잠재 레벨은 C1입니다. 하지만 진짜 실력은 \'어렴풋이 아는 것\'을 \'실전에서 1초 만에 꺼내 쓰는 것\'에서 나옵니다. 이제 Vocaquest와 함께 숨어있는 빈틈을 채우고 완벽한 C1을 완성해 볼까요?',
            en: 'You showed outstanding instincts in this short test! Your estimated potential is C1. But true mastery means using words instantly in real-life situations—not just recognising them. Let\'s perfect that last 10% together with Vocaquest.',
            ja: '短いテストで傑出した直感力を発揮しました！予測レベルはC1です。しかし本物の実力は実戦での瞬時の引き出しです。VocaquestでC1を完璧に仕上げましょう。',
            zh: '您在这次短测中展现了卓越的直觉！预估潜力水平为C1。但真正的实力需要实战中秒级提取词汇。让我们和Vocaquest一起将C1打磨完美。',
            tw: '您在這次短測中展現了卓越的直覺！預估潛力程度為C1。但真正的實力需要實戰中秒級提取詞彙。讓我們和Vocaquest一起將C1打磨完美。',
            vi: 'Bạn đã thể hiện trực giác xuất sắc! Tiềm năng ước tính của bạn là C1. Nhưng thực lực thật sự cần phải lấy từ vựng tức thời trong thực chiến. Hãy cùng Vocaquest hoàn thiện C1 đó nhé.',
        },
        C2: {
            ko: '경이로운 수준의 영어 직관을 보여주셨네요! 당신의 잠재 레벨은 최상위인 C2입니다. 이미 완벽에 가깝지만, Vocaquest와 함께라면 그 마지막 1%의 미세한 뉘앙스까지 정복하여 진정한 마스터가 될 수 있습니다.',
            en: 'You demonstrated a phenomenal level of English intuition! Your potential is the top-tier C2. You are near-perfect, but with Vocaquest, you can master even the last 1% of subtle nuances to become a true master.',
            ja: '驚異的なレベルの英語直感力を見せてくれましたね！あなたの潜在レベルは最高位のC2です。既に完璧に近いですが、Vocaquestとなら最後1%の微細なニュ아ンスまで征服し、真のマスターになれます。',
            zh: '您展现了令人惊叹的英语直觉！您的潜力水平是最高级的C2。虽然已经近乎完美，하지만 通过Vocaquest，您可以征服最后1%的细微差别，成为真正的专家。',
            tw: '您展現了令人驚嘆的英語直覺！您的潛力程度是最高級的C2。雖然已經近乎完美，但透過Vocaquest，您可以征服最後1%的細微差別，成為真正的專家。',
            vi: 'Bạn đã thể hiện trực giác tiếng Anh ở mức độ phi thường! Tiềm năng của bạn là cấp độ cao nhất C2. Bạn đã gần như hoàn hảo, nhưng với Vocaquest, bạn có thể chinh phục cả 1% sắc thái tinh tế cuối cùng để trở thành bậc thầy thực thụ.',
        },
    };

    // ── 영역별 인사이트 코멘트 ─────────────────────────────────────
    type InsightKey = 'vocab' | 'grammar' | 'reading';
    const getSectionInsight = (key: InsightKey, score: number): TranslationText => {
        const high = score >= 75;
        const INSIGHTS: Record<InsightKey, { high: TranslationText; low: TranslationText }> = {
            vocab: {
                high: {
                    ko: '핵심 어휘 감각 뛰어남 → 이제 고급 실전 어휘로 범위를 확장하세요.',
                    en: 'Strong core vocabulary sense → Time to expand into advanced real-world words.',
                    ja: '核心語彙の感覚が優れています → 今度は高級実戦語彙へ拡張を。',
                    zh: '核心词汇直觉出色 → 现在是扩展高级实战词汇的时候了。',
                    tw: '核心詞彙直覺出色 → 現在是擴展高級實戰詞彙的時候了。',
                    vi: 'Cảm giác từ vựng cốt lõi tốt → Đến lúc mở rộng sang từ vựng thực chiến nâng cao.',
                },
                low: {
                    ko: '기초 단어를 조금 더 다지면 전체 점수가 단번에 올라갑니다.',
                    en: 'Strengthening core words will boost your overall score quickly.',
                    ja: '基礎単語を固めると全体スコアが一気に上がります。',
                    zh: '巩固基础词汇，整体分数会快速提升。',
                    tw: '鞏固基礎詞彙，整體分數將快速提升。',
                    vi: 'Củng cố từ vựng nền tảng sẽ nâng toàn bộ điểm số lên nhanh chóng.',
                },
            },
            grammar: {
                high: {
                    ko: '큰 문법 규칙은 잘 이해 중 → 이제 예외 규칙과 세밀한 뉘앙스를 다듬어 보세요.',
                    en: 'Major grammar rules solid → Refine the exceptions and subtle nuances next.',
                    ja: '大きな文法規則はしっかり理解 → 今度は例外規則と細かなニュアンスを磨きましょう。',
                    zh: '主要语法规则掌握扎实 → 下一步磨练例外规则和细微差别。',
                    tw: '主要文法規則掌握紮實 → 下一步磨練例外規則和細微差別。',
                    vi: 'Nắm chắc các quy tắc ngữ pháp lớn → Bước tiếp theo là mài giũa các ngoại lệ và sắc thái tinh tế.',
                },
                low: {
                    ko: '문장 구조를 체계적으로 정리하면 회화·작문 실력이 크게 향상됩니다.',
                    en: 'Systematising sentence structure will massively improve speaking and writing.',
                    ja: '文章構造を体系的に整理すると、会話・作文が大きく伸びます。',
                    zh: '系统梳理句子结构，口语和写作会大幅提升。',
                    tw: '系統梳理句子結構，口語和寫作會大幅提升。',
                    vi: 'Hệ thống hóa cấu trúc câu sẽ cải thiện đáng kể kỹ năng nói và viết.',
                },
            },
            reading: {
                high: {
                    ko: '독해 속도와 이해력이 좋습니다 → 고난도 시사·학술 지문으로 레벨을 올리세요.',
                    en: 'Good reading speed and comprehension → Level up with advanced news and academic texts.',
                    ja: '読解速度と理解力が良好 → 難度の高い時事・学術文章でレベルアップを。',
                    zh: '阅读速度和理解力不错 → 用高难度时事和学术文章进一步提升。',
                    tw: '閱讀速度和理解力不錯 → 用高難度時事和學術文章進一步提升。',
                    vi: 'Tốc độ đọc và khả năng hiểu đọc tốt → Nâng cấp với các văn bản thời sự và học thuật nâng cao.',
                },
                low: {
                    ko: '짧은 지문부터 규칙적으로 읽는 습관을 들이면 빠르게 실력이 오릅니다.',
                    en: 'Building a daily habit of reading short passages will raise your skills fast.',
                    ja: '短い文章から定期的に読む習慣をつけると、実力が素早く伸びます。',
                    zh: '养成每天阅读短文的习惯，实力会迅速提升。',
                    tw: '養成每天閱讀短文的習慣，實力會迅速提升。',
                    vi: 'Xây dựng thói quen đọc văn bản ngắn hàng ngày sẽ nâng cao kỹ năng của bạn nhanh chóng.',
                },
            },
        };
        return high ? INSIGHTS[key].high : INSIGHTS[key].low;
    };

    // ── CTA 문구 (레벨별) ──────────────────────────────────────────
    const CTA_TEXT: Record<typeof resultLevel, TranslationText> = {
        A1: {
            ko: '지금 바로 첫 걸음 시작하기 🌱',
            en: 'Take your first step right now 🌱',
            ja: '今すぐ最初の一歩を踏み出す 🌱',
            zh: '立即迈出第一步 🌱',
            tw: '立即邁出第一步 🌱',
            vi: 'Bắt đầu bước đầu tiên ngay bây giờ 🌱',
        },
        A2: {
            ko: 'B1을 향한 도약 시작하기 🚀',
            en: 'Launch your journey toward B1 🚀',
            ja: 'B1への跳躍をスタート 🚀',
            zh: '开启迈向B1的旅程 🚀',
            tw: '開啟邁向B1的旅程 🚀',
            vi: 'Bắt đầu hành trình hướng tới B1 🚀',
        },
        B1: {
            ko: '완벽한 B2를 향해 출발하기 🎯',
            en: 'Start your path to a perfect B2 🎯',
            ja: '完璧なB2へ出発しよう 🎯',
            zh: '开启完美B2的征程 🎯',
            tw: '開啟完美B2的征程 🎯',
            vi: 'Bắt đầu hành trình đến B2 hoàn hảo 🎯',
        },
        B2: {
            ko: '진짜 C1을 향한 여정 시작하기 🏆',
            en: 'Begin your journey to real C1 mastery 🏆',
            ja: '本物のC1マスタリーへの旅を始めよう 🏆',
            zh: '开启真正C1精通之旅 🏆',
            tw: '開啟真正C1精通之旅 🏆',
            vi: 'Bắt đầu hành trình đến C1 thực sự 🏆',
        },
        C1: {
            ko: '완벽한 C1을 향해 출발하기 👑',
            en: 'Start your journey to perfect C1 👑',
            ja: '完璧なC1への旅を始めよう 👑',
            zh: '开启完美C1之旅 👑',
            tw: '開啟完美C1之旅 👑',
            vi: 'Bắt đầu hành trình đến C1 hoàn hảo 👑',
        },
        C2: {
            ko: '진정한 영어 마스터의 길 👑',
            en: 'The path of a true English Master 👑',
            ja: '真の英語マスターへの道 👑',
            zh: '真正的英语大师之路 👑',
            tw: '真正的英語大師之路 👑',
            vi: 'Con đường của một bậc thầy tiếng Anh thực thụ 👑',
        },
    };

    const barData: { key: InsightKey; label: string; score: number; color: string; light: string; border: string }[] = [
        { key: 'vocab', label: t('result_vocab'), score: scores.vocab, color: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-100' },
        { key: 'grammar', label: t('result_grammar'), score: scores.grammar, color: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-100' },
        { key: 'reading', label: t('result_reading'), score: scores.reading, color: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-100' },
    ];

    return (
        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 space-y-5">

            {/* ① 상단 헤더 - "잠재 레벨" 프레임 */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 rounded-[32px] p-6 text-white text-center shadow-2xl shadow-indigo-500/25 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-purple-400/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                    {/* 별점 */}
                    <div className="flex justify-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i}
 size={15} fill={i <= Math.round(overall / 20) ? 'white' : 'transparent'} className="text-white/50" />
                        ))}
                    </div>
                    {/* 새 타이틀 */}
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">
                        ✦ Estimated Potential Level ✦
                    </p>
                    <h1 className="text-7xl font-black italic tracking-tighter leading-none mb-2">{resultLevel}</h1>
                    <p className="text-4xl font-black leading-none">
                        {overall}<span className="text-xl text-white/50"> / 100</span>
                    </p>
                    {/* 티어 태그 */}
                    <div className={`inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${isUpper ? 'bg-yellow-400/20 text-yellow-200 border border-yellow-400/30' : 'bg-white/10 text-white/70 border border-white/20'}`}>
                        {isUpper ? '⭐ High Potential' : '🌱 Growth Potential'}
                    </div>
                </div>
            </div>

            {/* ② AI 코멘트 카드 */}
            <div className={`rounded-[24px] p-5 border-2 ${isUpper ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg ${isUpper ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                        {isUpper ? '🧠' : '💪'}
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isUpper ? 'text-amber-500' : 'text-emerald-600'}`}>
                            AI Coach Comment
                        </p>
                        <p className={`text-xs font-bold leading-relaxed ${isUpper ? 'text-amber-900' : 'text-emerald-900'}`}>
                            {getTx(AI_COMMENTS[resultLevel], l)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ③ 영역별 점수 + 인사이트 */}
            <div className="bg-white rounded-[28px] p-5 border-2 border-slate-100 space-y-5 shadow-sm">
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">{t('result_overall')}</h3>
                {barData.map(({ key, label, score, color, light, border }) => (
                    <div key={key}>
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{label}</span>
                            <span className="text-sm font-black text-slate-800">
                                {score}<span className="text-slate-300 font-bold text-xs">/100</span>
                            </span>
                        </div>
                        {/* 게이지 바 */}
                        <div className={`w-full h-3 rounded-full ${light} overflow-hidden mb-1.5`}>
                            <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
                        </div>
                        {/* 영역별 인사이트 */}
                        <div className={`rounded-xl p-2.5 ${light} border ${border} flex items-start gap-2`}>
                            <span className="text-[10px] shrink-0 mt-px">
                                {score >= 75 ? '✅' : '📌'}
                            </span>
                            <p className="text-[10px] font-bold leading-relaxed text-slate-600">
                                {getTx(getSectionInsight(key, score), l)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ④ 추천 레벨 */}
            <div className="bg-indigo-50 rounded-[28px] p-5 border-2 border-indigo-100 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{t('recommended_level')}</p>
                    <p className="text-3xl font-black text-indigo-700">Level <span className="italic">{recommendedLevel}</span></p>
                    <p className="text-xs text-indigo-400 font-bold mt-0.5">{resultLevel} · {overall} pts</p>
                </div>
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">{resultLevel === 'C1' ? '👑' : resultLevel === 'B2' ? '🏆' : resultLevel === 'B1' ? '🎯' : '🚀'}</span>
                </div>
            </div>

            {/* ⑤ 레벨별 CTA 버튼 */}
            <button
                onClick={() => setScreen('HOME')}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {getTx(CTA_TEXT[resultLevel], l)}
                <ChevronRight size={18} />
            </button>

            {/* ⑥ 레벨테스트 다시하기 버튼 */}
            <button
                onClick={onRetake}
                className="w-full mt-3 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-sm border-2 border-slate-200 active:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center"
            >
                {l === 'ko' ? '레벨테스트 다시하기 🔄' : l === 'ja' ? 'レベルテストをやり直す 🔄' : l === 'zh' ? '重新开始测试 🔄' : l === 'tw' ? '重新開始測試 🔄' : l === 'vi' ? 'Làm lại bài kiểm tra 🔄' : 'Retake Level Test 🔄'}
            </button>

        </div>
    );
}


// ─── 메인 컨테이너 ──────────────────────────────────────────────
export function LevelTestContainer({ settings, setScreen }: { settings: any; setScreen: (s: string) => void }) {
    const { t } = useLT(settings.lang);
    const lang: string = settings.lang;

    const [step, setStep] = useState<'intro' | Step>(() => {
        try {
            if (localStorage.getItem('vq_level_test_result')) return 'result';
            const saved = localStorage.getItem('vq_level_test_step');
            if (saved === 'self' || saved === 'vocab' || saved === 'grammar' || saved === 'reading') return saved;
        } catch { }
        return 'intro';
    });
    const [scores, setScores] = useState<{ vocab: number; grammar: number; reading: number; }>(() => {
        try {
            const resultSaved = localStorage.getItem('vq_level_test_result');
            if (resultSaved) return JSON.parse(resultSaved).scores;
            const progressSaved = localStorage.getItem('vq_level_test_scores');
            if (progressSaved) return JSON.parse(progressSaved);
        } catch { }
        return { vocab: 0, grammar: 0, reading: 0 };
    });
    const [_selfLevel, setSelfLevel] = useState(() => {
        return localStorage.getItem('vq_level_test_self_level') || 'A2';
    });

    useEffect(() => {
        if (step !== 'result') {
            localStorage.setItem('vq_level_test_step', step);
            localStorage.setItem('vq_level_test_scores', JSON.stringify(scores));
            localStorage.setItem('vq_level_test_self_level', _selfLevel);
        } else {
            localStorage.removeItem('vq_level_test_step');
            localStorage.removeItem('vq_level_test_scores');
            localStorage.removeItem('vq_level_test_self_level');
        }
    }, [step, scores, _selfLevel]);

    const stepNum = step === 'intro' ? 0
        : step === 'self' ? 1
            : step === 'vocab' ? 2
                : step === 'grammar' ? 3
                    : step === 'reading' ? 4
                        : 5;

    return (
        <div className="screen flex flex-col bg-slate-50 overflow-hidden">
            {/* 헤더 */}
            <header className="shrink-0 flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 shadow-sm">
                <button onClick={() => setScreen('HOME')}
 className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-xl active:scale-90 transition text-slate-500">
                    <X size={18} />
                </button>
                <h1 className="font-black text-base text-slate-800">{t('test_title')}</h1>
                <div className="w-9" />
            </header>

            {/* 프로그레스 바 (인트로/결과 제외) */}
            {step !== 'intro' && step !== 'result' && (
                <ProgressBar current={stepNum} total={4} lang={lang} />
            )}

            {/* 인트로 */}
            {step === 'intro' && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-float">
                        <BarChart2 size={48} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{t('test_title')}</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">{t('test_subtitle')}</p>
                    </div>
                    <div className="w-full max-w-xs space-y-3">
                        {(['step_self', 'step_vocab', 'step_grammar', 'step_reading'] as const).map((key, i) => {
                            const icons = [Brain, BookOpen, Sparkles, FileText];
                            const Icon = icons[i];
                            return (
                                <div key={key}
 className="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-slate-100 text-left">
                                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                        <Icon size={18} />
                                    </div>
                                    <span className="font-black text-slate-700 text-sm">{t(key)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => setStep('self')}
                        className="w-full max-w-xs bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        {t('start_test')} 🚀
                    </button>
                </div>
            )}

            {step === 'self' && (
                <SelfAssessmentScreen lang={lang} onNext={(level) => { setSelfLevel(level); setStep('vocab'); }} />
            )}
            {step === 'vocab' && (
                <VocabTestScreen lang={lang} onNext={(s) => { setScores(prev => ({ ...prev, vocab: s })); setStep('grammar'); }} />
            )}
            {step === 'grammar' && (
                <GrammarTestScreen lang={lang} onNext={(s) => { setScores(prev => ({ ...prev, grammar: s })); setStep('reading'); }} />
            )}
            {step === 'reading' && (
                <ReadingTestScreen lang={lang} onNext={(s) => { setScores(prev => ({ ...prev, reading: s })); setStep('result'); }} />
            )}
            {step === 'result' && (
                <TestResultScreen lang={lang} scores={scores} setScreen={setScreen} onRetake={() => {
                    setScores({ vocab: 0, grammar: 0, reading: 0 });
                    setStep('intro');
                }} />
            )}
        </div>
    );
}
