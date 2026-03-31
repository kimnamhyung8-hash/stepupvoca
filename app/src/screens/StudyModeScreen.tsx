import { useState, useEffect } from 'react';
import {
    Mic, Volume2, X, ChevronLeft, ChevronRight,
    Crown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { t, getVocaMeaning } from '../i18n';
import { playSound } from '../utils/soundUtils';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { pickUniqueWords, markWordsAsSeen } from '../utils/wordUtils';

interface StudyModeScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
    activeStudyLevel: number;
    words: any[];
}

export const StudyModeScreen = ({ settings, setScreen, activeStudyLevel, words }: StudyModeScreenProps) => {
    const [studyIndex, setStudyIndex] = useState(0);
    const [showMeaning, setShowMeaning] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [phase, setPhase] = useState<'study' | 'quiz' | 'result'>('study');
    const [quizIndex, setQuizIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizWords, setQuizWords] = useState<any[]>([]);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [quizSelection, setQuizSelection] = useState<number | null>(null);
    const [currentOptions, setCurrentOptions] = useState<string[]>([]);
    const [currentCorrectIdx, setCurrentCorrectIdx] = useState<number>(-1);

    const currentWord = words[studyIndex];

    const playTTS = async (text: string) => {
        try {
            if (settings?.tts === false) return;
            await TextToSpeech.speak({ text, lang: 'en-US', rate: 0.9 });
        } catch (err) { console.warn("TTS Error:", err); }
    };

    const checkPronunciation = async (word: string) => {
        try {
            const WebSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!WebSpeechRecognition) {
                setFeedbackMsg({ type: 'error', text: t(settings.lang, "browser_no_speech") });
                return;
            }

            const recognition = new WebSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsRecording(true);
                setFeedbackMsg({ type: 'info', text: t(settings.lang, "listening") });
            };

            recognition.onresult = (event: any) => {
                const said = event.results[0][0].transcript.toLowerCase().replace(/[^a-z]/g, '');
                const target = word.toLowerCase().replace(/[^a-z]/g, '');
                const ok = said === target || said.includes(target) || target.includes(said);

                setFeedbackMsg({
                    type: ok ? 'success' : 'error',
                    text: ok ? `${t(settings.lang, "perfect")} (${event.results[0][0].transcript})` : `${t(settings.lang, "try_again")} (${event.results[0][0].transcript})`
                });
                playSound(ok ? 'correct' : 'wrong');
            };

            recognition.onerror = () => {
                setFeedbackMsg({ type: 'error', text: t(settings.lang, "try_again") });
                playSound('wrong');
            };

            recognition.onend = () => setIsRecording(false);
            recognition.start();

        } catch (err) {
            setIsRecording(false);
            setFeedbackMsg({ type: 'error', text: t(settings.lang, "error_occurred") });
        }
    };

    const showAdIfFree = async () => {
        // Mock ad function
        console.log("Checking for ads...");
    };

    const startQuiz = () => {
        const selected = pickUniqueWords(words, 5);
        if (selected.length > 0) {
            markWordsAsSeen(selected.map(w => w.word));
        }
        setQuizWords(selected);
        setQuizIndex(0);
        setScore(0);
        setPhase('quiz');
        setQuizAnswered(false);
        setQuizSelection(null);
    };

    const handleQuizSelect = (idx: number, isCorrect: boolean) => {
        setQuizSelection(idx);
        setQuizAnswered(true);
        if (isCorrect) {
            setScore(s => s + 1);
            playSound('correct');
        } else {
            playSound('wrong');
        }

        setTimeout(() => {
            if (quizIndex < quizWords.length - 1) {
                setQuizIndex(i => i + 1);
                setQuizAnswered(false);
                setQuizSelection(null);
            } else {
                setPhase('result');
            }
        }, 1500);
    };

    const getVocaOptions = (q: any, lang: string) => {
        const correct = getVocaMeaning(q, lang);
        const distractors = words
            .filter(w => w.word !== q.word)
            .map(w => getVocaMeaning(w, lang))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = [...distractors, correct].sort(() => Math.random() - 0.5);
        return { options, answerIndex: options.indexOf(correct) };
    };

    // Stabilize options to prevent shuffling on re-render
    useEffect(() => {
        if (phase === 'quiz' && quizWords[quizIndex]) {
            const { options, answerIndex } = getVocaOptions(quizWords[quizIndex], settings.lang);
            setCurrentOptions(options);
            setCurrentCorrectIdx(answerIndex);
        }
    }, [quizIndex, quizWords, phase, settings.lang]);

    if (phase === 'result') {
        const percent = Math.round((score / quizWords.length) * 100);
        return (
            <div className="screen bg-white flex flex-col animate-fade-in">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="relative mb-10">
                        <div className="w-40 h-40 rounded-[56px] bg-indigo-50 flex items-center justify-center shadow-2xl border-2 border-indigo-100/50">
                            <Crown size={80} className="text-primary animate-bounce-slow" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-xl ring-4 ring-white">
                            {percent}%
                        </div>
                    </div>

                    <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">{t(settings.lang, 'quiz_finished')}</h2>
                    <p className="text-slate-500 font-bold mb-10">{t(settings.lang, 'score_summary').replace('{n}', score.toString()).replace('{t}', quizWords.length.toString())}</p>

                    <div className="w-full max-w-sm space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-50 border-2 border-slate-100 p-6 rounded-[32px] text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t(settings.lang, 'correct_answers')}</p>
                                <p className="text-2xl font-black text-primary">{score}</p>
                            </div>
                            {percent === 100 && (
                                <div className="bg-green-50/50 border-2 border-green-100 p-6 rounded-[32px] text-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 className="text-green-500" size={20} />
                                    </div>
                                    <p className="text-xs font-black text-green-600">{t(settings.lang, 'perfect_score')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <footer className="p-6 bg-white border-t border-slate-50 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <button onClick={async () => { await showAdIfFree(); setScreen('STUDY_LEVEL'); }}
                         className="three-d-btn w-full bg-slate-800 text-white py-5 rounded-[24px] font-black text-xl shadow-[0_6px_0_#000000] active:translate-y-1 active:shadow-none transition-all">
                        {t(settings.lang, 'back_to_levels')}
                    </button>
                </footer>
            </div>
        );
    }

    if (phase === 'quiz') {
        const q = quizWords[quizIndex];
        if (!q || currentOptions.length === 0) return null;
        const opts = currentOptions;
        const correctIdx = currentCorrectIdx;
        return (
            <div className="screen bg-[#F8FAFC] flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-30 shrink-0 shadow-sm">
                    <button onClick={() => setPhase('study')}
 className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm"><X size={20} /></button>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">{t(settings.lang, "level_quiz").replace('{n}', activeStudyLevel.toString())}</span>
                        <span className="text-sm font-black text-slate-800">{quizIndex + 1} / {quizWords.length}</span>
                    </div>
                    <div className="w-10" />
                </header>

                <div className="h-1.5 bg-slate-100 shrink-0">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((quizIndex + 1) / quizWords.length) * 100}%` }} />
                </div>

                <main className="flex-1 flex flex-col items-center justify-start px-6 pt-10">
                    <div className="w-full max-w-sm bg-white rounded-[28px] p-5 text-center mb-4 relative shadow-lg shadow-indigo-500/5 border-2 border-slate-50">
                        <button onClick={() => playTTS(q.word)}
 className="absolute top-4 right-4 p-2.5 bg-slate-50 text-slate-400 rounded-full hover:bg-white hover:text-primary active:scale-90 transition border border-slate-100 shadow-sm">
                            <Volume2 size={20} />
                        </button>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3 italic opacity-80">{t(settings.lang, "what_is_meaning")}</p>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-tight italic">{q.word}</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 w-full max-w-sm">
                        {opts.map((opt: string, idx: number) => {
                            const isCorrectOpt = idx === correctIdx;
                            let cls = 'bg-white border-slate-100 text-slate-700 shadow-sm';
 
                            if (quizAnswered) {
                                if (idx === quizSelection && isCorrectOpt) cls = 'bg-emerald-500 border-emerald-400 text-white scale-105 shadow-xl shadow-emerald-500/20';
                                else if (idx === quizSelection && !isCorrectOpt) cls = 'bg-rose-500 border-rose-400 text-white scale-95 opacity-80';
                                else if (isCorrectOpt) cls = 'bg-emerald-500 border-emerald-400 text-white animate-pulse shadow-lg';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleQuizSelect(idx, isCorrectOpt)}
                                    disabled={quizAnswered}
                                    className={`py-3.5 px-6 border-2 rounded-[22px] font-black text-[16px] text-center break-keep leading-snug transition-all duration-300 active:scale-98 ${cls} ${!quizAnswered ? 'hover:border-primary/30 hover:shadow-md' : ''}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="screen animate-fade-in bg-[#F8FAFC] flex flex-col h-full">
            <header className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 bg-white shadow-sm z-20 shrink-0">
                <button onClick={async () => { await showAdIfFree(); setScreen('STUDY_LEVEL'); }}
 className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm"><X size={20} /></button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-1"><Crown size={12} /> {t(settings.lang, "level_study").replace('{n}', activeStudyLevel.toString())}</span>
                    <span className="text-sm font-black text-slate-800">{studyIndex + 1} / {words.length}</span>
                </div>
                <button onClick={startQuiz}
 className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl hover:brightness-110 active:scale-95 transition shadow-sm">
                    {t(settings.lang, "start_quiz")}
                </button>
            </header>

            <div className="h-1.5 bg-slate-100 shrink-0">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-primary transition-all duration-300" style={{ width: `${((studyIndex + 1) / words.length) * 100}%` }} />
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center gap-10 pb-[calc(var(--nav-height)+20px)] scrollbar-hide">
                <div
                    onClick={() => { if (!showMeaning) { setShowMeaning(true); playTTS(currentWord.word); } }}
                    className={`w-full max-w-sm rounded-[48px] flex flex-col items-center justify-center text-center shadow-xl border-2 transition-all cursor-pointer select-none relative min-h-[320px] p-10 ${showMeaning ? 'bg-white border-primary shadow-indigo-500/10' : 'bg-white border-slate-100 hover:border-slate-200 active:scale-[0.98]'
                        }`}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); playTTS(currentWord.word); }}
                        className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-white hover:text-primary active:scale-90 transition border border-slate-100 shadow-sm"
                    >
                        <Volume2 size={24} />
                    </button>

                    <h1 className="text-[clamp(2.5rem,10vh,4rem)] font-black text-slate-800 tracking-tighter mb-4">{currentWord.word}</h1>

                    {showMeaning ? (
                        <div className="animate-fade-in w-full space-y-8">
                            <p className="text-3xl font-black text-primary">{getVocaMeaning(currentWord, settings.lang)}</p>

                            <div className="space-y-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); checkPronunciation(currentWord.word); }}
                                    disabled={isRecording}
                                    className={`mx-auto flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-sm transition-all shadow-sm ${isRecording ? 'bg-red-50 text-red-500 border-2 border-red-100 animate-pulse'
                                        : 'bg-indigo-50 text-indigo-600 border-2 border-indigo-100 hover:bg-white active:scale-95'
                                        }`}
                                >
                                    <Mic size={20} /> {isRecording ? t(settings.lang, "listening") : t(settings.lang, "ai_pron_check")}
                                </button>

                                {feedbackMsg && (
                                    <div className="flex items-center justify-center animate-slide-up">
                                        {feedbackMsg.type === 'success' ? (
                                            <div className="bg-green-50 border-2 border-green-100 text-green-600 px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2">
                                                <CheckCircle2 size={16} /> {feedbackMsg.text}
                                            </div>
                                        ) : feedbackMsg.type === 'error' ? (
                                            <div className="bg-red-50 border-2 border-red-100 text-red-500 px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2">
                                                <AlertCircle size={16} /> {feedbackMsg.text}
                                            </div>
                                        ) : (
                                            <div className="bg-blue-50 border-2 border-blue-100 text-blue-500 px-6 py-2.5 rounded-2xl font-black text-xs animate-pulse">
                                                {feedbackMsg.text}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 animate-pulse">
                            <div className="w-12 h-1 bg-slate-100 rounded-full"></div>
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{t(settings.lang, "tap_to_reveal_desc")}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 w-full max-w-sm px-2">
                    <button onClick={() => { setStudyIndex(i => Math.max(0, i - 1)); setShowMeaning(false); setFeedbackMsg(null); }}
                        disabled={studyIndex === 0}
                        className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-tighter transition-all flex items-center justify-center gap-1.5 border-2 shadow-lg active:scale-95 ${studyIndex === 0 ? 'bg-slate-50 text-slate-200 border-slate-50 shadow-none' : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary shadow-slate-200/40'
                            }`}>
                        <ChevronLeft size={16} /> {t(settings.lang, "prev")}
                    </button>
                    {!showMeaning && (
                        <button onClick={() => { setShowMeaning(true); playTTS(currentWord.word); }}
                            className="flex-1 py-4 rounded-[22px] bg-gradient-to-b from-indigo-500 to-primary text-white font-black text-xs uppercase tracking-tighter hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/25 border-b-4 border-indigo-700">
                            {t(settings.lang, "show_meaning")}
                        </button>
                    )}
                    <button onClick={() => { setStudyIndex(i => Math.min(words.length - 1, i + 1)); setShowMeaning(false); setFeedbackMsg(null); }}
                        disabled={studyIndex === words.length - 1}
                        className={`flex-1 py-4 rounded-[22px] font-black text-xs uppercase tracking-tighter transition-all flex items-center justify-center gap-1.5 border-2 shadow-lg active:scale-95 ${studyIndex === words.length - 1 ? 'bg-slate-50 text-slate-200 border-slate-50 shadow-none' : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-primary shadow-slate-200/40'
                            }`}>
                        {t(settings.lang, "next")} <ChevronRight size={16} />
                    </button>
                </div>

                {studyIndex === words.length - 1 && showMeaning && (
                    <button onClick={startQuiz}
 className="w-full max-w-sm three-d-btn py-5 rounded-[24px] bg-slate-800 text-white font-black text-lg active:scale-95 transition-all shadow-[0_6px_0_#000000] animate-bounce-slow mt-4">
                        {t(settings.lang, "start_quiz_cta")} 📝
                    </button>
                )}
            </div>
        </div>
    );
};
