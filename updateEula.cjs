const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src', 'i18n', 'ko.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// Update ko.ts Terms of Service
const koOldUGC = `제 7 조 (사용자 생성 콘텐츠 - UGC 정책)
1. 이용자가 게시한 게시물(라이브챗 등)에 대한 책임은 이용자 본인에게 있습니다. 공공질서 및 미풍양속에 반하는 게시물은 사전 통보 없이 삭제될 수 있습니다.
2. 회사는 부적절한 콘텐츠 모니터링 및 신고 기능을 상시 운영하여 안전한 환경을 유지합니다.`;

const koNewUGC = `제 7 조 (사용자 생성 콘텐츠 - UGC 정책 및 무관용 원칙)
1. 이용자가 게시한 게시물(커뮤니티 게시판, 라이브챗, 프로필 이미지 등 모든 UGC)에 대한 책임은 이용자 본인에게 있습니다.
2. 회사는 불쾌감을 주는 콘텐츠(음란물, 폭력, 혐오 조장 등) 및 악성 사용자에 대해 **무관용 원칙(Zero-tolerance)**을 적용합니다. 이를 위반하는 콘텐츠 및 사용자는 사전 통보 없이 삭제 및 영구 차단될 수 있습니다.
3. 이용자는 불쾌한 게시물 또는 댓글을 발견할 경우 즉시 '신고'하거나 해당 작성자를 '차단'할 권리가 있으며, 회사는 신고를 접수한 지 24시간 이내에 상황을 검토하고 불쾌한 콘텐츠를 삭제할 것을 약속합니다.`;

content = content.replace(koOldUGC, koNewUGC);
fs.writeFileSync(targetPath, content, 'utf8');

// Also update English, Japanese, etc. Let's do en.ts
const targetPathEn = path.join(__dirname, 'src', 'i18n', 'en.ts');
if(fs.existsSync(targetPathEn)) {
    let contentEn = fs.readFileSync(targetPathEn, 'utf8');
    const enOldUGC = `Article 7 (User Generated Content - UGC Policy)
1. Users are solely responsible for logs they post (Live Chat, etc.). Posts that violate public order and morals may be deleted without prior notice.
2. The Company maintains a safe environment by constantly operating monitoring and reporting functions for inappropriate content.`;
    
    const enNewUGC = `Article 7 (User Generated Content - UGC Policy and Zero-Tolerance)
1. Users are solely responsible for all User Generated Content (UGC) they post, including community forum posts, live chat messages, and profile images.
2. The Company enforces a strict **Zero-Tolerance policy** against objectionable content (including but not limited to pornography, violence, and hate speech) and abusive users. Content and users violating this policy will be immediately deleted and permanently banned without prior notice.
3. Users have the right to immediately 'Report' objectionable content or 'Block' abusive users. The Company commits to reviewing reports within 24 hours of receipt and removing any objectionable content.`;

    contentEn = contentEn.replace(enOldUGC, enNewUGC);
    fs.writeFileSync(targetPathEn, contentEn, 'utf8');
}

console.log("EULA updated successfully in ko.ts and en.ts");
