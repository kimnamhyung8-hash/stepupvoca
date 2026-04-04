import { useState, useEffect } from 'react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import {
    BookOpen, X, Sparkles, Trash2, Volume2, Trophy,
    CheckCircle2, Vibrate, Mic, RefreshCcw,
    ChevronLeft, ChevronRight, PlayCircle, PauseCircle
} from 'lucide-react';
import { t, getVocaMeaning } from '../i18n';
import { playSound } from '../utils/soundUtils';
import { playNaturalTTS } from '../utils/ttsUtils';
import { vocaDBJson } from '../data/vocaData';
import { PcAdSlot } from '../components/PcComponents';
import { KeepAwake } from '@capacitor-community/keep-awake';

import { getActiveApiKey, LIGHTWEIGHT_MODEL } from '../apiUtils';
interface ReviewScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
    incorrectNotes: any[];
    setIncorrectNotes: any;
    aiUsage: number;
    incrementAiUsage: () => boolean;
    isPremium: boolean;
    setShowApiModal?: (val: boolean) => void;
}

export const ReviewScreen = ({ settings, setScreen, incorrectNotes, setIncorrectNotes, aiUsage, incrementAiUsage, isPremium, setShowApiModal }: ReviewScreenProps) => {
    const [reviewMode, setReviewMode] = useState<'STUDY' | 'TEST'>('TEST');
    const [deck, setDeck] = useState<any[]>([]);
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
    const [phase, setPhase] = useState<'study' | 'done'>('study');
    const [isRecording, setIsRecording] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
    const [userInput, setUserInput] = useState("");
    const [isCheckSuccess, setIsCheckSuccess] = useState<boolean | null>(null);
    const [isGeneratingUsages, setIsGeneratingUsages] = useState(false);
    const [weaknessReport, setWeaknessReport] = useState<any>(null);
    const [isAnalyzingWeakness, setIsAnalyzingWeakness] = useState(false);
    const [revealedUsages, setRevealedUsages] = useState<Set<number>>(new Set());
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [localLang, setLocalLang] = useState<string>(settings?.lang || 'ko');

    const generateWeaknessReport = async () => {
        if (incorrectNotes.length === 0) return;

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);

        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        setIsAnalyzingWeakness(true);
        setWeaknessReport(null);

        try {
            const prompt = `
        Analyze these missed English vocabulary words: ${incorrectNotes.map(n => n.word).join(', ')}.
        Provide a concise AI weakness report in ${localLang}.
        Respond ONLY with a JSON object:
        {
          "overall": "Summary of learning patterns and specific weaknesses found",
          "patterns": ["Pattern 1", "Pattern 2"],
          "roadmap": ["Step 1 to overcome", "Step 2 to overcome", "Step 3 to overcome"],
          "challengeWords": [{"word": "Word", "reason": "Why this is a focus word"}]
        }
      `;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonStr = raw.match(/\{[\s\S]*\}/)?.[0] || '{}';

            // Only increment if call actually succeeded
            if (res.ok) incrementAiUsage();

            setWeaknessReport(JSON.parse(jsonStr));
        } catch (e: any) {
            console.error(e);
            alert(`리포트 생성 실패: ${e.message}`);
        } finally {
            setIsAnalyzingWeakness(false);
        }
    };

    const card = deck[index];
    const meaning = card ? getVocaMeaning(card, localLang) : "";

    const generateUsages = async (wordToGen: string) => {
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);

        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        setIsGeneratingUsages(true);
        try {
            const prompt = `Provide 3 short English example sentences for "${wordToGen}" with translations in ${localLang}. Respond ONLY with a JSON array of objects: [{"en": "...", "tr": "..."}, ...]`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonStr = raw.match(/\[[\s\S]*\]/)?.[0] || '[]';
            const usages = JSON.parse(jsonStr);

            if (Array.isArray(usages) && usages.length > 0) {
                // Usage successful
                incrementAiUsage();
                setDeck(prev => {
                    const nextDeck = [...prev];
                    if (nextDeck[index]) {
                        nextDeck[index] = { ...nextDeck[index], usages };
                    }
                    return nextDeck;
                });
                setIncorrectNotes((prev: any[]) => prev.map(n => (n.word === wordToGen || n.voca === wordToGen) ? { ...n, usages } : n));
            } else {
                throw new Error("Invalid response format");
            }
        } catch (e: any) {
            console.error(e);
            alert(`AI 예문 생성 실패: ${e.message || '알 수 없는 오류'}`);
        } finally {
            setIsGeneratingUsages(false);
        }
    };

    const getLatestNoteData = (note: any) => {
        const freshData = vocaDBJson.flatMap((lvl: any) => lvl.words).find((w: any) => (w.word) === (note.word));
        return freshData || { ...note };
    };

    const next = () => {
        setFlipped(false); setFeedbackMsg(null); setUserInput(""); setIsCheckSuccess(null);
        if (index < deck.length - 1) { setIndex(i => i + 1); }
        else {
            if (reviewMode === 'TEST') {
                const remaining = deck.filter(w => !knownIds.has(w.id || w.word));
                if (remaining.length === 0) {
                    setPhase('done');
                    setIsAutoPlaying(false);
                } else {
                    setDeck([...remaining].sort(() => Math.random() - 0.5));
                    setIndex(0);
                }
            } else {
                setPhase('done');
                setIsAutoPlaying(false);
            }
        }
    };

    useEffect(() => {
        const refreshed = incorrectNotes.map(getLatestNoteData);
        setDeck(refreshed);
        setIndex(0);
        setFlipped(false);
        setKnownIds(new Set());
        setRevealedUsages(new Set());
    }, [reviewMode]);

    useEffect(() => {
        setRevealedUsages(new Set());
    }, [index]);

    // 전체 해제 시 화면 꺼짐 허용 방어
    useEffect(() => {
        return () => {
            KeepAwake.allowSleep().catch(() => { });
        };
    }, []);

    // 🎧 무한 반복 루프 재생 로직
    useEffect(() => {
        if (!isAutoPlaying) {
            KeepAwake.allowSleep().catch(() => { });
            return;
        }

        // 화면 켜짐 유지
        KeepAwake.keepAwake().catch(() => { });

        let isActive = true;

        const runAutoPlay = async () => {
            if (phase === 'done' || !deck[index]) {
                setIsAutoPlaying(false);
                return;
            }

            const currentCard = deck[index];
            setFlipped(false);

            // Step 1: Speak English
            await playTTS(currentCard.word);
            if (!isActive) return;

            // Step 2: Pose for thinking / pronunciation
            await new Promise(r => setTimeout(r, 1200));
            if (!isActive) return;

            // Step 3: Flip and speak meaning (Korean)
            setFlipped(true);
            const currentMeaning = getVocaMeaning(currentCard, localLang);
            await playNaturalTTS(currentMeaning, localLang);
            if (!isActive) return;

            // Step 4: Pause before next card
            await new Promise(r => setTimeout(r, 2000));
            if (!isActive) return;

            // Step 5: Execute Next Card
            if (index >= deck.length - 1) {
                setIndex(0); // 끝까지 도달하면 처음부터 무한 반복
            } else {
                next();
            }
        };

        runAutoPlay();

        return () => {
            isActive = false;
        };
    }, [isAutoPlaying, index, deck, phase]);

    const playTTS = async (text: string) => {
        try {
            if (settings?.tts === false) return;
            try {
                // Try Capacitor TTS first
                await TextToSpeech.speak({ text, lang: 'en-US', rate: 0.9, volume: 1.0 });
            } catch (e) {
                // Fallback to Web Speech API (Browser native)
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        } catch (err) { console.warn("TTS Error:", err); }
    };

    const checkPronunciation = async () => {
        if (!deck[index]) return;
        try {
            const WebSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!WebSpeechRecognition) { setFeedbackMsg({ type: 'error', text: t(localLang, "browser_no_speech") }); return; }
            const recognition = new WebSpeechRecognition();
            recognition.lang = 'en-US'; recognition.interimResults = true; recognition.maxAlternatives = 1;
            recognition.onstart = () => { setIsRecording(true); setFeedbackMsg({ type: 'info', text: t(localLang, "listening") }); };

            let matched = false;

            recognition.onresult = (event: any) => {
                if (matched) return;
                const target = (deck[index].word).toLowerCase().replace(/[^a-z]/g, '');

                for (let i = 0; i < event.results.length; i++) {
                    const said = event.results[i][0].transcript.toLowerCase().replace(/[^a-z]/g, '');
                    const ok = said === target || said.includes(target) || target.includes(said);
                    if (ok) {
                        matched = true;
                        setFeedbackMsg({ type: 'success', text: `${t(localLang, "perfect")} (${event.results[i][0].transcript})` });
                        playSound('correct');
                        recognition.stop();
                        setIsRecording(false);
                        setTimeout(() => { if (!flipped) setFlipped(true); }, 800);
                        return;
                    }
                }

                const lastIdx = event.results.length - 1;
                if (event.results[lastIdx].isFinal && !matched) {
                    setFeedbackMsg({ type: 'error', text: `${t(localLang, "try_again")} (${event.results[lastIdx][0].transcript})` });
                    playSound('wrong');
                }
            };
            recognition.onerror = () => { if (matched) return; setFeedbackMsg({ type: 'error', text: t(localLang, "try_again") }); playSound('wrong'); };
            recognition.onend = () => setIsRecording(false);
            recognition.start();
        } catch (err) { setIsRecording(false); setFeedbackMsg({ type: 'error', text: t(localLang, "error_occurred") }); }
    };

    const checkMeaningVoice = async () => {
        if (!deck[index]) return;
        try {
            const WebSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!WebSpeechRecognition) { alert("Speech not supported"); return; }
            const recognition = new WebSpeechRecognition();
            
            const LANG_MAP: Record<string, string> = {
                ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tw: 'zh-TW', vi: 'vi-VN'
            };
            recognition.lang = LANG_MAP[localLang] || 'ko-KR';
            
            recognition.onstart = () => { setIsRecording(true); };
            recognition.onresult = (event: any) => {
                const said = event.results[0][0].transcript;
                setUserInput(said);
                handleCheckMeaning(said);
            };
            recognition.onend = () => setIsRecording(false);
            recognition.start();
        } catch (err) { setIsRecording(false); }
    };

    const handleCheckMeaning = (val?: string) => {
        const input = val || userInput;
        if (!input.trim()) return;
        const target = meaning.toLowerCase().replace(/\s/g, '');
        const cleanInput = input.toLowerCase().replace(/\s/g, '');
        const ok = target.includes(cleanInput) || cleanInput.includes(target);
        setIsCheckSuccess(ok);
        playSound(ok ? 'correct' : 'wrong');
        if (ok) { setTimeout(() => setFlipped(true), 600); }
    };

    const handleKnow = () => {
        if (!card) return;
        const wordId = card.word;
        setKnownIds(prev => new Set([...prev, wordId]));
        const remainingNotes = incorrectNotes.filter((n: any) => (getLatestNoteData(n).word) !== wordId);
        setIncorrectNotes(remainingNotes);
        next();
    };

    const handleDeleteWord = () => {
        if (!card) return;
        if (!confirm(t(localLang, 'delete_confirm') || "Remove from list?")) return;
        const wordId = card.word;
        const remainingNotes = incorrectNotes.filter((n: any) => (getLatestNoteData(n).word) !== wordId);
        setIncorrectNotes(remainingNotes);
        const newDeck = deck.filter((w: any) => (w.word) !== wordId);
        if (newDeck.length === 0) setPhase('done');
        else { setDeck(newDeck); if (index >= newDeck.length) setIndex(Math.max(0, newDeck.length - 1)); }
        setFlipped(false); setUserInput(""); setFeedbackMsg(null); playSound('correct');
    };

    if (incorrectNotes.length === 0) return (
        <div className="screen animate-fade-in bg-white flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-20 shrink-0" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 16px)' }}>
                <button onClick={() => setScreen('HOME')}
                    className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm"><X size={20} /></button>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 tracking-tight"><BookOpen size={20} className="text-primary" /> {t(localLang, "review_voca")}</h2>
                <div className="w-10"></div>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-8">
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/10 border border-green-100"><CheckCircle2 size={48} className="text-green-500" /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">{t(localLang, "no_wrong_yet")}</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">{t(localLang, "review_empty_desc")}</p>
            </div>
        </div>
    );

    if (phase === 'done') return (
        <div className="screen animate-fade-in bg-white flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-32 h-32 bg-indigo-50 rounded-[48px] flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/10 border-2 border-indigo-100 animate-bounce"><Trophy size={64} className="text-primary" /></div>
                <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tighter">{t(localLang, "review_finished")}</h2>
                <p className="text-slate-400 font-bold text-sm mb-10">{t(localLang, "total")} <span className="text-primary">{deck.length}</span> {t(localLang, "words_completed")}</p>
                <div className="w-full max-w-xs space-y-3">
                    <button onClick={() => { setPhase('study'); setIndex(0); setFlipped(false); setKnownIds(new Set()); }}
                        className="w-full three-d-btn bg-primary text-white py-5 rounded-[24px] font-black text-lg shadow-[0_6px_0_#3730A3] active:translate-y-1 active:shadow-none transition-all">{t(localLang, "review_again")}</button>
                    <button onClick={() => setScreen('HOME')}
                        className="w-full py-5 rounded-[24px] border-2 border-slate-100 text-slate-500 font-black text-lg hover:bg-slate-50 active:scale-95 transition-all">{t(localLang, "back_to_home")}</button>
                </div>
            </div>
        </div>
    );

    if (!card) return null;

    return (
        <div className="screen animate-fade-in bg-white flex flex-col">
            <header className="px-6 pb-2 border-slate-100 bg-white shadow-sm z-20 shrink-0" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 16px)' }}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setScreen('HOME')}
                        className="bg-slate-100 text-slate-500 rounded-full p-2.5 active:scale-90 transition shadow-sm"><X size={20} /></button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-sm font-black text-primary flex items-center gap-1.5 uppercase tracking-widest leading-none mb-1"><BookOpen size={16} /> {t(localLang, "review_voca")}</h2>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{index + 1} / {deck.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAutoPlaying(p => !p)}
                            className={`rounded-full p-2.5 active:scale-90 transition shadow-sm border ${isAutoPlaying ? 'bg-indigo-500 text-white border-indigo-500 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                        >
                            {isAutoPlaying ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                        </button>
                        <button
                            onClick={generateWeaknessReport}
                            disabled={isAnalyzingWeakness}
                            className={`rounded-full p-2.5 active:scale-90 transition shadow-sm border ${isAnalyzingWeakness ? 'bg-indigo-500 text-white animate-pulse border-indigo-200' : 'bg-indigo-50 text-indigo-500 border-indigo-100 hover:bg-indigo-100'}`}
                        >
                            <Sparkles size={18} />
                        </button>
                        <button onClick={handleDeleteWord}
                            className="bg-red-50 text-red-400 rounded-full p-2.5 active:scale-90 transition shadow-sm border border-red-100"><Trash2 size={18} /></button>
                    </div>
                </div>

                {/* AI Weakness Report Modal */}
                {weaknessReport && (
                    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setWeaknessReport(null); }}>
                        <div className="bg-white w-full max-w-lg rounded-t-[48px] p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto relative">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20"><Sparkles size={24} /></div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{t(localLang, "ai_weakness_report")}</h3>
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">{t(localLang, "analysis_complete")}</p>
                                    </div>
                                </div>
                                <button onClick={() => setWeaknessReport(null)}
                                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"><X size={20} /></button>
                            </div>

                            <div className="space-y-8 pb-12">
                                <section>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">{t(localLang, "weakness_summary")}</label>
                                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 italic font-medium text-slate-600 leading-relaxed">
                                        "{weaknessReport.overall}"
                                    </div>
                                </section>

                                <section>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">{t(localLang, "overcoming_plan")}</label>
                                    <div className="grid gap-3">
                                        {(weaknessReport.roadmap || []).map((step: string, i: number) => (
                                            <div key={i}
                                                className="flex items-start gap-4 p-5 bg-white border-2 border-slate-50 rounded-[28px] shadow-sm">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                                                <p className="text-[13px] font-bold text-slate-700 leading-tight pt-1">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">{t(localLang, "challenge_words")}</label>
                                    <div className="space-y-3">
                                        {(weaknessReport.challengeWords || []).map((cw: any, i: number) => (
                                            <div key={i}
                                                className="flex items-center justify-between p-5 bg-indigo-50/30 rounded-[32px] border border-indigo-100/50">
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-800 italic">{cw.word}</h4>
                                                    <p className="text-[11px] text-slate-500 font-bold">{cw.reason}</p>
                                                </div>
                                                <button onClick={() => playTTS(cw.word)}
                                                    className="p-3 bg-white text-indigo-500 rounded-xl shadow-sm border border-indigo-50"><Volume2 size={16} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-10">
                                <button
                                    onClick={() => setWeaknessReport(null)}
                                    className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
                                >
                                    {t(localLang, "confirm")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isAnalyzingWeakness && (
                    <div className="fixed inset-0 z-[101] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[40px] flex items-center justify-center animate-pulse">
                                <Sparkles size={48} className="text-indigo-500" />
                            </div>
                            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-[40px] animate-spin"></div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">{t(localLang, "ai_weakness_report")}</h3>
                        <p className="text-sm text-slate-400 font-bold tracking-tight animate-pulse">{t(localLang, "generating_report")}</p>
                    </div>
                )}

                {/* Mode Selector Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                    <button
                        onClick={() => setReviewMode('STUDY')}
                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${reviewMode === 'STUDY' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Sparkles size={14} /> {t(localLang, "study_mode")}
                    </button>
                    <button
                        onClick={() => setReviewMode('TEST')}
                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${reviewMode === 'TEST' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <CheckCircle2 size={14} /> {t(localLang, "test_mode")}
                    </button>
                </div>

                {/* Quick Language Switcher */}
                <div className="flex justify-center gap-2 mt-3 mb-1">
                    {[
                        { code: 'ko', img: '/assets/flags/kr.png' },
                        { code: 'en', img: '/assets/flags/us.png' },
                        { code: 'ja', img: '/assets/flags/jp.png' },
                        { code: 'zh', img: '/assets/flags/cn.png' },
                        { code: 'tw', img: '/assets/flags/tw.png' },
                        { code: 'vi', img: '/assets/flags/vn.png' }
                    ].map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setLocalLang(lang.code)}
                            className={`p-1.5 rounded-lg transition-all ${localLang === lang.code ? 'bg-indigo-100/50 scale-[1.15] shadow-md border border-indigo-200' : 'bg-transparent opacity-40 hover:opacity-100 hover:scale-110 border border-transparent grayscale hover:grayscale-0'}`}
                        >
                            <img src={lang.img} alt={lang.code} className="w-6 h-4 object-cover rounded-[2px]" />
                        </button>
                    ))}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-50">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((index + 1) / deck.length) * 100}%` }}></div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col items-center gap-4 pb-[calc(var(--nav-height)+24px)] scrollbar-hide">
                {reviewMode === 'STUDY' ? (
                    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in">
                        {/* Study Mode UI: Big Word Card */}
                        <div className="bg-white rounded-[32px] p-6 shadow-2xl border-2 border-slate-50 flex flex-col items-center text-center relative overflow-hidden min-h-[320px]">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><Vibrate size={120} /></div>

                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">{t(localLang, "step_learn")}</p>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic mb-4 break-all">{card.word}</h1>
                            <button onClick={(e) => { e.stopPropagation(); playTTS(card.word); }}
                                className="p-3 bg-indigo-50 text-indigo-500 hover:bg-indigo-100 rounded-2xl active:scale-90 transition mb-6 cursor-pointer relative z-10"><Volume2 size={32} /></button>

                            <div className="w-full h-px bg-slate-50 mb-6"></div>

                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">{t(localLang, 'meaning_label')}</p>
                            <p className="text-2xl font-black text-slate-800 mb-6 underline decoration-indigo-200 decoration-8 underline-offset-4">{meaning}</p>

                            {(card.usages || [card.usage]).filter(Boolean).length > 0 ? (
                                <div className="bg-indigo-50/30 rounded-2xl p-4 w-full text-left border border-indigo-100/50">
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">📑 {t(localLang, "practical_examples")}</p>
                                    <div className="space-y-4">
                                        {(card.usages || [card.usage]).filter(Boolean).slice(0, 3).map((u: any, idx: number) => {
                                            const isObj = typeof u === 'object';
                                            const en = isObj ? u.en : u;
                                            const tr = isObj ? u.tr || u.translation : null;
                                            const isRevealed = revealedUsages.has(idx);

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        if (tr) {
                                                            const next = new Set(revealedUsages);
                                                            if (next.has(idx)) next.delete(idx);
                                                            else next.add(idx);
                                                            setRevealedUsages(next);
                                                        }
                                                    }}
                                                    className={`flex flex-col gap-2 p-5 bg-white border-2 rounded-[28px] shadow-sm transition-all cursor-pointer active:scale-[0.98] ${isRevealed ? 'border-primary/30 bg-primary/5' : 'border-slate-50'}`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${isRevealed ? 'bg-primary text-white' : 'bg-indigo-100 text-indigo-500'}`}>{idx + 1}</div>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-slate-600 leading-relaxed font-bold italic">"{en}"</p>
                                                            {isRevealed && tr && (
                                                                <p className="text-xs text-primary font-black mt-2 bg-white/50 p-2 rounded-xl animate-fade-in">
                                                                    {tr}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => generateUsages(card.w || card.word)}
                                    disabled={isGeneratingUsages}
                                    className="w-full py-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 text-indigo-500 font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isGeneratingUsages ? (
                                        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : <Sparkles size={16} />}
                                    {isGeneratingUsages ? t(localLang, 'ai_generating_usage') : t(localLang, 'ai_generate_usage_title')}
                                </button>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setIndex(i => Math.max(0, i - 1))}
                                disabled={index === 0}
                                className="flex-1 py-5 rounded-[28px] bg-slate-100 text-slate-400 font-black active:scale-95 disabled:opacity-30 transition">
                                {t(localLang, "prev")}
                            </button>
                            <button onClick={next}
                                className="flex-[2] py-5 rounded-[28px] bg-indigo-500 text-white font-black shadow-xl shadow-indigo-500/25 active:scale-95 transition">
                                {index === deck.length - 1 ? t(localLang, "close") : t(localLang, "next")}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Test Mode UI (Existing/Improved) */
                    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in">
                        <div
                            onClick={() => { if (!flipped && !userInput) { setFlipped(true); playTTS(card.w || card.word); } }}
                            className={`w-full aspect-square rounded-[32px] flex flex-col items-center justify-center text-center shadow-2xl border-2 transition-all duration-500 relative overflow-hidden p-6 ${flipped ? 'bg-white border-primary/20 scale-100' : 'bg-slate-50 border-slate-100 scale-95'}`}
                        >
                            {!flipped ? (
                                <div className="w-full flex flex-col items-center">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">{t(localLang, "test_meaning")}</p>
                                    <h1 className={`font-black text-slate-800 tracking-tighter italic mb-8 break-all px-2 ${(card.word).length > 12 ? 'text-3xl' : 'text-5xl'}`}>
                                        {card.word}
                                    </h1>

                                    <div className="w-full space-y-4" onClick={(e) => e.stopPropagation()}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder={t(localLang, "type_meaning")}
                                                value={userInput}
                                                onChange={(e) => setUserInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleCheckMeaning(); }}
                                                className={`w-full bg-white border-2 py-4 px-6 rounded-2xl font-bold text-center outline-none transition-all ${isCheckSuccess === false ? 'border-red-400 bg-red-50 shake' : isCheckSuccess === true ? 'border-green-400 bg-green-50' : 'border-slate-100 focus:border-primary/30'}`}
                                            />
                                            <button onClick={checkMeaningVoice}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition ${isRecording ? 'text-red-500 animate-pulse bg-red-50' : 'text-slate-300'}`}>
                                                <Mic size={20} />
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleCheckMeaning()}
                                                className="flex-1 bg-primary text-white py-3 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition">{t(localLang, "confirm")}</button>
                                            <button onClick={() => setFlipped(true)}
                                                className="bg-slate-200 text-slate-500 py-3 px-6 rounded-2xl font-black text-xs active:scale-95 transition">{t(localLang, "reveal")}</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-fade-in w-full text-center">
                                    <h2 className="text-xl font-black text-slate-300 mb-2 italic">{card.word}</h2>
                                    <p className="text-4xl font-black text-primary mb-8 underline decoration-primary/10 decoration-8 underline-offset-8">{meaning}</p>

                                    <div className="flex items-center justify-center gap-3 w-full">
                                        <button onClick={(e) => { e.stopPropagation(); playTTS(card.word); }}
                                            className="flex-1 flex justify-center items-center gap-2 px-4 py-4 rounded-3xl font-black text-sm transition-all border-2 bg-slate-50 text-slate-600 border-slate-100 active:bg-slate-100">
                                            <Volume2 size={20} /> {localLang === 'ko' ? '발음 듣기' : t(localLang, "voice_check")?.replace('확인', '듣기') || 'Listen'}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); checkPronunciation(); }}
                                            className={`flex-[1.2] flex justify-center items-center gap-2 px-4 py-4 rounded-3xl font-black text-sm transition-all border-2 ${isRecording ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-indigo-50 text-indigo-600 border-indigo-100 active:bg-indigo-100'}`}>
                                            <Mic size={20} /> {isRecording ? t(localLang, "listening") : t(localLang, "voice_check")}
                                        </button>
                                    </div>

                                    {feedbackMsg && <div className="mt-4 font-black text-xs text-primary">{feedbackMsg.text}</div>}
                                </div>
                            )}
                        </div>

                        {flipped ? (
                            <div className="flex gap-4 animate-slide-up">
                                <button onClick={next}
                                    className="flex-1 py-4 rounded-[24px] bg-white border-2 border-red-100 text-red-500 font-black flex flex-col items-center gap-1">
                                    <RefreshCcw size={20} />
                                    <span className="text-[9px] uppercase tracking-widest">{t(localLang, "one_more")}</span>
                                </button>
                                <button onClick={handleKnow}
                                    className="flex-1 py-4 rounded-[24px] bg-slate-800 text-white font-black flex flex-col items-center gap-1 shadow-xl">
                                    <CheckCircle2 size={20} />
                                    <span className="text-[9px] uppercase tracking-widest">{t(localLang, "got_it")}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4 text-center">
                                <button onClick={() => setIndex(i => Math.max(0, i - 1))}
                                    disabled={index === 0}
                                    className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black disabled:opacity-30"><ChevronLeft size={20} /></button>
                                <button onClick={() => { setFlipped(true); playTTS(card.w); }}
                                    className="flex-[3] py-4 bg-primary text-white rounded-2xl font-black shadow-lg">{t(localLang, "reveal")}</button>
                                <button onClick={() => setIndex(i => Math.min(deck.length - 1, i + 1))}
                                    disabled={index === deck.length - 1}
                                    className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black disabled:opacity-30"><ChevronRight size={20} /></button>
                            </div>
                        )}
                    </div>
                )}

                <PcAdSlot variant="horizontal" className="w-full max-w-sm mt-4" />
            </div>
        </div>
    );
};
