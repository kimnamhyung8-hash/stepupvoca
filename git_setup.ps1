$Git = "C:\Program Files\Git\cmd\git.exe"
& $Git config --global user.name "kimnamhyung8"
& $Git config --global user.email "kimnamhyung8-hash@users.noreply.github.com"
& $Git init
& $Git add .
& $Git commit -m "첫 번째 발사: GitHub 동기화를 위하여"
& $Git branch -M main
& $Git remote add origin https://github.com/kimnamhyung8-hash/stepupvoca.git
Write-Host "이제 GitHub 인증 창이 뜰 수 있습니다! 인증해 주세요!"
& $Git push -u origin main
