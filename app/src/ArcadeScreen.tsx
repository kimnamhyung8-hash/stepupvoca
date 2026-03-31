import { useState, useEffect, useRef } from 'react';
import { pauseMainBGM } from './bgm';
import { X, Coins, Heart, Clock, Award, Swords, Flame, ChevronLeft } from 'lucide-react';
import { t, getVocaMeaning, getVocaOptions } from './i18n';
import { pickUniqueWords, markWordsAsSeen } from './utils/wordUtils';

const getStageWords = (stage: number, db: any) => {
    try {
        const minLevel = (stage - 1) * 6 + 1;
        const maxLevel = Math.min(stage * 6, 334);
        const words: any[] = [];

        // Determine the actual array structure
        let dbArray: any[] = [];
        if (Array.isArray(db)) {
            dbArray = db;
        } else if (db && Array.isArray(db.default)) {
            dbArray = db.default;
        } else if (db && typeof db === 'object') {
            // If it's an object where keys are indices
            dbArray = Object.values(db).filter(v => v && typeof v === 'object');
        }

        if (!dbArray || dbArray.length === 0) {
            console.warn("[Arcade] vocaDB is empty or invalid format", typeof db);
            return [];
        }

        for (const levelData of dbArray) {
            if (!levelData || typeof levelData !== 'object') continue;
            const lvl = parseInt(levelData.level);
            if (isNaN(lvl)) continue;

            if (lvl >= minLevel && lvl <= maxLevel && Array.isArray(levelData.words)) {
                levelData.words.forEach((w: any) => {
                    if (w && w.word) {
                        words.push({
                            ...w,
                            level: levelData.level
                        });
                    }
                });
            }
            if (lvl > maxLevel) break;
        }

        if (words.length === 0) {
            console.warn(`[Arcade] No words found for stage ${stage} (Levels ${minLevel}-${maxLevel})`);
            return [];
        }

        const unique = pickUniqueWords(words, 30);
        
        // Mark as seen
        if (unique.length > 0) {
            markWordsAsSeen(unique.map((w: any) => w.word));
        }

        return unique;
    } catch (e) {
        console.error("[Arcade] getStageWords Error:", e);
        return [];
    }
};

const safeVibrate = (pattern: number | number[]) => {
    try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    } catch (e) {
        // Silently fail for non-native environments
    }
};

const ARCADE_STYLES = `
  .perspective-1000 { perspective: 1000px; }
  .perspective-1500 { perspective: 1500px; }
  .transform-style-3d { transform-style: preserve-3d; }
  
  @keyframes float-hologram {
    0%, 100% { transform: translateY(0) rotateX(10deg) rotateY(-5deg); filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5)); }
    50% { transform: translateY(-20px) rotateX(15deg) rotateY(5deg); filter: drop-shadow(0 40px 50px rgba(0,0,0,0.4)); }
  }
  @keyframes bridge-build {
    0% { transform: translate3d(300px, -500px, -800px) rotateX(180deg) rotateY(180deg) scale(0); opacity: 0; }
    100% { transform: translate3d(0, 0, 0) rotateX(70deg) rotateY(0) scale(1); opacity: 1; }
  }
  .water-texture {
    background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2), rgba(255,255,255,0) 60%), linear-gradient(0deg, #0284c7, #082f49);
    background-size: 100px 100px, 100% 100%;
    animation: flow-water 10s linear infinite;
  }
  @keyframes flow-water {
    0% { background-position: 0 0, 0 0; }
    100% { background-position: 200px 200px, 0 0; }
  }
  @keyframes title-glow {
    0%, 100% { text-shadow: 0 0 20px rgba(56, 189, 248, 0.8), 0 5px 0px #0369a1, 0 10px 15px rgba(0,0,0,0.5); transform: translateZ(50px) rotateX(10deg); }
    50% { text-shadow: 0 0 50px rgba(56, 189, 248, 1), 0 5px 0px #0369a1, 0 20px 25px rgba(0,0,0,0.5); transform: translateZ(70px) rotateX(15deg); }
  }

  /* RPG Monster Battle Animations */
  @keyframes monster-idle {
    0%, 100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5)); }
    50% { transform: translateY(-15px) scale(1.02); filter: drop-shadow(0 30px 40px rgba(0,0,0,0.3)); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-20px) rotate(-3deg); }
    30% { transform: translateX(20px) rotate(3deg); }
    45% { transform: translateX(-20px) rotate(-3deg); }
    60% { transform: translateX(20px) rotate(3deg); }
    75% { transform: translateX(-15px) rotate(-2deg); }
    90% { transform: translateX(15px) rotate(2deg); }
  }
  @keyframes flash-red {
    0% { background-color: rgba(239,68,68,0.7); opacity: 1; }
    100% { background-color: transparent; opacity: 0; }
  }
  @keyframes flash-white {
    0%, 100% { filter: none; transform: scale(1); }
    50% { filter: brightness(3) contrast(1.5) hue-rotate(90deg); transform: scale(0.9); }
  }
  @keyframes magic-cast {
    0% { transform: translateY(100px) scale(0.5); opacity: 0; filter: blur(5px); }
    20% { opacity: 1; transform: translateY(-50px) scale(1.5); filter: blur(0px) brightness(2) drop-shadow(0 0 50px #38bdf8); }
    50% { transform: translateY(-150px) scale(2); filter: brightness(3) drop-shadow(0 0 100px #38bdf8); opacity: 1; }
    100% { transform: translateY(-300px) scale(0.2); opacity: 0; filter: blur(10px); }
  }
  @keyframes attack-lunge {
    0%, 100% { transform: translateY(0) scale(1); filter: none; }
    30% { transform: translateY(50px) scale(1.3); filter: drop-shadow(0 0 100px red); }
    50% { transform: translateY(150px) scale(1.8); filter: drop-shadow(0 0 150px red) brightness(0.5) contrast(2); }
  }
  @keyframes dead-dissolve {
    0% { transform: scale(1); filter: blur(0); opacity: 1; }
    100% { transform: scale(1.5) translateY(-100px); filter: blur(20px); opacity: 0; }
  }
  @keyframes pop-in {
    0% { transform: scale(0) translateY(-100px); opacity: 0; filter: blur(20px); }
    70% { transform: scale(1.1) translateY(20px); opacity: 1; filter: blur(2px); }
    100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
  }
`;

