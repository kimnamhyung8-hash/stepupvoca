Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\idouh\.gemini\antigravity\brain\796c7ce5-2f74-4932-a3ab-93b30d0a5315\media__1775780587993.png')
$newImg = New-Object System.Drawing.Bitmap(120, 120)
$graph = [System.Drawing.Graphics]::FromImage($newImg)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph.DrawImage($img, 0, 0, 120, 120)
$newImg.Save('d:\antigravity\stepupvoca\VQ_Logo_120x120.png', [System.Drawing.Imaging.ImageFormat]::Png)
$graph.Dispose()
$newImg.Dispose()
$img.Dispose()
