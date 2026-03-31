Add-Type -AssemblyName System.Drawing
$src = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\media__1772788411395.png"
$dest = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_dev_icon_512.png"
$img = [System.Drawing.Image]::FromFile($src)
$bmp = New-Object System.Drawing.Bitmap(512, 512)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 512, 512)
$bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Host "Resized image saved to: $dest"
