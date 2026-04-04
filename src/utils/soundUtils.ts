import { getBrowserLanguage } from '../i18n';

export const getSet = () => {
    try {
        const s = localStorage.getItem('vq_settings');
        if (s) return JSON.parse(s);
    } catch (e) { }
    return { bgm: true, sfx: true, tts: true, vibration: true, lang: getBrowserLanguage() };
};

export const playVibration = (type: 'correct' | 'wrong') => {
    if (getSet().vibration && navigator.vibrate) {
        if (type === 'correct') navigator.vibrate(100);
        else navigator.vibrate([100, 50, 100]);
    }
};

let globalAudioContext: AudioContext | null = null;

export const playSound = (type: 'correct' | 'wrong' | 'alarm') => {
    if (type === 'correct' || type === 'wrong') playVibration(type);
    else if (type === 'alarm') playVibration('correct');

    if (!getSet().sfx) return;

    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        if (!globalAudioContext) {
            globalAudioContext = new AudioContext();
        }
        const ctx = globalAudioContext;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } else if (type === 'alarm') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
            gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.2);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.start();
            osc.stop(ctx.currentTime + 0.1);
            osc2.start(ctx.currentTime + 0.2);
            osc2.stop(ctx.currentTime + 0.3);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        }
    } catch (e) {
        console.error("Audio error", e);
    }
};
