export const APP_VERSION = "1.8.7";
export const AD_TEST_MODE = false; // Set to false for production
export const STORE_URL_ANDROID = "https://play.google.com/store/apps/details?id=com.stepup.vocaquest";
export const STORE_URL_IOS = "https://apps.apple.com/app/vocaquest/id6475685145";

export const GLOBAL_STORE_ITEMS = [
    { id: "default", name: "Rookie Chick", price: 0, icon: "🐣", desc: "Starter Avatar (Common)", rarity: "common" },
    { id: "ninja", name: "Shadow Ninja", price: 1500, icon: "🥷", desc: "Fast Catcher (Rare)", rarity: "rare" },
    { id: "wizard", name: "Word Wizard", price: 3000, icon: "🧙‍♂️", desc: "Master of Words (Epic)", rarity: "epic" },
    { id: "king", name: "Voca King", price: 10000, icon: "👑", desc: "Rules All Words (Legendary)", rarity: "legend" },
    { id: "dragon", name: "Ancient Dragon", price: 5000, icon: "🐲", desc: "Fire Breather (Epic)", rarity: "epic" },
    { id: "alien", name: "Alien Scholar", price: 2500, icon: "👽", desc: "Universal Linguist (Rare)", rarity: "rare" },
    { id: "robot", name: "AI Alpha", price: 6000, icon: "🤖", desc: "Word Factory (Legendary)", rarity: "legend" },
    { id: "ghost", name: "Stealth Ghost", price: 1000, icon: "👻", desc: "Invisible Guardian (Common)", rarity: "common" }
];

export const GLOBAL_SKIN_MAP: Record<string, string> = {};
GLOBAL_STORE_ITEMS.forEach(i => GLOBAL_SKIN_MAP[i.id] = i.icon);

export const TIME_LIMIT_MS = 8000;

export interface CEFRLevelData {
    level: string;
    title: string;
    subtitle: string;
    ielts: string;
    toeic: string;
    lexile: string;
    themeColor: string;
}

export interface CEFRLevelConfig {
    id: string;
    label: string;
    range: [number, number];
    color: string;
}

export const CEFR_CONFIG: CEFRLevelConfig[] = [
    { id: 'A1', label: 'Beginner', range: [1, 15], color: '#10b981' },   // Emerald
    { id: 'A2', label: 'Elementary', range: [16, 50], color: '#3b82f6' }, // Blue
    { id: 'B1', label: 'Intermediate', range: [51, 125], color: '#6366f1' }, // Indigo
    { id: 'B2', label: 'Upper-Intermediate', range: [126, 220], color: '#8b5cf6' }, // Purple
    { id: 'C1', label: 'Advanced', range: [221, 300], color: '#f59e0b' }, // Amber
    { id: 'C2', label: 'Mastery', range: [301, 334], color: '#ef4444' }   // Red
];

export const CEFR_MAPPING: Record<string, CEFRLevelData> = {
    A1: { level: 'A1', title: 'Beginner', subtitle: 'Starting Out', ielts: '1.0-2.5', toeic: '120-220', lexile: 'BR-200L', themeColor: 'from-blue-400 to-blue-600' },
    A2: { level: 'A2', title: 'Elementary', subtitle: 'Getting There', ielts: '3.0-3.5', toeic: '225-545', lexile: '200L-500L', themeColor: 'from-sky-400 to-sky-600' },
    B1: { level: 'B1', title: 'Intermediate', subtitle: 'Good Job!', ielts: '4.0-5.0', toeic: '550-780', lexile: '500L-850L', themeColor: 'from-emerald-400 to-emerald-600' },
    B2: { level: 'B2', title: 'Upper-Intermediate', subtitle: 'Great Work!', ielts: '5.5-6.5', toeic: '785-940', lexile: '850L-1050L', themeColor: 'from-indigo-500 to-indigo-700' },
    C1: { level: 'C1', title: 'Advanced', subtitle: 'Excellent!', ielts: '7.0-8.0', toeic: '945-985', lexile: '1050L-1300L', themeColor: 'from-purple-500 to-purple-700' },
    C2: { level: 'C2', title: 'Mastery', subtitle: 'Outstanding!', ielts: '8.5-9.0', toeic: '990+', lexile: '1300L+', themeColor: 'from-amber-400 to-amber-600' },
};
