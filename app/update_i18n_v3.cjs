
const fs = require('fs');
const path = require('path');

const keysToAdd = {
    premium: { ko: "프리미엄", en: "PREMIUM", ja: "プレミアム", zh: "高级版", tw: "高級版", vi: "Cao cấp" }
};

const baseDir = 'd:/antigravity/stepupvoca/app/src/i18n';
const langs = ['ko', 'en', 'ja', 'zh', 'tw', 'vi'];

langs.forEach(lang => {
    const filePath = path.join(baseDir, `${lang}.ts`);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.trim();
    if (content.endsWith('};')) {
        content = content.substring(0, content.lastIndexOf('};'));
    }
    Object.entries(keysToAdd).forEach(([key, values]) => {
        const val = values[lang] || values['en'];
        const safeVal = val.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        if (!content.includes(`${key}:`)) {
            content += `    ${key}: "${safeVal}",\n`;
        }
    });
    content += '};\n';
    fs.writeFileSync(filePath, content, 'utf8');
});
