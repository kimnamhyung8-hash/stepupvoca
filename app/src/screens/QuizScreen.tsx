
import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle2,
    ShieldCheck,
    Volume2,
    Play,
    Heart,
    Video,
    X
} from 'lucide-react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { t, getVocaOptions } from '../i18n';
import { playSound } from '../utils/soundUtils';
import { showRewardedInterstitialAd } from '../admob';
import confetti from 'canvas-confetti';

interface QuizScreenProps {
    settings: any;
    setScreen: (s: string) => void;
    currentLevel: number;
    setCurrentLevel: (l: number) => void;
    setUserPoints: (p: any) => void;
    setIncorrectNotes: (n: any) => void;
    userInfo: any;
    equippedSkin: string;
    onActivityDone: () => void;
    triggerReview: () => void;
    vocaDB: any[];
    setCorrectCount: (n: number) => void;
    setTotalQuestions: (n: number) => void;
    setTimeTaken: (n: number) => void;
    setRecordedVideoUrl: (url: string | null) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
    settings,
    setScreen,
    setUserPoints,
    setIncorrectNotes,
    onActivityDone,
    triggerReview,
    vocaDB,
    currentLevel,
    setCorrectCount,
    setTotalQuestions,
    setTimeTaken,
    setRecordedVideoUrl
}) => {
    // Phase Management — start at RECORD_CONSENT only if recording is supported
    const isRecordingSupported = typeof MediaRecorder !== 'undefined' &&
        (MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
         MediaRecorder.isTypeSupported('video/webm') ||
         MediaRecorder.isTypeSupported('video/mp4'));
    const [phase, setPhase] = useState<'RECORD_CONSENT' | 'QUIZ' | 'FAILED' | 'COMPLETED'>(
        isRecordingSupported ? 'RECORD_CONSENT' : 'QUIZ'
    );
    
    // Quiz State
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(1);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds per question
    const [totalTime, setTotalTime] = useState(0);
    const timerRef = useRef<any>(null);
    const currentIdxRef = useRef(currentIdx);
    const timeLeftRef = useRef(timeLeft);
    const phaseRef = useRef(phase);
    const isWrongRef = useRef(false);
    const [isWrong, setIsWrong] = useState(false);

    useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    useEffect(() => { isWrongRef.current = isWrong; }, [isWrong]);

    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number | undefined>(undefined);

    const lang = settings.lang || 'ko';

    // Composition Loop (Draw UI + Camera to hidden canvas for recording)
    const startCanvasRecording = (stream: MediaStream) => {
        const canvas = canvasRef.current;
        const video = videoPreviewRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Ensure video is playing and has data before we start drawing
        const playReadyPromise = new Promise((resolve) => {
            if (video.readyState >= 3) resolve(true);
            else video.onplaying = () => resolve(true);
        });

        playReadyPromise.then(() => {
            const draw = () => {
                // Keep the loop alive regardless of phase to prevent the stream from dying
                requestRef.current = requestAnimationFrame(draw);

                if (phaseRef.current !== 'QUIZ') {
                    // Just clear or draw a black screen/placeholder while not in QUIZ phase
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    return;
                }

                // 1. Draw Camera (Background)
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 2. Overlay Quiz UI
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.fillRect(0, 0, canvas.width, 100);

                const currentWord = questions[currentIdxRef.current]?.word || "";
                ctx.fillStyle = '#FFFFFF';
                // Adjusting font size and handling undefined
                ctx.font = 'bold 48px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(currentWord, canvas.width / 2, 50);

                // Progress Bar
                const progress = ((currentIdxRef.current + 1) / (questions.length || 1)) * canvas.width;
                ctx.fillStyle = '#4F46E5';
                ctx.fillRect(0, 95, progress, 5);

                // Timer Bar (Bottom)
                const timePercent = (timeLeftRef.current / 10) * canvas.width;
                ctx.fillStyle = '#F59E0B';
                ctx.fillRect(0, canvas.height - 8, timePercent, 8);

                // 3. Emergency Warning Light (Red Flash)
                if (isWrongRef.current) {
                    const flash = Math.sin(Date.now() / 150) > 0;
                    if (flash) {
                        ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        // Red Border
                        ctx.strokeStyle = '#FF0000';
                        ctx.lineWidth = 40;
                        ctx.strokeRect(0, 0, canvas.width, canvas.height);

                        // Draw Correct Answer text prominently on Canvas
                        const q = questions[currentIdxRef.current];
                        const correctAnswer = q?.options[q?.answer_index] || "";
                        
                        ctx.fillStyle = '#FFFFFF';
                        ctx.font = 'bold 36px sans-serif';
                        ctx.fillText('정답:', canvas.width / 2, 140);
                        
                        ctx.fillStyle = '#FFEB3B'; // Bright Yellow
                        ctx.font = 'black 52px sans-serif';
                        ctx.fillText(correctAnswer, canvas.width / 2, 200);
                    }
                }
            };
            draw();

            const canvasStream = canvas.captureStream(30);
            const combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                ...stream.getAudioTracks()
            ]);

            // VP8 is generally better for webm compatibility across browsers
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
                ? 'video/webm;codecs=vp8'
                : MediaRecorder.isTypeSupported('video/webm')
                    ? 'video/webm'
                    : MediaRecorder.isTypeSupported('video/mp4')
                        ? 'video/mp4'
                        : '';
            const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                // Use the actual encoded format, not a hardcoded type
                const actualMime = recorder.mimeType || mimeType || 'video/webm';
                const blobType = actualMime.split(';')[0]; // strip codecs suffix for Blob
                const blob = new Blob(chunksRef.current, { type: blobType });
                const url = URL.createObjectURL(blob);
                setRecordedVideoUrl(url);
            };

            recorder.start(1000); // Pulse data every 1s
        });
    };

    // Camera & Recording Logic
    const startCamera = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: 640, height: 480 }, 
                audio: true 
            });
            setCameraStream(userStream);
            
            // Allow time for video element to mount/load srcObject
            setTimeout(() => {
                startCanvasRecording(userStream);
            }, 500);
            
        } catch (err) {
            console.error("Recording access failed:", err);
            alert(t(lang, 'camera_access_denied') || "Camera access required for recording.");
        }
    };

    const stopCamera = () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Set video srcObject when stream is available
    useEffect(() => {
        if (cameraStream && videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = cameraStream;
        }
    }, [cameraStream, phase]);

    // Load questions from vocaDB
    useEffect(() => {
        if (!vocaDB || vocaDB.length === 0) return;
        
        const levelData = vocaDB.find((l: any) => parseInt(l.level) === currentLevel);
        if (levelData && levelData.words && levelData.words.length > 0) {
            // Pick 20 unique words from this level
            import('../utils/wordUtils').then(({ pickUniqueWords, markWordsAsSeen }) => {
                const selected = pickUniqueWords(levelData.words, 20);
                setQuestions(selected);
                // Mark these as seen so other games prioritize others
                if (selected.length > 0) {
                    markWordsAsSeen(selected.map((w: any) => w.word));
                }
            });
        } else {
            // Fallback for empty levels
            setQuestions([
                { id: '1', word: 'from', meaning: 'origin', answer_index: 0, options: ['origin', 'he', 'they', 'there'] }
            ]);
        }

        return () => stopCamera();
    }, [vocaDB, currentLevel]);

    // Timer Logic
    useEffect(() => {
        if (phase === 'QUIZ' && !isAnswered && !isCompleted) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0.1) {
                        clearInterval(timerRef.current);
                        handleFail();
                        return 0;
                    }
                    return parseFloat((prev - 0.1).toFixed(1));
                });
                setTotalTime(t => t + 0.1);
            }, 100);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [phase, isAnswered, currentIdx, phase === 'COMPLETED']);

    const handleFail = () => {
        setIsWrong(true);
        setTimeout(() => setIsWrong(false), 1500);

        if (lives > 0) {
            setLives(prev => prev - 1);
            if (settings.sfx) playSound('wrong');
            setIsAnswered(true); // Treat as answered to show correct answer feedback
            setTimeout(() => {
                goToNextQuestion();
            }, 1500);
        } else {
            stopCamera();
            setPhase('FAILED');
            if (settings.sfx) playSound('wrong');
        }
    };

    const goToNextQuestion = () => {
        if (currentIdx + 1 >= questions.length) {
            stopCamera();
            // Handle final score carefully to avoid double-increment state race
            // score state was already updated in handleSelect or handleFail
            setScore(finalScore => {
                setCorrectCount(finalScore);
                setUserPoints((prev: number) => prev + finalScore * 10);
                return finalScore;
            });
            
            setTotalQuestions(questions.length);
            setTimeTaken(totalTime);
            
            if (settings.sfx) playSound('correct');
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4F46E5', '#8B5CF6', '#F59E0B']
            });
            
            setPhase('COMPLETED');
            onActivityDone();
        } else {
            setCurrentIdx(prev => prev + 1);
            setSelectedIdx(null);
            setIsAnswered(false);
            setIsWrong(false); // Ensure wrong state is cleared
            setTimeLeft(10);
        }
    };

    const handleSelect = (idx: number) => {
        if (isAnswered || phase !== 'QUIZ') return;
        setSelectedIdx(idx);
        setIsAnswered(true);

        const correct = idx === questions[currentIdx].answer_index;
        console.log(`[Quiz] Question ${currentIdx + 1}: selected=${idx}, correct=${questions[currentIdx].answer_index}, result=${correct}`);

        if (correct) {
            if (settings.sfx) playSound('correct');
            // Only increment score here if it's not the last question, 
            // or let goToNextQuestion handle the final count.
            // Actually, incrementing here is fine as long as goToNextQuestion doesn't add it again.
            setScore(prev => prev + 1);
            setTimeout(() => {
                goToNextQuestion();
            }, 800);
        } else {
            setIncorrectNotes((prev: any) => [...prev, questions[currentIdx]]);
            setIsWrong(true);
            if (settings.sfx) playSound('wrong');
            
            setTimeout(() => {
                setIsWrong(false);
                if (lives > 0) {
                    setLives(prev => prev - 1);
                    goToNextQuestion();
                } else {
                    handleFail();
                }
            }, 1500);
        }
    };

    const handleAudio = async () => {
        if (!q?.word) return;
        try {
            await TextToSpeech.speak({
                text: q.word,
                lang: 'en-US',
                rate: 0.9,
                pitch: 1.0,
                volume: 1.0,
                category: 'ambient'
            });
        } catch (e) {
            console.warn("TTS Error:", e);
        }
    };

    const handleReviveWithAd = async () => {
        const success = await showRewardedInterstitialAd();
        if (success) {
            setPhase('QUIZ');
            setTimeLeft(10);
            setIsAnswered(false);
            setSelectedIdx(null);
        }
    };

    const isCompleted = phase === 'COMPLETED';

    // ───── Phase 1: RECORD_CONSENT ─────
    if (phase === 'RECORD_CONSENT') {
        return (
            <div className="screen bg-black flex flex-col items-center justify-center p-8 text-white font-sans animate-fade-in">
                <button 
                    onClick={() => setScreen('MASTERY')}
                    className="absolute left-6 bg-white/10 text-white/50 rounded-full p-2.5 active:scale-90 transition backdrop-blur-md border border-white/10 z-50"
                    style={{ top: 'calc(max(env(safe-area-inset-top), 20px) + 16px)' }}
                >
                    <X size={20} />
                </button>

                <div className="bg-[#1C1C1E] rounded-[48px] p-10 w-full max-w-sm flex flex-col items-center shadow-2xl border border-white/5 relative overflow-hidden">
                    <div className="w-24 h-24 bg-[#2C2C2E] rounded-full flex items-center justify-center mb-10 shadow-inner group">
                        <Video size={48} className="text-[#FF6B35] group-hover:scale-110 transition-transform" />
                    </div>
                    
                    <h2 className="text-[28px] font-black leading-tight text-center mb-4 tracking-tight">
                        {t(lang, 'start_record_title')}
                    </h2>
                    <p className="text-[#8E8E93] text-center text-[15px] font-medium leading-relaxed mb-12 whitespace-pre-wrap">
                        {t(lang, 'start_record_desc')}
                    </p>

                    <div className="w-full space-y-4">
                        <button
                            onClick={() => {
                                setPhase('QUIZ');
                                startCamera();
                            }}
                            className="w-full bg-[#FF6B35] py-5 rounded-[24px] text-white font-black text-lg shadow-xl shadow-orange-500/20 active:scale-95 transition-all text-center"
                        >
                            {t(lang, 'yes_record')}
                        </button>
                        <button
                            onClick={() => setPhase('QUIZ')}
                            className="w-full bg-[#2C2C2E] py-5 rounded-[24px] text-white/50 font-black text-lg active:scale-95 transition-all hover:text-white/80 text-center"
                        >
                            {t(lang, 'no_thanks')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ───── Phase 2: FAILED ─────
    if (phase === 'FAILED') {
        return (
            <div className="screen bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 z-50 font-sans">
                <button 
                    onClick={() => setScreen('MASTERY')}
                    className="absolute left-6 bg-white/10 text-white/50 rounded-full p-2.5 active:scale-90 transition backdrop-blur-md border border-white/10 z-[60]"
                    style={{ top: 'calc(max(env(safe-area-inset-top), 20px) + 16px)' }}
                >
                    <X size={20} />
                </button>
                <div className="bg-white rounded-[40px] p-10 w-full max-w-sm flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-scale-up">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                        <Heart size={40} className="text-rose-500 fill-rose-500" />
                        <div className="absolute w-20 h-0.5 bg-rose-500 rotate-45"></div>
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-800 mb-3 text-center">{t(lang, 'fail_title')}</h2>
                    <p className="text-slate-400 font-bold mb-10 text-center leading-relaxed">{t(lang, 'fail_desc')}</p>

                    <div className="w-full space-y-4">
                        <button
                            onClick={handleReviveWithAd}
                            className="w-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] py-5 rounded-[24px] text-white font-black text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
                        >
                            <Play size={20} fill="white" />
                            {t(lang, 'revive')}
                        </button>
                        <button
                            onClick={() => setScreen('MASTERY')}
                            className="w-full bg-white border-2 border-slate-100 py-5 rounded-[24px] text-slate-500 font-black text-lg active:scale-95 transition-all text-center"
                        >
                            {t(lang, 'quit_eval')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ───── Phase 3 is rendered as an overlay to prevent camera teardown flicker ─────

    if (questions.length === 0) return null;

    const q = questions[currentIdx];
    const progress = ((currentIdx + 1) / questions.length) * 100;
    const timeProgress = (timeLeft / 10) * 100;

    return (
        <div className="screen bg-[#0F172A] flex flex-col min-h-screen font-sans text-white overflow-hidden relative">
            <header className="flex items-center justify-between px-6 pb-2 z-30 shrink-0" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 16px)' }}>
                <div className="flex items-center gap-2">
                    <button onClick={() => setScreen('MASTERY')}
                     className="bg-white/10 text-white/50 rounded-full p-2.5 active:scale-90 transition backdrop-blur-md border border-white/10"><X size={20} /></button>
                    {/* Life Display */}
                    <div className="flex gap-1 ml-1 scale-90">
                        <Heart size={20} className={`${lives > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`} />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-[#4F46E5] uppercase tracking-[0.2em] mb-0.5">{t(lang, "level_quiz").replace('{n}', currentLevel.toString())}</span>
                    <span className="text-sm font-black text-white">{currentIdx + 1} / {questions.length}</span>
                </div>
                <div className="w-10" />
            </header>

            {/* Header / Progress Section */}
            <div className="px-6 pt-2 pb-4 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2 flex-1 max-w-[70%]">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">{t(lang, 'level_progress')}</span>
                            <span className="text-[13px] font-black text-white">{currentIdx + 1} <span className="text-slate-500">/ {questions.length}</span></span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-[#059669]/20 border border-[#059669]/30 px-3 py-1.5 rounded-full shadow-lg">
                        <ShieldCheck size={12} className="text-[#10B981]" />
                        <span className="text-[9px] font-black text-[#10B981] tracking-tighter uppercase">ANTI-CHEAT</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest italic">{t(lang, 'time_remaining')}</span>
                        <span className="text-[13px] font-black text-orange-400 tabular-nums">{timeLeft.toFixed(1)}s</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-100" style={{ width: `${timeProgress}%` }} />
                    </div>
                </div>
            </div>

            {/* Central Content Area */}
            <div className="flex-1 px-6 flex flex-col items-center justify-start pt-6">
                <div className="relative mb-6">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-8xl shadow-2xl shadow-indigo-500/20 border-4 border-[#1E293B] overflow-hidden relative">
                        {phase === 'QUIZ' && cameraStream && (
                            <video
                                ref={videoPreviewRef}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                            />
                        )}
                        {(!cameraStream || phase !== 'QUIZ') && (
                            <span className="animate-float">
                                🐣
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={handleAudio}
                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#1E293B] rounded-2xl flex items-center justify-center text-white border border-slate-700 shadow-xl active:scale-90 transition-all z-10"
                    >
                        <Volume2 size={24} />
                    </button>
                    {phase === 'QUIZ' && cameraStream && (
                        <div className="absolute -top-1 -left-1 flex items-center gap-1 bg-red-500 px-2 py-0.5 rounded-full shadow-lg z-10">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">REC</span>
                        </div>
                    )}
                </div>

                <h1 className="text-6xl font-black text-white tracking-tighter mb-10 text-center drop-shadow-md leading-tight">
                    {q.word}
                </h1>

                {/* Question Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                    {getVocaOptions(q, lang).map((option: string, idx: number) => {
                        let btnClass = "w-full p-6 rounded-[32px] font-black text-lg transition-all border shadow-lg flex items-center justify-center text-center leading-tight h-[84px] ";
                        if (isAnswered) {
                            if (idx === q.answer_index) {
                                btnClass += "bg-[#10B981] border-[#10B981] text-white shadow-emerald-500/20 scale-[1.02] ";
                            } else if (idx === selectedIdx) {
                                btnClass += "bg-rose-500 border-rose-500 text-white shadow-rose-500/20 ";
                            } else {
                                btnClass += "bg-[#1E293B] border-transparent text-slate-600 opacity-40 ";
                            }
                        } else {
                            btnClass += "bg-[#1E293B] border-slate-800 text-white hover:border-indigo-500/50 hover:bg-[#2D3748] active:scale-95 shadow-indigo-500/5 ";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={isAnswered}
                                className={btnClass}
                            >
                                {option}
                                {isAnswered && idx === q.answer_index && <CheckCircle2 size={18} className="ml-2 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer decoration */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none" />

            {/* Invisible Recording Canvas (not display:none to keep rendering active) */}
            <canvas 
                ref={canvasRef} 
                width={640} 
                height={480} 
                style={{ position: 'fixed', left: '-2000px', opacity: 0, pointerEvents: 'none' }}
            />

            {/* Warning Overlay (JSX) */}
            {isWrong && (
                <div className="fixed inset-0 pointer-events-none z-[9999] flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-red-600/30 animate-pulse border-[30px] border-red-600/50" />
                    <div className="bg-white/95 backdrop-blur-xl px-10 py-6 rounded-[40px] shadow-2xl border-4 border-red-500 animate-bounce flex flex-col items-center gap-2">
                        <span className="text-red-500 font-black text-xs uppercase tracking-widest">{t(lang, 'wrong_answer')}</span>
                        <span className="text-slate-900 font-black text-4xl leading-tight">
                            {questions[currentIdx]?.options[questions[currentIdx]?.answer_index]}
                        </span>
                    </div>
                </div>
            )}

            {/* ───── Phase 3: COMPLETED (Overlay) ───── */}
            {isCompleted && (
                <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-8 text-white font-sans overflow-hidden animate-slide-up">
                    <div className="relative">
                        <div className="w-32 h-32 bg-amber-400 rounded-[48px] flex items-center justify-center text-6xl shadow-2xl shadow-amber-500/40 animate-bounce">🏆</div>
                        <div className="absolute -top-4 -right-4 bg-white text-slate-900 w-12 h-12 rounded-full flex items-center justify-center font-black shadow-lg border-4 border-amber-400">
                            +{score * 10}
                        </div>
                    </div>
                    
                    <div className="text-center mt-10 space-y-2">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-tight">{t(lang, 'perfect')}</h2>
                        <p className="text-slate-400 font-bold text-lg">{t(lang, 'words_completed', { n: questions.length })}</p>
                    </div>

                    <div className="w-full max-w-xs mt-12 space-y-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex justify-between items-center">
                            <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">{t(lang, 'correct_answers')}</span>
                            <span className="text-2xl font-black text-amber-400">{score} / {questions.length}</span>
                        </div>
                    </div>

                    <button
                        onClick={async () => {
                            await import('../admob').then(m => m.showAdIfFree());
                            triggerReview();
                            setScreen('EVAL');
                        }}
                        className="w-full max-w-sm mt-12 bg-[#4F46E5] py-6 rounded-[32px] text-white font-black text-xl shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all text-center"
                    >
                        {t(lang, 'view_results')}
                    </button>
                </div>
            )}
        </div>
    );
};
