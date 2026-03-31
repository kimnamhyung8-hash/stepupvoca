
const fs = require('fs');
const path = require('path');

const keysToAdd = {
    about_story: { ko: "회사 소개", en: "About Story", ja: "ストーリーについて", zh: "故事介绍", tw: "故事介紹", vi: "Về chúng tôi" },
    global_community: { ko: "글로벌 커뮤니티", en: "Global Community", ja: "グローバルコミュニティ", zh: "全球社区", tw: "全球社區", vi: "Cộng đồng toàn cầu" },
    success_stories: { ko: "성공 사례", en: "Success Stories", ja: "成功事例", zh: "成功案例", tw: "成功案例", vi: "Câu chuyện thành công" },
    career_opportunities: { ko: "채용 안내", en: "Career Opportunities", ja: "採用情報", zh: "职业机会", tw: "職業機會", vi: "Cơ hội nghề nghiệp" },
    help_center: { ko: "고객 센터", en: "Help Center", ja: "ヘルプセンター", zh: "帮助中心", tw: "幫助中心", vi: "Trung tâm trợ giúp" },
    contact_expert: { ko: "전문가 상담", en: "Contact Expert", ja: "エキスパートに相談", zh: "咨询专家", tw: "諮詢專家", vi: "Liên hệ chuyên gia" }
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
