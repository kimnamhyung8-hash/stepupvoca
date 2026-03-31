const fs = require('fs');
const p = 'd:/antigravity/stepupvoca/app/src/screens/CommunityForumScreen.tsx';
let txt = fs.readFileSync(p, 'utf8');

// Replacements
txt = txt.replace(/lang === 'ko' \? '게시글을 불러올 권한이 없습니다\.' : 'Permission denied to load posts\.'/g, "tComm(lang, 'err_permission')");
txt = txt.replace(/lang === 'ko' \? '게시글을 불러오는 중 오류가 발생했습니다\.' : 'Error loading posts\.'/g, "tComm(lang, 'err_load_posts')");
txt = txt.replace(/\(lang === 'ko' \? '게시글 수정' : 'Edit Post'\)/g, "tComm(lang, 'edit_post')");
txt = txt.replace(/\(lang === 'ko' \? '게시글 작성' : 'New Post'\)/g, "tComm(lang, 'new_post')");
txt = txt.replace(/\(lang === 'ko' \? '상세보기' : 'Detail'\)/g, "tComm(lang, 'post_detail')");
txt = txt.replace(/lang === 'ko' \? '글쓰기' : 'Write'/g, "tComm(lang, 'write')");
txt = txt.replace(/lang === 'ko' \? '댓글' : 'Comments'/g, "tComm(lang, 'comments')");
txt = txt.replace(/lang === 'ko' \? '댓글을 남겨주세요\.\.\.' : 'Leave a comment\.\.\.'/g, "tComm(lang, 'leave_comment')");
txt = txt.replace(/lang === 'ko' \? '게시글 올리기' : 'Publish Post'/g, "tComm(lang, 'publish_post')");
txt = txt.replace(/lang === 'ko' \? '게시물 저장 중\.\.\.' : 'Saving Post\.\.\.'/g, "tComm(lang, 'saving_post')");
txt = txt.replace(/lang === 'ko' \? '제목을 입력해 주세요' : 'Enter Post Title'/g, "tComm(lang, 'enter_title')");
txt = txt.replace(/lang === 'ko' \? '이미지' : 'Image'/g, "tComm(lang, 'image')");
txt = txt.replace(/lang === 'ko' \? '영상' : 'Video'/g, "tComm(lang, 'video')");
txt = txt.replace(/lang === 'ko' \? group\.label_ko : group\.label_en/g, "tComm(lang, group.label_key || '')");

// Import
if (!txt.includes('tComm')) {
    txt = txt.replace("import { getFlagEmoji } from '../utils/langUtils';", "import { getFlagEmoji } from '../utils/langUtils';\nimport { tComm } from '../i18n/communityTranslations';");
}

fs.writeFileSync(p, txt);
console.log('Done');
