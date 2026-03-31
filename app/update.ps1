$path = 'd:\antigravity\stepupvoca\app\src\screens\CommunityForumScreen.tsx'
$utf8 = New-Object System.Text.UTF8Encoding $false
$content = [System.IO.File]::ReadAllText($path, $utf8)

$content = $content -replace "label_ko: '메인 소통방',\s*label_en: 'Main Lounge',", "label_key: 'cat_group_main',"
$content = $content -replace "name_ko: '전체 피드',\s*name_en: 'All Feeds'", "name_key: 'cat_all'"
$content = $content -replace "name_ko: '실시간 베스트',\s*name_en: 'Hot Issues'", "name_key: 'cat_hot'"
$content = $content -replace "name_ko: '자유/일상',\s*name_en: 'Free Talk'", "name_key: 'cat_free'"
$content = $content -replace "name_ko: '영어 Q&A 및 학습 팁',\s*name_en: 'Study & Tips'", "name_key: 'cat_study'"
$content = $content -replace "name_ko: '미디어/숏폼',\s*name_en: 'Media & Shorts'", "name_key: 'cat_media'"
$content = $content -replace "name_ko: '언어 교환/친구 찾기',\s*name_en: 'Language Exchange'", "name_key: 'cat_exchange'"
$content = $content -replace "name_ko: '홍보/건의사항',\s*name_en: 'Promo & Feedback'", "name_key: 'cat_promo'"

$content = $content -replace "\(lang === 'ko' \? '게시글을 불러올 권한이 없습니다\.' : 'Permission denied to load posts\.'\)", "tComm(lang, 'err_permission')"
$content = $content -replace "\(lang === 'ko' \? '게시글을 불러오는 중 오류가 발생했습니다\.' : 'Error loading posts\.'\)", "tComm(lang, 'err_load_posts')"

$content = $content -replace "\(lang === 'ko' \? '게시글 수정' : 'Edit Post'\)", "tComm(lang, 'edit_post')"
$content = $content -replace "\(lang === 'ko' \? '게시글 작성' : 'New Post'\)", "tComm(lang, 'new_post')"
$content = $content -replace "\(lang === 'ko' \? '상세보기' : 'Detail'\)", "tComm(lang, 'post_detail')"

$content = $content -replace "lang === 'ko' \? group\.label_ko : group\.label_en", "tComm(lang, String(group.label_key))"

$content = $content -replace "lang === 'ko' \? '글쓰기' : 'Write'", "tComm(lang, 'new_post')"
$content = $content -replace "lang === 'ko' \? '게시글 올리기' : 'Publish Post'", "tComm(lang, 'publish_post')"
$content = $content -replace "lang === 'ko' \? '게시물 저장 중\.\.\.' : 'Saving Post\.\.\.'", "tComm(lang, 'saving_post')"
$content = $content -replace "lang === 'ko' \? '제목을 입력해 주세요' : 'Enter Post Title'", "tComm(lang, 'enter_title')"
$content = $content -replace "lang === 'ko' \? '이미지' : 'Image'", "tComm(lang, 'image')"
$content = $content -replace "lang === 'ko' \? '영상' : 'Video'", "tComm(lang, 'video')"
$content = $content -replace "lang === 'ko' \? '댓글' : 'Comments'", "tComm(lang, 'comments')"
$content = $content -replace "lang === 'ko' \? '댓글을 남겨주세요\.\.\.' : 'Leave a comment\.\.\.'", "tComm(lang, 'leave_comment')"

[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Output "Done"