export const getFlagEmoji = (lang: string) => {
    const map: Record<string, string> = {
        ko: '🇰🇷',
        en: '🇺🇸',
        ja: '🇯🇵',
        zh: '🇨🇳',
        tw: '🇹🇼',
        vi: '🇻🇳',
        id: '🇮🇩',
        th: '🇹🇭'
    };
    return map[lang] || '🌐';
};
