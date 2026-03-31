$path = 'd:\antigravity\stepupvoca\app\src\screens\CommunityForumScreen.tsx'
$utf8 = New-Object System.Text.UTF8Encoding $false
$content = [System.IO.File]::ReadAllText($path, $utf8)

$content = $content -replace "lang === 'ko' \? '원문보기' : 'Show Original'", "tComm(lang, 'show_original')"
$content = $content -replace "lang === 'ko' \? 'AI 번역' : 'AI Translate'", "tComm(lang, 'ai_translate')"
$content = $content -replace "lang === 'ko' \? '수정' : 'Edit'", "tComm(lang, 'edit')"
$content = $content -replace "lang === 'ko' \? '삭제' : 'Delete'", "tComm(lang, 'delete')"
$content = $content -replace "lang === 'ko' \? '게시글이 삭제되었습니다\.' : 'Post deleted\.'", "tComm(lang, 'alert_post_deleted')"
$content = $content -replace "lang === 'ko' \? '이미지 업로드 중 오류가 발생했습니다\.' : 'Error uploading image\.'", "tComm(lang, 'alert_img_error')"
$content = $content -replace "lang === 'ko' \? '댓글을 작성하는 데 권한이 없습니다\.' : 'Permission denied\.'", "tComm(lang, 'err_permission_comment')"
$content = $content -replace "lang === 'ko' \? '내용을 입력해 주세요\.\.\.' : 'Write your content here\.\.\.'", "tComm(lang, 'write_content_placeholder')"
$content = $content -replace "lang === 'ko' \? '게시물이 없습니다\.' : 'No posts found\.'", "tComm(lang, 'no_posts')"

[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Output "Done"