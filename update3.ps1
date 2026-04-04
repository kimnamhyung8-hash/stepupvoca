$path = 'd:\antigravity\stepupvoca\app\src\screens\CommunityForumScreen.tsx'
$utf8 = New-Object System.Text.UTF8Encoding $false
$content = [System.IO.File]::ReadAllText($path, $utf8)

$content = $content -replace "lang === 'ko' \? '정말 삭제하시겠습니까\?' : 'Delete comment\?'", "tComm(lang, 'confirm_delete_comment')"
$content = $content -replace "lang === 'ko' \? '댓글을 남겨주세요\.\.\.' : 'Share your kind words\.\.\.'", "tComm(lang, 'leave_comment')"
$content = $content -replace "lang === 'ko' \? '번역 중\.\.\.' : 'Translating\.\.\.'", "tComm(lang, 'translating')"
$content = $content -replace "lang === 'ko' \? '게시글을 삭제하시겠습니까\?' : 'Delete this post\?'", "tComm(lang, 'confirm_delete_post')"

[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Output "Done"