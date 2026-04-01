import { X, Coins, Lock, Sparkles, Navigation2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PcAdSlot } from '../components/PcComponents';
import { useState, useEffect, useRef } from 'react';
import { t } from '../i18n';
import { vocaDBJson } from '../data/vocaData';
import { showAdIfFree } from '../admob';

interface MasteryListScreenProps {
    settings: any;
    setScreen: (screen: string) => void;
    userPoints: number;
    unlockedLevels: number[];
    currentLevel: number;
    setActiveStudyLevel: (lvl: number) => void;
    isPremium: boolean;
}

export const MasteryListScreen = ({
    settings,
    setScreen,
    userPoints,
    unlockedLevels,
    currentLevel,
    setActiveStudyLevel,
    isPremium
}: MasteryListScreenProps) => {
    const levels = vocaDBJson.map((levelData: any) => {
        const lvl = levelData.level;
        let cost = 0;
        
        if (lvl <= 10) {
            cost = 0;
        } else if (lvl <= 30) {
            cost = 2000;
        } else if (lvl <= 70) { // A2
            cost = 5000;
        } else if (lvl <= 130) { // B1
            cost = 10000;
        } else if (lvl <= 210) { // B2
            cost = 15000;
        } else if (lvl <= 290) { // C1
            cost = 20000;
        } else { // C2 (291-334)
            cost = 25000;
        }

        return {
            level: lvl,
            description: levelData.description,
            wordCount: levelData.words.length,
            cost: cost,
            words: levelData.words
        };
    });

    const maxUnlockedLevel = Math.max(...unlockedLevels, currentLevel, 1);
    const initialStage = Math.ceil(maxUnlockedLevel / 10);
    const [viewingStage, setViewingStage] = useState(initialStage);
    const [hasAnimatedGate, setHasAnimatedGate] = useState(false);
    const [isGateOpen, setIsGateOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter levels for current stage
    const stageLevels = levels.slice((viewingStage - 1) * 10, viewingStage * 10);
    const totalStages = Math.ceil(levels.length / 10);

    // Auto-scroll logic: only if the current level is in this stage
    useEffect(() => {
        if (scrollRef.current) {
            const currentIdxInStage = stageLevels.findIndex(l => l.level === maxUnlockedLevel);
            if (currentIdxInStage !== -1) {
                const pos = getNodePosition(currentIdxInStage);
                const containerHeight = scrollRef.current.clientHeight;
                scrollRef.current.scrollTop = pos.y - containerHeight / 2;
            } else {
                // If not in this stage, scroll to bottom or top accordingly
                scrollRef.current.scrollTop = 0;
            }
        }
        // Reset animation state when switching stages if not cleared
        if (maxUnlockedLevel <= viewingStage * 10) {
            setHasAnimatedGate(false);
            setIsGateOpen(false);
        } else if (!hasAnimatedGate && maxUnlockedLevel > viewingStage * 10 && viewingStage < totalStages) {
            // Trigger animation sequence
            setHasAnimatedGate(true); // Mark as started
            
            // 1. Movement is handled by CSS classes (duration 1200ms)
            // 2. Open doors after movement (after 1000ms)
            const openTimer = setTimeout(() => {
                setIsGateOpen(true);
            }, 1000);

            // 3. Auto-transition after door opening (after 1000 + 1500ms)
            const transitionTimer = setTimeout(() => {
                setViewingStage(v => v + 1);
                setIsGateOpen(false); // Reset for next stage
            }, 3000);

            return () => {
                clearTimeout(openTimer);
                clearTimeout(transitionTimer);
            };
        } else if (maxUnlockedLevel > viewingStage * 10) {
            // If already cleared (e.g. browsing back), keep it open
            setIsGateOpen(true);
        }
    }, [viewingStage, unlockedLevels, maxUnlockedLevel, totalStages, hasAnimatedGate]);

    const scrollToCurrent = () => {
        if (scrollRef.current) {
            const currentIdxInStage = stageLevels.findIndex(l => l.level === maxUnlockedLevel);
            if (currentIdxInStage !== -1) {
                const pos = getNodePosition(currentIdxInStage);
                scrollRef.current.scrollTo({
                    top: pos.y - scrollRef.current.clientHeight / 2,
                    behavior: 'smooth'
                });
            }
        }
    };

    // Path Logic: Zig-zag winding path
    const getNodePosition = (idx: number) => {
        const spacing = 150; // Reduced spacing for tighter 10-level view
        const amplitude = 35; // Slightly wider swing
        return {
            x: Math.sin(idx * 1.5) * amplitude,
            y: (stageLevels.length - 1 - idx) * spacing + 120
        };
    };

    const generatePath = (count: number) => {
        if (count <= 0) return "";
        let d = `M 50 ${getNodePosition(0).y}`;
        for (let i = 1; i < count; i++) {
            const pos = getNodePosition(i);
            const prevPos = getNodePosition(i - 1);
            const middleY = (pos.y + prevPos.y) / 2;
            d += ` C ${50 + prevPos.x} ${middleY}, ${50 + pos.x} ${middleY}, ${50 + pos.x} ${pos.y}`;
        }
        return d;
    };

    // Automatic unlock is handled via progression (isLocked logic)


    return (
        <div className="screen animate-fade-in bg-[#e0f2fe] flex flex-col overflow-hidden relative">
            {/* --- Premium Forest Theme Background --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* Generated Premium Image Background */}
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
                    style={{ backgroundImage: 'url(/assets/mastery_forest_premium_bg.png)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#166534]/5 via-transparent to-[#e0f2fe]/30" />
                
                {/* Floating Particle Letters (Mockup Style) */}
                <div className="absolute top-[15%] left-[10%] opacity-40 text-2xl font-black text-amber-200 animate-[float_6s_infinite] select-none">A</div>
                <div className="absolute top-[25%] right-[15%] opacity-30 text-xl font-black text-white animate-[float_7s_infinite_1s] select-none">E</div>
                <div className="absolute bottom-[30%] left-[20%] opacity-35 text-3xl font-black text-green-200 animate-[float_8s_infinite_2s] select-none">K</div>
                <div className="absolute bottom-[15%] right-[25%] opacity-40 text-2xl font-black text-orange-200 animate-[float_5s_infinite_0.5s] select-none">S</div>
                <div className="absolute top-[45%] left-[5%] opacity-20 text-4xl animate-[float_10s_infinite] drop-shadow-2xl select-none">🌳</div>
                <div className="absolute bottom-[45%] right-[5%] opacity-25 text-3xl animate-[bounce_4s_infinite] select-none">🍃</div>
                
                {/* Atmospheric Sunbeams */}
                <div className="absolute top-0 right-0 w-full h-[80%] bg-gradient-to-br from-yellow-100/10 via-transparent to-transparent rotate-12 blur-[120px] pointer-events-none" />
            </div>

            <header className="flex items-center justify-between px-6 pb-4 bg-gradient-to-r from-indigo-700 to-indigo-600 text-white z-20 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-b border-indigo-500/30" style={{ paddingTop: 'calc(max(env(safe-area-inset-top), 20px) + 16px)' }}>
                <div className="flex items-center gap-3">
                    <button onClick={async () => { await showAdIfFree(); setScreen('HOME'); }}
                        className="bg-black/20 hover:bg-black/30 text-white rounded-full p-2 active:scale-90 transition-all border border-white/10 shadow-lg">
                        <X size={20} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-[1000] tracking-tighter italic uppercase leading-none drop-shadow-md">
                                STAGE {viewingStage}
                            </h2>
                            <div className="flex items-center gap-1 bg-green-500/20 border border-green-400/30 px-2 py-0.5 rounded text-[9px] font-black tracking-widest text-green-300">
                                <span>FOREST</span>
                            </div>
                            {isPremium && (
                                <div className="flex items-center gap-1 bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 rounded text-[9px] font-black tracking-widest text-indigo-300 animate-pulse">
                                    <span>PREMIUM</span>
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            LEVELS {(viewingStage - 1) * 10 + 1}-{Math.min(viewingStage * 10, levels.length)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-black/40 px-3.5 py-2 rounded-2xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                        <Coins size={16} className="text-yellow-400 filter drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                        <span className="text-sm font-black text-white tabular-nums">{userPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 rounded-2xl p-1 border border-white/10 shadow-lg">
                        <button 
                            disabled={viewingStage <= 1}
                            onClick={() => setViewingStage(v => v - 1)}
                            className="p-2 disabled:opacity-20 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                        >
                            <ChevronLeft size={22} />
                        </button>
                        <div className="w-[1px] h-6 bg-white/10" />
                        <button 
                            disabled={viewingStage >= totalStages}
                            onClick={() => {
                                if (viewingStage < Math.ceil(maxUnlockedLevel / 10)) {
                                    setViewingStage(v => v + 1);
                                }
                            }}
                            className="p-2 disabled:opacity-20 hover:bg-white/10 rounded-xl transition-all active:scale-90 relative"
                        >
                            <ChevronRight size={22} />
                            {viewingStage >= Math.ceil(maxUnlockedLevel / 10) && (
                                <div className="absolute top-1 right-1 bg-slate-900 border border-slate-700 p-0.5 rounded-full shadow-md">
                                    <Lock size={10} className="text-white" />
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto relative scrollbar-hide scroll-smooth z-10"
            >
                <div className="relative pt-24 pb-64 flex flex-col items-center min-h-screen" style={{ height: `${stageLevels.length * 150 + 400}px` }}>
                    {/* --- SVG Path: Multi-layered Glowing Trail --- */}
                    <svg
                        className="absolute inset-0 w-full pointer-events-none transform-gpu"
                        style={{ height: '100%' }}
                    >
                        <defs>
                            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                            </linearGradient>
                        </defs>
                        {/* 1. Deep Foundation Glow (No CSS Blur for mobile perf) */}
                        <path
                            d={generatePath(stageLevels.length)}
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="40"
                            strokeLinecap="round"
                            strokeOpacity="0.1"
                        />
                        
                        {/* 2. Primary Energy Stream */}
                        <path
                            d={generatePath(stageLevels.length)}
                            fill="none"
                            stroke="#818cf8"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeOpacity="0.4"
                        />
                        
                        {/* 3. Winding Magical Thread */}
                        <path
                            d={generatePath(stageLevels.length)}
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="1, 15"
                            className="opacity-70"
                        />
                    </svg>

                    {/* --- Next Stage Gate --- */}
                    {viewingStage < totalStages && (
                        <div 
                            className={`absolute flex flex-col items-center group cursor-pointer transition-all duration-[1200ms] cubic-bezier(0.34, 1.56, 0.64, 1) z-[100]
                                ${maxUnlockedLevel > viewingStage * 10 
                                    ? 'left-1/2 -translate-x-1/2 top-[20px] scale-100 opacity-100' 
                                    : 'left-[10%] bottom-[80px] scale-[0.35] opacity-50 grayscale hover:grayscale-0 hover:scale-[0.45] hover:opacity-100'}`}
                            style={{ 
                                position: 'absolute',
                                transform: (maxUnlockedLevel > viewingStage * 10) ? 'translateX(-50%)' : 'none',
                                filter: (maxUnlockedLevel > viewingStage * 10) ? 'none' : 'drop-shadow(0 0 10px rgba(0,0,0,0.3))'
                             }}
                            onClick={() => {
                                if (maxUnlockedLevel > viewingStage * 10) {
                                    setViewingStage(v => v + 1);
                                } else {
                                    alert(t(settings.lang, "clear_previous_first"));
                                }
                            }}
                        >
                            <div className="relative w-28 h-36 flex items-center justify-center">
                                {/* Gate Frame */}
                                <div className={`absolute inset-0 border-[6px] rounded-t-full shadow-2xl transition-all duration-1000 transform-gpu ${maxUnlockedLevel > viewingStage * 10 ? 'border-cyan-400/50 bg-cyan-950/40' : 'border-indigo-900/50 bg-indigo-950/40'}`}></div>
                                
                                {isGateOpen ? (
                                    /* Open Gate Action */
                                    <div className="relative w-full h-full flex animate-fade-in perspective-[1000px]">
                                        <div className="w-1/2 h-full bg-cyan-800 border-r border-cyan-400/30 rounded-tl-full origin-left animate-gate-left-open shadow-inner"></div>
                                        <div className="w-1/2 h-full bg-cyan-800 border-l border-cyan-400/30 rounded-tr-full origin-right animate-gate-right-open shadow-inner"></div>
                                        
                                        {/* Magical Portal Glow */}
                                        <div className="absolute inset-x-2 inset-y-2 bg-gradient-to-t from-cyan-400/60 via-cyan-400/20 to-transparent rounded-t-full animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.5)]"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles size={32} className="text-cyan-100 animate-spin-slow" />
                                        </div>
                                    </div>
                                ) : (
                                    /* Locked/Closed Gate */
                                    <div className={`relative w-full h-full flex items-center justify-center rounded-t-full overflow-hidden transition-all duration-500 ${maxUnlockedLevel > viewingStage * 10 ? 'bg-cyan-900/40' : 'bg-slate-900/40'}`}>
                                        <div className="flex flex-col items-center gap-1">
                                            <Lock size={28} className="text-slate-400 drop-shadow-lg" />
                                            <span className="text-[8px] font-black text-slate-500 tracking-[0.2em] uppercase">{t(settings.lang, "locked")}</span>
                                        </div>
                                        {/* Dynamic Shiny Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[200%] animate-[shine_5s_infinite]" />
                                    </div>
                                )}
                            </div>
                            
                            {/* Gate Label (More compact) */}
                            <div className={`mt-3 px-4 py-1.5 rounded-full border-2 font-black text-[10px] tracking-[0.1em] transition-all shadow-xl uppercase
                                ${maxUnlockedLevel > viewingStage * 10 
                                    ? 'bg-cyan-600 text-white border-cyan-300 animate-bounce cursor-pointer' 
                                    : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                {maxUnlockedLevel > viewingStage * 10 ? t(settings.lang, "stage_gate_open") : t(settings.lang, "stage_gate_locked")}
                            </div>
                        </div>
                    )}

                    {/* Level Nodes */}
                    {stageLevels.map((l, idx) => {
                        // Everyone must progress sequentially, regardless of premium status
                        const isLocked = l.level > maxUnlockedLevel;
                        const isActuallyUnlocked = !isLocked;
                        
                        const isCompleted = l.level < maxUnlockedLevel;
                        const isCurrent = l.level === maxUnlockedLevel;
                        const pos = getNodePosition(idx);
                        
                        return (
                            <div
                                key={idx}
                                className="absolute transition-all duration-700 transform-gpu"
                                style={{
                                    left: `${50 + pos.x}%`,
                                    top: `${pos.y}px`,
                                    transform: 'translate(-50%, -50%) translateZ(0)',
                                    zIndex: 10 + idx
                                }}
                            >
                                {/* Level Container with Under-Shadow */}
                                <div className="relative flex flex-col items-center">
                                    {/* 3D Level Node Button */}
                                    <button
                                        onClick={() => {
                                            if (isLocked) {
                                                alert(t(settings.lang, "clear_previous_first") || "Please clear the previous level first!");
                                                return;
                                            }
                                            // Directly enter quiz if not locked (Automatic Unlock)
                                            setActiveStudyLevel(l.level);
                                            setScreen('QUIZ');
                                        }}
                                        className={`relative w-24 h-24 rounded-full flex items-center justify-center font-[1000] text-3xl transition-all active:scale-95 group overflow-hidden border-4 shadow-[0_15px_30px_rgba(0,0,0,0.3)]
                                            ${isCurrent 
                                                ? 'bg-gradient-to-b from-[#fbbf24] to-[#ea580c] text-white border-white/90 ring-[15px] ring-cyan-400/30 scale-110' 
                                                : isCompleted
                                                    ? 'bg-gradient-to-b from-[#ffd700] via-[#fbbf24] to-[#f59e0b] text-white border-white/70 shadow-[0_10px_20px_rgba(245,158,11,0.5)]'
                                                    : (isActuallyUnlocked && !isLocked)
                                                        ? 'bg-gradient-to-b from-[#f8fafc] to-[#cbd5e1] text-slate-700 border-white/80'
                                                        : 'bg-gradient-to-b from-[#64748b] to-[#334155] text-slate-400 border-slate-500/50 opacity-90'
                                            }
                                        `}
                                    >
                                        {/* Inner Bevel Shadows for 3D Feel */}
                                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                                        <div className="absolute inset-0 shadow-[inset_0_4px_8px_rgba(255,255,255,0.7),inset_0_-4px_8px_rgba(0,0,0,0.3)] pointer-events-none rounded-full" />

                                        {/* Icons / Numbers */}
                                        {isCompleted ? (
                                            <div className="flex flex-col items-center mt-[-4px]">
                                                <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{l.level}</span>
                                                <Sparkles size={16} className="text-white/90 mt-[-2px] fill-white" />
                                            </div>
                                        ) : isLocked ? (
                                            <Lock size={28} className="text-slate-900/40 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" />
                                        ) : (
                                            <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{l.level}</span>
                                        )}

                                        {/* Shine Effect Animation */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent -translate-x-[200%] transition-transform duration-[2000ms] group-hover:translate-x-[200%]" />
                                        
                                        {/* Energy Ring for Current */}
                                        {isCurrent && (
                                            <div className="absolute inset-[-10px] rounded-full border-4 border-cyan-400/50 animate-[ping_3s_infinite] opacity-60" />
                                        )}
                                    </button>

                                    {/* Success Badge for Completed Levels (Mockup Style) */}
                                    {isCompleted && (
                                        <div className="absolute bottom-6 right-0 w-8 h-8 bg-[#22c55e] border-2 border-white rounded-full flex items-center justify-center shadow-lg z-20">
                                            <div className="w-4 h-4 text-white font-black">✓</div>
                                        </div>
                                    )}
                                    
                                    {/* Premium Level Label (Floating Style) */}
                                    <div className={`mt-5 px-5 py-2 rounded-2xl border-2 shadow-xl transform-gpu transition-all
                                        ${isCurrent 
                                            ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/40 scale-110 -translate-y-1' 
                                            : isCompleted
                                                ? 'bg-yellow-500 text-white border-yellow-300 shadow-yellow-900/20'
                                                : 'bg-white/95 text-slate-600 border-white shadow-slate-200/50'
                                        }
                                    `}>
                                        <p className="text-[11px] font-[1000] italic whitespace-nowrap uppercase tracking-widest text-center">
                                            {isCompleted ? 'MASTERY' : isCurrent ? 'GOAL!' : !isLocked ? `PLAY LEVEL ${l.level}` : 'LOCKED'}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Bottom Ad Slot */}
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
                        <PcAdSlot variant="square" />
                    </div>
                </div>

                {/* Floating Navigation Button */}
                <button
                    onClick={scrollToCurrent}
                    className="fixed bottom-24 right-6 w-16 h-16 bg-white border-2 border-indigo-100 rounded-full shadow-[0_10px_40px_rgba(79,70,229,0.3)] flex items-center justify-center text-indigo-600 active:scale-90 active:shadow-inner transition-all z-[80] group"
                >
                    <Navigation2 size={28} className="fill-indigo-600 transition-transform group-hover:scale-110" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">!</div>
                </button>
            </div>

            {/* Removed Level Intro Modal for Direct Challenge Flow */}
            
            <style>{`
                .-rotate-y-90 { transform: perspective(1000px) rotateY(-90deg); }
                .rotate-y-90 { transform: perspective(1000px) rotateY(90deg); }
                .-rotate-y-110 { transform: perspective(1000px) rotateY(-110deg); }
                .rotate-y-110 { transform: perspective(1000px) rotateY(110deg); }

                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes hologram {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }
                @keyframes flicker {
                    0% { opacity: 0.1; }
                    5% { opacity: 0.4; }
                    10% { opacity: 0.1; }
                    15% { opacity: 0.6; }
                    20% { opacity: 0.1; }
                    100% { opacity: 0.1; }
                }

                @keyframes gate-left-open {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(-110deg); }
                }
                @keyframes gate-right-open {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(110deg); }
                }
                .animate-gate-left-open {
                    animation: gate-left-open 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .animate-gate-right-open {
                    animation: gate-right-open 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>

        </div>
    );
};
