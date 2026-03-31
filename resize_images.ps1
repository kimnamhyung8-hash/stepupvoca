Add-Type -AssemblyName System.Drawing
$img_ai = [System.Drawing.Image]::FromFile("C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_feature_graphic_ai_1772789943611.png")
$newImg_ai = New-Object System.Drawing.Bitmap(1024, 500)
$g_ai = [System.Drawing.Graphics]::FromImage($newImg_ai)
$g_ai.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g_ai.DrawImage($img_ai, 0, 0, 1024, 500)
$newImg_ai.Save("C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_feature_ready_1024x500.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g_ai.Dispose()
$img_ai.Dispose()
$newImg_ai.Dispose()

$img_icon = [System.Drawing.Image]::FromFile("C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_icon_ai_1772789997593.png")
$newImg_icon = New-Object System.Drawing.Bitmap(512, 512)
$g_icon = [System.Drawing.Graphics]::FromImage($newImg_icon)
$g_icon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g_icon.DrawImage($img_icon, 0, 0, 512, 512)
$newImg_icon.Save("C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_icon_ready_512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g_icon.Dispose()
$img_icon.Dispose()
$newImg_icon.Dispose()

Write-Host "Images resized successfully to 1024x500 and 512x512."
