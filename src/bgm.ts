// src/bgm.ts
import mainBgmUrl from './assets/bgm/main_bgm.mp3';

let isBgmPlaying = false;
let userInteracted = false;
let audioContext: AudioContext | null = null;
let currentSequencer: any = null;
let bgmAudio: HTMLAudioElement | null = null;
let currentVolume = 0.3;

// --- Procedural Sequencer for specialized modes ---
// This allows us to "make" music from code, no external files needed!

type BGMMode = 'HAPPY' | 'CALM' | 'BATTLE' | 'COZY' | 'TRIUMPH' | 'MAIN_BRIGHT' | 'MP3_MAIN';

class VocaSequencer {
    private ctx: AudioContext;
    private interval: any = null;
    private tempo: number = 120;
    private beat = 0;
    private nodes: AudioNode[] = [];
    private volume: number = 0.2;

    constructor(ctx: AudioContext, mode: BGMMode) {
        this.ctx = ctx;
        this.setup(mode);
    }

    private setup(mode: BGMMode) {
        switch (mode) {
            case 'HAPPY': this.tempo = 130; break;
            case 'CALM': this.tempo = 90; break;
            case 'BATTLE': this.tempo = 150; break;
            case 'COZY': this.tempo = 105; break;
            case 'TRIUMPH': this.tempo = 125; break;
            case 'MAIN_BRIGHT': this.tempo = 128; break; // Upbeat tempo like the sample
        }
    }

    private playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine', decay: number = 0.001) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume, startTime + 0.02); // Faster attack
        gain.gain.exponentialRampToValueAtTime(decay, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
        this.nodes.push(osc, gain);
    }

    start(mode: BGMMode) {
        this.stop();
        const stepTime = 60 / this.tempo / 4; // 16th note

        // Simple Melodic Patterns (C Major / Pentatonic)
        const scales = {
            HAPPY: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major Pentatonic
            CALM: [196.00, 220.00, 261.63, 293.66, 329.63],
            BATTLE: [261.63, 277.18, 311.13, 349.23, 415.30], // More tense/Minor
            COZY: [349.23, 392.00, 440.00, 466.16, 523.25], // F Lydian-ish
            TRIUMPH: [523.25, 659.25, 783.99, 1046.50], // C Major Arpeggio
            MAIN_BRIGHT: [392.00, 440.00, 493.88, 523.25, 587.33, 659.25] // G Major Pentatonic (Bright)
        };

        this.interval = setInterval(() => {
            const now = this.ctx.currentTime;
            const currentScale = (scales as any)[mode] || scales.HAPPY;

            // Bass line (every 4 beats)
            if (this.beat % 8 === 0) {
                this.playNote(currentScale[0] / 2, now, 1.5, 'triangle');
            }

            // Arpeggio / Melody
            if (mode === 'BATTLE') {
                if (this.beat % 2 === 0) this.playNote(currentScale[Math.floor(Math.random() * currentScale.length)], now, 0.2, 'sawtooth');
            } else if (mode === 'CALM') {
                if (this.beat % 4 === 0) this.playNote(currentScale[this.beat % currentScale.length], now, 0.8, 'sine');
            } else {
                // Happy/Cozy/Triumph (and MAIN_BRIGHT if it somehow gets here)
                if (this.beat % 2 === 0) {
                    const note = currentScale[Math.floor(Math.random() * currentScale.length)];
                    this.playNote(note, now, 0.4, 'sine');
                }
            }

            this.beat++;
        }, stepTime * 1000);
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
        this.nodes.forEach(n => { try { (n as any).stop?.(); (n as any).disconnect?.(); } catch (e) { } });
        this.nodes = [];
        this.beat = 0;
    }

    setVolume(v: number) { this.volume = Math.max(0, Math.min(0.5, v)); }
}

export const initBGM = () => {
    const handleFirstInteraction = () => {
        if (userInteracted) return;
        userInteracted = true;
        console.log('[BGM] First interaction detected');

        if (!bgmAudio) {
            bgmAudio = new Audio(mainBgmUrl);
            bgmAudio.loop = true;
            bgmAudio.volume = currentVolume;
        }

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext && !audioContext) {
            audioContext = new AudioContext();
        }

        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);

        // Only play if we are supposed to be playing (fallback if autoplay failed)
        if (isBgmPlaying) {
            console.log('[BGM] Resuming BGM after first interaction');
            playMainBGM(lastMode);
        }
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            audioContext?.suspend();
            bgmAudio?.pause();
            console.log('[BGM] App hidden, audio suspended');
        } else {
            console.log('[BGM] App visible, isBgmPlaying:', isBgmPlaying);
            if (isBgmPlaying) {
                audioContext?.resume();
                // Only resume if it was actually playing the MP3 mode
                if (bgmAudio?.paused && (lastMode === 'HAPPY' || lastMode === 'MAIN_BRIGHT' || lastMode === 'MP3_MAIN')) {
                    bgmAudio.play().catch(e => console.warn("[BGM] Visibility resume failed:", e));
                }
            }
        }
    });

    // 만약 Capacitor 네이티브 환경(iOS/Android)이라면 강제로 초기화하여 자동 재생 시도
    const isNative = typeof window !== 'undefined' && (window as any).Capacitor && (window as any).Capacitor.getPlatform() !== 'web';
    if (isNative) {
        if (!bgmAudio) {
            bgmAudio = new Audio(mainBgmUrl);
            bgmAudio.loop = true;
            bgmAudio.volume = currentVolume;
        }
    }
};

let lastMode: BGMMode = 'HAPPY';

// We can choose from 5 "Made by code" styles
export const playMainBGM = (style: BGMMode = 'HAPPY') => {
    isBgmPlaying = true;
    lastMode = style;

    if (!bgmAudio) {
        bgmAudio = new Audio(mainBgmUrl);
        bgmAudio.loop = true;
        bgmAudio.volume = currentVolume;
    }

    // Stop existing
    currentSequencer?.stop();
    bgmAudio?.pause();

    // Use MP3 for Happy & MainBright
    if (style === 'HAPPY' || style === 'MAIN_BRIGHT' || style === 'MP3_MAIN') {
        if (bgmAudio) {
            bgmAudio.volume = currentVolume;
            bgmAudio.play().catch(e => {
                console.error("BGM Play Error:", e);
                // 브라우저 정책으로 실패한 경우 상호작용 후 재생하도록 유도됨 (isBgmPlaying=true 이므로 fallback이 작동)
            });
        }
    } else {
        // Use Sequencer for others
        if (audioContext) {
            if (audioContext.state === 'suspended') audioContext.resume();
            if (!currentSequencer) currentSequencer = new VocaSequencer(audioContext, style);
            currentSequencer.setVolume(currentVolume);
            currentSequencer.start(style);
        }
    }
};

export const pauseMainBGM = () => {
    isBgmPlaying = false;
    currentSequencer?.stop();
    bgmAudio?.pause();
};

export const setBgmVolume = (vol: number) => {
    currentVolume = vol;
    if (bgmAudio) bgmAudio.volume = vol;
    currentSequencer?.setVolume(vol);
};