export function ArcadeScreen({ settings, setScreen, userPoints, setUserPoints, onActivityDone, vocaDB, playSound }: any) {
    const lang = settings?.lang || 'ko';
    const [gameState, setGameState] = useState<'MENU' | 'GAME1' | 'GAME2' | 'RESULT'>('MENU');
    const [score, setScore] = useState(0);
    const [wrongNotes, setWrongNotes] = useState<{ word: string, meaning: string }[]>([]);

    useEffect(() => {
        pauseMainBGM();
    }, []);

    const handleGameEnd = (finalScore: number, wrongSelections: { word: string, meaning: string }[]) => {
        setScore(finalScore);
        setWrongNotes(wrongSelections);
        setGameState('RESULT');
    };

    const handleRewardPoints = () => {
        const earnedPoints = Math.floor(score / 10);
        setUserPoints((prev: number) => prev + earnedPoints);
        if (onActivityDone) onActivityDone();
        setScreen('HOME');
    };

    return (
        <div className="screen bg-slate-900 overflow-hidden flex flex-col font-sans">
            <style>{ARCADE_STYLES}</style>

            {/* Top Bar Navigation */}
            <header className="flex items-center justify-between p-5 pb-3 absolute top-0 w-full z-50">
                <button onClick={() => setScreen('HOME')}
 className="bg-black/40 backdrop-blur-md text-white/80 rounded-full p-2.5 active:scale-90 transition-transform border border-white/10"><X size={20} /></button>
                <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30 shadow-lg">
                    <Coins size={16} className="text-yellow-400" />
                    <span className="text-sm font-black text-yellow-400 drop-shadow-md">{userPoints?.toLocaleString() || 0}</span>
                </div>
            </header>

            {gameState === 'MENU' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 w-full max-w-md mx-auto relative z-10 text-center perspective-1500">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-cyan-950 -z-10"></div>
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[150%] h-[60%] bg-gradient-to-b from-teal-400/30 via-purple-500/20 to-transparent blur-[80px] -z-10"></div>

                    <div className="mb-6 transform-style-3d">
                        <h1 className="text-6xl font-black text-cyan-50 italic tracking-tighter mb-4 animate-[title-glow_4s_infinite] uppercase">{t(lang, 'defender_title') || 'WORD DEFENDER'}</h1>
                        <p className="text-teal-200 text-sm font-bold uppercase tracking-widest drop-shadow-md transform translateZ(20px)">{t(lang, 'arcade_select_adventure')}</p>
                    </div>

                    <div className="w-full space-y-6 transform-style-3d">
                        <button
                            onClick={() => { setGameState('GAME1'); }}
                            className="w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-rose-900 p-8 rounded-[40px] shadow-[0_15px_0_#312e81,0_25px_30px_rgba(0,0,0,0.6)] active:translate-y-4 active:shadow-[0_0px_0_#312e81,0_0px_0px_rgba(0,0,0,0.6)] transition-all text-left relative overflow-hidden group border-2 border-indigo-400/30 transform hover:scale-[1.02] hover:rotateX-[5deg]"
                        >
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMjBMMDAgMEwyMCAweiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
                            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/40 transition-colors"></div>
                            <div className="flex justify-between items-center relative z-10">
                                <div className="pr-4">
                                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg mb-1 break-keep">{t(lang, 'monster_battle_title') || "보카 몬스터 토벌전"}</h3>
                                    <p className="text-purple-300 font-bold text-sm tracking-widest uppercase">{t(lang, 'monster_battle_desc') || "타이밍 RPG 마법 전투"}</p>
                                </div>
                                <div className="text-7xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] transform group-hover:scale-110 group-hover:rotate-12 transition-transform">🐉</div>
                            </div>
                        </button>

                        <button
                            onClick={() => { setGameState('GAME2'); }}
                            className="w-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-8 rounded-[40px] shadow-[0_15px_0_#064e3b,0_25px_30px_rgba(0,0,0,0.6)] active:translate-y-4 active:shadow-[0_0px_0_#064e3b,0_0px_0px_rgba(0,0,0,0.6)] transition-all text-left relative overflow-hidden group border-2 border-emerald-400/30 transform hover:scale-[1.02] hover:rotateX-[-5deg]"
                        >
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgMjBMMDAgMEwyMCAweiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA1KSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-300/30 transition-colors"></div>

                            <div className="flex justify-between items-center relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg mb-1">{t(lang, 'bridge_crossing_title') || "징검다리 건너기"}</h3>
                                    <p className="text-emerald-200 font-bold text-sm tracking-widest uppercase">{t(lang, 'bridge_crossing_desc') || "3D 단어 매칭"}</p>
                                </div>
                                <div className="text-7xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform">🌉</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'GAME1' && <Game1MonsterBattle settings={settings} onEnd={handleGameEnd} setGameState={setGameState} vocaDB={vocaDB} playSound={playSound} />}
            {gameState === 'GAME2' && <Game2Bridge settings={settings} onEnd={handleGameEnd} setGameState={setGameState} vocaDB={vocaDB} playSound={playSound} />}

            {gameState === 'RESULT' && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in relative z-20 overflow-hidden perspective-1500 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-black/95"></div>

                    <div className="relative w-full max-w-sm transform-style-3d animate-[float-hologram_4s_ease-in-out_infinite] bg-white/5 backdrop-blur-2xl border border-white/20 p-8 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.8),inset_0_2px_15px_rgba(255,255,255,0.2)]">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.6)] border-[6px] border-slate-900 transform translateZ(50px)">
                            <Award size={40} className="text-white drop-shadow-md" />
                        </div>
                        <h2 className="text-5xl font-black mt-8 mb-2 tracking-tighter drop-shadow-lg transform translateZ(30px) text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white uppercase">{t(lang, 'result_title') || 'RESULT'}</h2>

                        <div className="bg-black/50 rounded-3xl p-5 mb-6 transform translateZ(20px) border border-white/10 shadow-inner backdrop-blur-md flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-indigo-300 font-black uppercase tracking-widest text-xs">{t(lang, 'game_score') || "Game Score"}</span>
                                <span className="text-3xl font-black italic text-cyan-50">{score}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gradient-to-r from-yellow-500/20 to-orange-500/10 -mx-2 px-3 py-3 rounded-2xl border border-yellow-500/30">
                                <span className="text-yellow-500 font-black uppercase tracking-widest text-xs">{t(lang, 'points_earned') || "Points Earned"}</span>
                                <span className="text-3xl text-yellow-400 font-black flex items-center gap-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"><Coins size={24} /> +{Math.floor(score / 10)}</span>
                            </div>
                        </div>

                        {wrongNotes.length > 0 && (
                            <div className="w-full h-40 overflow-y-auto mb-6 bg-red-950/40 rounded-3xl p-4 border border-red-500/30 transform translateZ(40px) backdrop-blur-md text-left shadow-[inset_0_5px_20px_rgba(0,0,0,0.5)]" style={{ scrollbarWidth: 'none' }}>
                                <h3 className="text-xs font-black text-red-400 uppercase tracking-widest sticky top-0 bg-red-950/90 py-1 mb-2 z-10 border-b border-red-500/20">{t(lang, 'wrong_review') || "오답 3D Review"}</h3>
                                <div className="space-y-3">
                                    {wrongNotes.map((wn, idx) => (
                                        <div key={idx}
 className="bg-black/40 p-3 rounded-2xl border border-white/10 flex flex-col hover:bg-white/5 transition-colors">
                                            <span className="font-black text-cyan-200 text-lg">{wn.word}</span>
                                            <span className="text-slate-300 text-sm font-bold mt-1">{wn.meaning}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-3 transform translateZ(50px)">
                            <button onClick={handleRewardPoints}
 className="w-full py-5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-[28px] font-black text-xl shadow-[0_10px_0_#b45309,0_20px_30px_rgba(217,119,6,0.5)] active:translate-y-2 active:shadow-[0_0px_0_#b45309] transition-all flex items-center justify-center gap-2 border-t-2 border-yellow-200">
                                <Coins size={24} /> {t(lang, 'claim_exit') || "획득하고 나가기"}
                            </button>
                            <button onClick={() => { setGameState('MENU'); }}
 className="w-full mt-2 py-4 bg-white/5 text-slate-300 rounded-[28px] font-bold active:translate-y-2 transition-all border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md">
                                {t(lang, 'back_to_menu') || "메뉴로 돌아가기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const MONSTERS = ['🐉', '👹', '👺', '💀', '👻', '👽', '👾', '🕷️', '🦂', '🦇', '🦖', '🧟'];

function Game1MonsterBattle({ settings, onEnd, setGameState, vocaDB, playSound }: any) {
    const lang = settings?.lang || 'ko';
    const [phase, setPhase] = useState<'SELECT' | 'PLAYING' | 'INTERMISSION' | 'FAILED'>('SELECT');
    const [stage, setStage] = useState(1);
    const [maxStageReached, setMaxStageReached] = useState(() => {
        const saved = localStorage.getItem('voca_monster_max_stage');
        const parsed = saved ? parseInt(saved) : 1;
        return isNaN(parsed) ? 1 : parsed;
    });

    // Overall Stats
    const [totalScore, setTotalScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);

    // Stage Stats
    const [hp, setHp] = useState(3);
    const [qIndex, setQIndex] = useState(0);
    const [combo, setCombo] = useState(0);
    const [questions, setQuestions] = useState<any[]>([]);

    const [currentWord, setCurrentWord] = useState<any>(null);
    const currentWordRef = useRef<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [monsterEmoji, setMonsterEmoji] = useState(MONSTERS[0]);

    // Battle animations
    const [monsterState, setMonsterState] = useState<'spawn' | 'idle' | 'hit' | 'attack' | 'dead'>('spawn');
    const [isScreenShaking, setIsScreenShaking] = useState(false);
    const [castSpell, setCastSpell] = useState<number>(0);
    const [timeProgress, setTimeProgress] = useState(100);

    const timerRef = useRef<any>(null);

    const startStage = (s: number, isInitial: boolean = false) => {
        setStage(s);
        const pool = getStageWords(s, vocaDB);
        const stageQuestions = pool.slice(0, 10);

        if (stageQuestions.length === 0) {
            console.warn(`[Arcade] No questions found for stage ${s}. Skipping to next.`);
            setTimeout(() => setPhase('INTERMISSION'), 500);
            return;
        }

        setQuestions(stageQuestions);
        setQIndex(0);
        if (isInitial) setHp(3);
        setCombo(0);
        setPhase('PLAYING');
    };

    useEffect(() => {
        if (phase === 'PLAYING') {
            if (qIndex < questions.length) {
                spawnMonster(questions[qIndex]);
            } else if (qIndex > 0 && qIndex >= questions.length) {
                setPhase('INTERMISSION');
            }
        }
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qIndex, phase, questions]);

    const spawnMonster = (wordObj: any) => {
        if (!wordObj) return;
        setMonsterEmoji(MONSTERS[(stage + qIndex) % MONSTERS.length]);
        setMonsterState('spawn');

        const localizedOptions = getVocaOptions(wordObj, lang);
        if (!Array.isArray(localizedOptions)) {
            console.error("Invalid localizedOptions", localizedOptions);
            return;
        }

        const opts = [...localizedOptions].sort(() => 0.5 - Math.random());
        setOptions(opts);
        setCurrentWord(wordObj);
        currentWordRef.current = wordObj;
        setTimeProgress(100);

        setTimeout(() => {
            if (hp > 0 && phase === 'PLAYING') setMonsterState('idle');
        }, 600);

        clearInterval(timerRef.current);
        const maxDurationMs = Math.max(500, 10000 - ((stage - 1) * 500));
        const intervalTime = 50;
        const step = 100 / (maxDurationMs / intervalTime);

        timerRef.current = setInterval(() => {
            setTimeProgress((prev) => {
                if (prev - step <= 0) {
                    clearInterval(timerRef.current);
                    handleMonsterAttack();
                    return 0;
                }
                return prev - step;
            });
        }, intervalTime);
    };

    const handleMonsterAttack = () => {
        setMonsterState(prev => {
            if (prev === 'hit' || prev === 'dead') return prev;

            clearInterval(timerRef.current);
            safeVibrate([300, 100, 300]);
            setIsScreenShaking(true);
            setCombo(0);

            setHp(h => {
                const newHp = h - 1;
                const cWord = currentWordRef.current;
                setWrongAnswers(wrongs => {
                    if (cWord && !wrongs.find(p => p.word === cWord.word)) {
                        const meaning = getVocaMeaning(cWord, lang);
                        return [...wrongs, { word: cWord.word, meaning }];
                    }
                    return wrongs;
                });

                if (newHp <= 0) {
                    setTimeout(() => {
                        setPhase('FAILED');
                        setIsScreenShaking(false);
                    }, 1500);
                } else {
                    setTimeout(() => {
                        setIsScreenShaking(false);
                        setQIndex(q => q + 1);
                    }, 800);
                }
                return newHp;
            });
            return 'attack';
        });
    };

    const handlePlayerAttack = (selectedMeaning: string) => {
        if (monsterState === 'attack' || monsterState === 'hit' || monsterState === 'dead' || hp <= 0 || isScreenShaking) return;

        clearInterval(timerRef.current);
        const cWord = currentWordRef.current;
        const correctMeaning = getVocaMeaning(cWord, lang);

        if (cWord && selectedMeaning === correctMeaning) {
            setCastSpell(Date.now());

            setTimeout(() => {
                if (playSound) playSound('correct');
                setMonsterState('hit');
                safeVibrate([50]);

                const comboMult = Math.min(combo, 10);
                const damageScore = 100 + (comboMult * 20);

                setTotalScore(s => s + damageScore);
                setCombo(c => c + 1);

                setTimeout(() => {
                    setMonsterState('dead');
                    setTimeout(() => {
                        setQIndex(q => q + 1);
                    }, 400);
                }, 300);
            }, 200);
        } else {
            if (playSound) playSound('wrong');
            handleMonsterAttack();
        }
    };

    if (phase === 'SELECT') {
        const startableStage = Math.max(1, maxStageReached - 4);
        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050510] p-6 text-white overflow-y-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-[#050510] to-[#050510] -z-10"></div>
                <h2 className="text-4xl font-black mb-2 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{t(lang, 'select_stage') || "단계 선택"}</h2>
                <p className="text-indigo-300 text-sm font-bold mb-8 uppercase tracking-widest">{t(lang, 'max_stage') || "최고 단계"} {maxStageReached} / {t(lang, 'startable') || "시작 가능"} {startableStage}+</p>
                <div className="grid grid-cols-4 gap-4 max-w-lg w-full mb-10">
                    {[...Array(20)].map((_, i) => {
                        const sNum = i + 1;
                        const isUnlocked = sNum <= maxStageReached;
                        const canStartAt = sNum >= startableStage && sNum <= maxStageReached;

                        return (
                            <button
                                key={i}
                                disabled={!canStartAt}
                                onClick={() => startStage(sNum, true)}
                                className={`p-4 rounded-2xl font-black text-2xl transition-all shadow-[0_5px_15px_rgba(0,0,0,0.5)] active:scale-95 flex flex-col items-center justify-center border
                                 ${canStartAt ? 'bg-indigo-900/60 hover:bg-cyan-600 border-indigo-400 text-white cursor-pointer' :
                                        isUnlocked ? 'bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed grayscale' :
                                            'bg-black/40 border-white/5 text-white/5 cursor-not-allowed'}`}
                            >
                                {sNum}
                                <span className="text-[10px] font-medium mt-1 uppercase opacity-60">Stage</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setGameState('MENU')}
 className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"><ChevronLeft size={16} /> {t(lang, 'back')}</button>
                    <button onClick={() => onEnd(totalScore, wrongAnswers)}
 className="bg-red-600/20 text-red-400 border border-red-500/30 px-8 py-3 rounded-full font-bold hover:bg-red-600/40 transition-colors uppercase tracking-widest text-xs">{t(lang, 'back_to_main')}</button>
                </div>
            </div>
        );
    }

    if (phase === 'INTERMISSION') {
        const nextStage = stage + 1;
        const isGiftTurn = nextStage % 2 === 1; // Stage 2 success -> gift given before stage 3, etc.

        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050510]/95 backdrop-blur-md p-6 text-white text-center">
                <div className="text-6xl mb-4 animate-bounce">🏆</div>
                <h2 className="text-5xl font-black mb-4 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]">STAGE {stage} CLEARED!</h2>

                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 mb-8 max-w-xs w-full">
                    <p className="text-sm font-bold text-indigo-300 mb-3 uppercase tracking-widest">Current Status</p>
                    <div className="flex justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Heart key={i}
 size={24} className={i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-800'} />
                        ))}
                    </div>
                    {isGiftTurn && (
                        <div className="bg-emerald-500/20 text-emerald-400 text-xs font-black p-2 rounded-xl animate-pulse">
                            🎁 2개 스테이지 정복 보상! 하트 1개 획득!
                        </div>
                    )}
                </div>

                <button onClick={() => {
                    if (stage >= 20) {
                        onEnd(totalScore, wrongAnswers);
                    } else {
                        // Max Stage Memory
                        if (nextStage > maxStageReached) {
                            setMaxStageReached(nextStage);
                            localStorage.setItem('voca_monster_max_stage', nextStage.toString());
                        }

                        // Heart Gift logic: +1 HP every 2 stages cleared
                        if (isGiftTurn) {
                            setHp(prev => Math.min(5, prev + 1));
                        }

                        startStage(nextStage);
                    }
                }} className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-5 rounded-full font-black text-2xl text-black shadow-[0_0_30px_rgba(52,211,153,0.5)] mb-6 hover:scale-105 transition-transform">
                    {stage >= 20 ? '토벌 성공! 결과 보기' : '다음 단계 도전하기 ⚔️'}
                </button>

                <button onClick={() => onEnd(totalScore, wrongAnswers)}
 className="text-slate-400 underline font-medium">오늘은 여기까지 (결과 저장)</button>
            </div>
        );
    }

    if (phase === 'FAILED') {
        const restartStage = Math.max(1, stage - 4);
        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#180000] p-6 text-white text-center">
                <div className="text-[120px] mb-8 drop-shadow-[0_0_50px_rgba(255,0,0,0.8)] filter grayscale">💀</div>
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 italic drop-shadow-lg mb-6">DEFEATED</h2>

                <p className="text-xl mb-10 text-rose-200">
                    {t(lang, 'defeat_msg')}<br />
                    <span className="text-yellow-400 font-bold">{restartStage === 1 && stage <= 5 ? (t(lang, 'from_start')) : t(lang, 'backtrack_msg').replace('{n}', restartStage.toString())}</span> {t(lang, 'retry_msg')}
                </p>

                <button onClick={() => startStage(restartStage)}
 className="bg-gradient-to-r from-red-600 to-rose-700 px-10 py-5 rounded-full font-black text-2xl mb-6 shadow-[0_0_30px_rgba(220,38,38,0.8)] hover:scale-105 transition-transform flex items-center gap-3">
                    <Swords size={28} /> 다시 도전하기
                </button>

                <button onClick={() => onEnd(totalScore, wrongAnswers)}
 className="text-slate-400 underline font-medium">포기하고 후퇴 (결과 보기)</button>
            </div>
        );
    }

    return (
        <div className={`flex-1 relative flex flex-col w-full bg-[#050510] overflow-hidden ${isScreenShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
            {/* Dark Fantasy Environment / Dungeon */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#040411] -z-20"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -z-10 mix-blend-screen"></div>

            {/* Glowing Ground Base */}
            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[250%] h-[150%] origin-bottom transform rotateX-[75deg] perspective-1000 z-0">
                <div className="absolute inset-0 border-t-8 border-indigo-400/30 rounded-full shadow-[0_-50px_100px_rgba(99,102,241,0.3)]"></div>
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgNDBMMDAgMEw0MCAweiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE1KSIvPjwvc3ZnPg==')] animate-[flow-water_10s_linear_infinite]"></div>
            </div>

            {/* Top HUD Area */}
            <div className="absolute w-full px-6 flex justify-between items-start z-40 transform translateZ(50px)" style={{ top: 'calc(1.5rem + var(--safe-area-top))' }}>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5 bg-black/60 backdrop-blur-xl p-3 rounded-[20px] border border-rose-500/30 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                        {[...Array(5)].map((_, i) => (
                            <Heart key={i}
 size={20} className={i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-800'} />
                        ))}
                    </div>
                    {combo > 1 && (
                        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-1.5 rounded-full border border-orange-500/40 animate-pulse text-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                            <span className="text-orange-400 font-black italic text-sm tracking-wider drop-shadow-md">{combo} COMBO 🔥</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-[20px] border border-yellow-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                        <Swords size={20} className="text-yellow-400" />
                        <span className="text-3xl font-black text-white tabular-nums drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">{totalScore}</span>
                    </div>
                    <span className="text-indigo-300 font-black text-xs uppercase tracking-widest mt-1 bg-black/60 px-3 py-1 rounded-full border border-indigo-500/30">Stage {stage}</span>
                </div>
            </div>

            {/* 3D Battle Arena / Characters */}
            <div className="flex-1 relative w-full h-full flex flex-col items-center justify-center z-20 pt-16">
                <div className="absolute top-[18%] z-40">
                    <div className="bg-gradient-to-r from-indigo-900/90 via-black/90 to-indigo-900/90 backdrop-blur-2xl px-8 py-5 rounded-[40px] border-t-2 border-b-2 border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.5),inset_0_0_20px_rgba(255,255,255,0.2)] max-w-[90vw] overflow-hidden">
                        <span className={`font-black text-white drop-shadow-[0_0_10px_rgba(100,100,255,0.8)] tracking-widest break-all ${currentWord?.word?.length > 12 ? 'text-2xl' : currentWord?.word?.length > 8 ? 'text-3xl' : 'text-5xl'}`}>{currentWord?.word || ''}</span>
                    </div>
                </div>

                <div className="relative mt-20 perspective-1000 z-30">
                    <div
                        className={`text-[160px] drop-shadow-[0_30px_50px_rgba(0,0,0,0.9)] filter transition-transform transform-style-3d
                            ${monsterState === 'spawn' ? 'animate-[pop-in_0.6s_ease-out_forwards]' :
                                monsterState === 'idle' ? 'animate-[monster-idle_3s_ease-in-out_infinite]' :
                                    monsterState === 'attack' ? 'animate-[attack-lunge_0.5s_ease-in_forwards]' :
                                        monsterState === 'hit' ? 'animate-[flash-white_0.3s_ease-in-out]' :
                                            'animate-[dead-dissolve_0.5s_ease-out_forwards]'}
                        `}
                        style={{ perspectiveOrigin: 'bottom' }}
                    >
                        {monsterEmoji}
                    </div>

                    {(monsterState === 'idle' || monsterState === 'spawn') && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[120%] h-4 bg-black/80 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                            <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.9),inset_0_2px_5px_rgba(255,255,255,0.8)] transition-all ease-linear" style={{ width: `${timeProgress}%` }}></div>
                        </div>
                    )}
                </div>

                {castSpell > 0 && (
                    <div className="absolute bottom-[-10%] w-32 h-32 opacity-0 pointer-events-none animate-[magic-cast_0.4s_ease-out_forwards] z-50 flex justify-center items-start transform-style-3d">
                        <Flame size={120} className="text-cyan-300 drop-shadow-[0_0_50px_rgba(34,211,238,1)] transform rotate-180" />
                        <div className="absolute inset-0 bg-cyan-400/50 blur-xl rounded-full"></div>
                    </div>
                )}
            </div>

            {/* Spell Action Palette */}
            <div className="relative w-full px-6 pt-8 z-40 bg-gradient-to-t from-black via-black/90 to-transparent" style={{ paddingBottom: 'calc(3rem + var(--safe-area-bottom))' }}>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handlePlayerAttack(opt)}
                            disabled={monsterState !== 'idle' && monsterState !== 'spawn'}
                            className="group relative bg-indigo-900/80 hover:bg-indigo-600/90 backdrop-blur-xl border border-indigo-400/40 text-indigo-50 font-black text-xl md:text-2xl py-7 rounded-[32px] shadow-[0_8px_0_rgba(49,46,129,0.9),0_20px_40px_rgba(0,0,0,0.8)] active:translate-y-2 active:shadow-[0_0px_0_rgba(49,46,129,0.9)] transition-all flex items-center justify-center break-keep transform hover:scale-[1.02]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-[32px] pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[60%] h-1 bg-white/20 rounded-full blur-[2px]"></div>
                            <span className="drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] px-2">{opt}</span>
                        </button>
                    ))}
                </div>
            </div>

            {isScreenShaking && <div className="absolute inset-0 bg-red-600/40 w-full h-full z-50 animate-[flash-red_0.4s_ease-out_forwards] pointer-events-none mix-blend-overlay"></div>}
        </div>
    );
}

// ------ GAME 2: Stepping Stone Bridge (3D Holographic Matching) ------
function Game2Bridge({ settings, onEnd, setGameState, vocaDB, playSound }: any) {
    const lang = settings?.lang || 'ko';
    const [phase, setPhase] = useState<'SELECT' | 'PLAYING' | 'INTERMISSION' | 'FAILED'>('SELECT');
    const [stage, setStage] = useState(1);
    const [maxStageReached, setMaxStageReached] = useState(() => {
        const saved = localStorage.getItem('voca_bridge_max_stage');
        const parsed = saved ? parseInt(saved) : 1;
        return isNaN(parsed) ? 1 : parsed;
    });

    // Overall Stats
    const [totalScore, setTotalScore] = useState(0);
    const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);

    // State
    const [hp, setHp] = useState(3);
    const [timeLeft, setTimeLeft] = useState(100);
    const [round, setRound] = useState(1); // 2 rounds for total 10 words
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentPool, setCurrentPool] = useState<any[]>([]);
    const [leftItems, setLeftItems] = useState<any[]>([]);
    const [rightItems, setRightItems] = useState<any[]>([]);

    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
    const [stageCleared, setStageCleared] = useState(false);

    const timerRef = useRef<any>(null);

    const startStage = (s: number, isInitial: boolean = false) => {
        setStage(s);
        const pool = getStageWords(s, vocaDB);
        setQuestions(pool.slice(0, 10));
        setRound(1);
        prepareRound(pool.slice(0, 5));

        if (isInitial) setHp(3);
        setPhase('PLAYING');

        const baseTimePerWord = Math.max(0.5, 10 - (s - 1) * 0.5);
        setTimeLeft(baseTimePerWord * 10); // Total time for 10 words
    };

    const prepareRound = (pool: any[]) => {
        setCurrentPool(pool);
        setLeftItems([...pool].sort(() => 0.5 - Math.random()));
        setRightItems([...pool].sort(() => 0.5 - Math.random()));
        setMatchedPairs({});
        setSelectedLeft(null);
        setStageCleared(false);
    };

    useEffect(() => {
        if (phase === 'PLAYING') {
            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 0.1) {
                        clearInterval(timerRef.current);
                        handleTimeout();
                        return 0;
                    }
                    return t - 0.1;
                });
            }, 100);
        }
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, round]);

    const handleTimeout = () => {
        setHp(prev => {
            const next = prev - 1;
            if (next <= 0) {
                setPhase('FAILED');
            } else {
                // If timeout, just fail the round/stage
                setPhase('FAILED');
            }
            return next;
        });
    };

    const handleLeftClick = (word: string) => {
        if (matchedPairs[word] || stageCleared || hp <= 0) return;
        setSelectedLeft(word);
    };

    const handleRightClick = (meaning: string) => {
        if (!selectedLeft || stageCleared || hp <= 0) return;

        const obj = currentPool.find(p => p.word === selectedLeft);
        const correctMeaning = getVocaMeaning(obj, lang);
        if (obj && correctMeaning === meaning) {
            if (playSound) playSound('correct');
            const newMatches = { ...matchedPairs, [selectedLeft]: meaning };
            setMatchedPairs(newMatches);
            setTotalScore(s => s + 50);
            setSelectedLeft(null);

            if (Object.keys(newMatches).length === 5) {
                if (round === 1) {
                    setStageCleared(true);
                    setTimeout(() => {
                        setRound(2);
                        prepareRound(questions.slice(5, 10));
                    }, 1200);
                } else {
                    setStageCleared(true);
                    clearInterval(timerRef.current);
                    setTimeout(() => {
                        setPhase('INTERMISSION');
                    }, 1500);
                }
            }
        } else {
            if (playSound) playSound('wrong');
            safeVibrate([200]);
            setHp(h => {
                const newHp = h - 1;
                setWrongAnswers(wrongs => {
                    const exists = wrongs.find(w => w.word === selectedLeft);
                    if (!exists) {
                        const meaningLocal = getVocaMeaning(obj, lang);
                        return [...wrongs, { word: selectedLeft, meaning: meaningLocal }];
                    }
                    return wrongs;
                });
                if (newHp <= 0) setPhase('FAILED');
                return newHp;
            });
            setSelectedLeft(null);
        }
    };

    if (phase === 'SELECT') {
        const startableStage = Math.max(1, maxStageReached - 4);
        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050b15] p-6 text-white overflow-y-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a1e3b] via-[#050b15] to-[#050b15] -z-10"></div>
                <h2 className="text-4xl font-black mb-2 text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">{t(lang, 'select_stage')}</h2>
                <p className="text-emerald-500/60 text-sm font-bold mb-8 uppercase tracking-widest text-center">{t(lang, 'max_stage')} {maxStageReached} / {t(lang, 'startable')} {startableStage}+</p>

                <div className="grid grid-cols-4 gap-4 max-w-lg w-full mb-10">
                    {[...Array(20)].map((_, i) => {
                        const sNum = i + 1;
                        const isUnlocked = sNum <= maxStageReached;
                        const canStartAt = sNum >= startableStage && sNum <= maxStageReached;

                        return (
                            <button
                                key={i}
                                disabled={!canStartAt}
                                onClick={() => startStage(sNum, true)}
                                className={`p-4 rounded-2xl font-black text-2xl transition-all shadow-[0_5px_15px_rgba(0,0,0,0.5)] active:scale-95 flex flex-col items-center justify-center border
                                    ${canStartAt ? 'bg-emerald-900/40 hover:bg-emerald-600 border-emerald-400 text-white cursor-pointer' :
                                        isUnlocked ? 'bg-slate-800/40 border-slate-700 text-slate-500 cursor-not-allowed grayscale' :
                                            'bg-black/40 border-white/5 text-white/5 cursor-not-allowed'}`}
                            >
                                {sNum}
                                <span className="text-[10px] font-medium mt-1 uppercase opacity-60">Stage</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setGameState('MENU')}
 className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors uppercase tracking-widest text-xs flex items-center gap-2"><ChevronLeft size={16} /> {t(lang, 'back')}</button>
                    <button onClick={() => onEnd(totalScore, wrongAnswers)}
 className="bg-red-600/20 text-red-400 border border-red-500/30 px-8 py-3 rounded-full font-bold hover:bg-red-600/40 transition-colors uppercase tracking-widest text-xs">{t(lang, 'back_to_main')}</button>
                </div>
            </div>
        );
    }

    if (phase === 'INTERMISSION') {
        const nextStage = stage + 1;
        const isGiftTurn = nextStage % 2 === 1;

        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-md p-6 text-white text-center">
                <div className="text-6xl mb-4 animate-bounce">🌉</div>
                <h2 className="text-5xl font-black mb-4 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">{t(lang, 'stage_cleared').replace('{n}', stage.toString())}</h2>

                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/10 mb-8 max-w-xs w-full">
                    <p className="text-sm font-bold text-cyan-300 mb-3 uppercase tracking-widest">{t(lang, 'team_status') || 'Team Status'}</p>
                    <div className="flex justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Heart key={i} size={24} className={i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-800'} />
                        ))}
                    </div>
                    {isGiftTurn && (
                        <div className="bg-cyan-500/20 text-cyan-400 text-xs font-black p-2 rounded-xl animate-pulse">
                            {t(lang, 'stage_gift_msg')}
                        </div>
                    )}
                </div>

                <button onClick={() => {
                    if (stage >= 20) {
                        onEnd(totalScore, wrongAnswers);
                    } else {
                        if (nextStage > maxStageReached) {
                            setMaxStageReached(nextStage);
                            localStorage.setItem('voca_bridge_max_stage', nextStage.toString());
                        }
                        if (isGiftTurn) setHp(prev => Math.min(5, prev + 1));
                        startStage(nextStage);
                    }
                }} className="bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-5 rounded-full font-black text-2xl text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] mb-6 hover:scale-105 transition-transform">
                    {stage >= 20 ? t(lang, 'conquer_finish') : t(lang, 'next_stage_go')}
                </button>
                <button onClick={() => onEnd(totalScore, wrongAnswers)} className="text-slate-400 underline font-medium">{t(lang, 'safe_return')}</button>
            </div>
        );
    }

    if (phase === 'FAILED') {
        const restartStage = Math.max(1, stage - 4);
        return (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050010] p-6 text-white text-center">
                <div className="text-[120px] mb-8 drop-shadow-[0_0_50px_rgba(59,130,246,0.6)]">🌊</div>
                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400 italic drop-shadow-lg mb-6">{t(lang, 'washed_away_title')}</h2>
                <p className="text-xl mb-10 text-blue-200">
                    {t(lang, 'washed_away')}<br />
                    <span className="text-yellow-400 font-bold">{restartStage === 1 && stage <= 5 ? t(lang, 'from_start') : t(lang, 'backtrack_msg').replace('{n}', restartStage.toString())}</span> {t(lang, 'retry_msg')}
                </p>
                <button onClick={() => startStage(restartStage, true)} className="bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-5 rounded-full font-black text-2xl mb-6 shadow-[0_0_30px_rgba(37,99,235,0.8)] hover:scale-105 transition-transform">{t(lang, 'retry')}</button>
                <button onClick={() => onEnd(totalScore, wrongAnswers)} className="text-slate-400 underline font-medium">{t(lang, 'give_up')}</button>
            </div>
        );
    }

    return (
        <div className="flex-1 relative flex flex-col w-full bg-[#0a192f] overflow-hidden perspective-1500 font-sans">
            <div className="absolute inset-0 water-texture -z-20"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 to-transparent -z-10"></div>

            <div className="absolute top-16 w-full px-6 flex justify-between items-start z-40">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1.5 bg-black/60 backdrop-blur-xl p-3 rounded-[20px] border border-rose-500/30 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
                        {[...Array(5)].map((_, i) => (
                            <Heart key={i}
 size={20} className={i < hp ? 'text-rose-500 fill-rose-500' : 'text-slate-800'} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-black/50 backdrop-blur-xl px-5 py-3 rounded-[20px] border border-cyan-500/30 flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <Clock size={20} className={timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-cyan-400'} />
                        <span className={`text-2xl font-black tabular-nums ${timeLeft < 5 ? 'text-red-500' : 'text-white'}`}>
                            {timeLeft.toFixed(1)}s
                        </span>
                    </div>
                    <span className="text-cyan-300 font-black text-xs uppercase tracking-widest mt-1 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/30">Stage {stage}-{round}</span>
                </div>
            </div>

            <div className="absolute top-[30%] left-0 w-full h-[70%] transform-style-3d pointer-events-none z-10">
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-40 h-10 bg-gradient-to-b from-blue-300 to-indigo-500 rounded-full blur-[2px] transform rotateX-[70deg] shadow-[0_0_50px_rgba(99,102,241,0.8)]"></div>

                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`absolute left-1/2 -translate-x-1/2 w-32 h-24 bg-gradient-to-b from-cyan-100 to-blue-400 rounded-[40px] border-b-[10px] border-blue-900 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_5px_15px_rgba(255,255,255,0.8)] transition-all duration-1000 transform-style-3d ${Object.keys(matchedPairs).length > i ? 'animate-[bridge-build_0.8s_ease-out_forwards]' : 'opacity-0 scale-0'}`}
                        style={{
                            top: `${50 - (i * 12)}%`,
                            transform: `rotateX(70deg) translateZ(${i * 20}px)`,
                            zIndex: 10 - i
                        }}
                    ></div>
                ))}

                <div
                    className="absolute left-1/2 -translate-x-1/2 text-[100px] transition-all duration-1000 ease-in-out drop-shadow-[0_30px_20px_rgba(0,0,0,0.8)] z-50 transform rotateX-[0deg] transform-origin-bottom"
                    style={{
                        top: stageCleared ? '10%' : `${50 - (Object.keys(matchedPairs).length * 12)}%`,
                        transform: `translate-x-1/2 ${stageCleared ? 'scale(0.5) translateY(-50px)' : 'scale(1)'}`
                    }}
                >
                    {stageCleared ? '🏃‍♂️' : '🧍'}
                </div>
            </div>

            <div className="flex-1 w-full flex items-end pb-12 z-30 transform-style-3d">
                <div className="w-full max-w-lg mx-auto flex gap-4 px-4 bg-transparent perspective-1000">
                    <div className="flex-1 flex flex-col gap-5 transform rotateY-[10deg] translateZ(50px)">
                        {leftItems.map((item, idx) => {
                            const isMatched = !!matchedPairs[item.word];
                            const isSelected = selectedLeft === item.word;
                            return (
                                <button
                                    key={idx}
                                    disabled={isMatched || stageCleared}
                                    onClick={() => handleLeftClick(item.word)}
                                    className={`relative w-full py-6 px-4 rounded-[30px] font-black text-xl transition-all duration-300 transform backdrop-blur-xl border border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex items-center justify-between overflow-hidden
                                        ${isMatched ? 'bg-emerald-500/50 text-white/50 scale-95 border-emerald-500/20 shadow-none' :
                                            isSelected ? 'bg-cyan-500/80 text-white scale-105 border-cyan-300 shadow-[0_0_40px_rgba(6,182,212,0.8),inset_0_0_20px_rgba(255,255,255,0.4)] z-20' :
                                                'bg-slate-900/60 text-cyan-50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]'}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[30px]"></div>
                                    <span className={`relative z-10 tracking-wide break-all mr-2 ${item.word.length > 12 ? 'text-sm' : 'text-lg'}`}>{item.word}</span>
                                    <div className={`w-5 h-5 rounded-full border-[3px] shadow-inner relative z-10 transition-colors
                                        ${isMatched ? 'bg-emerald-400 border-white' : isSelected ? 'bg-cyan-300 border-white' : 'bg-transparent border-slate-500'}
                                    `}></div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex-1 flex flex-col gap-5 transform -rotateY-[10deg] translateZ(50px)">
                        {rightItems.map((item, idx) => {
                            const matchedWord = Object.keys(matchedPairs).find(k => matchedPairs[k] === item.meaning);
                            const isMatched = !!matchedWord;
                            return (
                                <button
                                    key={idx}
                                    disabled={isMatched || stageCleared}
                                    onClick={() => handleRightClick(getVocaMeaning(item, lang))}
                                    className={`relative w-full py-6 px-4 rounded-[30px] font-black text-base transition-all duration-300 transform backdrop-blur-xl border border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex items-center justify-between overflow-hidden break-keep text-left
                                        ${isMatched ? 'bg-emerald-500/50 text-white/50 scale-95 border-emerald-500/20 shadow-none' :
                                            'bg-slate-900/60 text-emerald-50 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]'}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[30px]"></div>
                                    <div className={`w-5 h-5 rounded-full border-[3px] shadow-inner relative z-10 shrink-0 transition-colors
                                        ${isMatched ? 'bg-emerald-400 border-white' : 'bg-transparent border-slate-500'}
                                    `}></div>
                                    <span className={`relative z-10 w-full text-right ml-3 break-keep ${getVocaMeaning(item, lang).length > 20 ? 'text-[10px]' : getVocaMeaning(item, lang).length > 10 ? 'text-xs' : 'text-sm'}`}>{getVocaMeaning(item, lang)}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

