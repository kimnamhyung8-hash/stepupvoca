Add-Type -AssemblyName System.Drawing
$src = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\media__1772793134267.png"
$dest = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_dev_header_4096.jpg"

$img = [System.Drawing.Image]::FromFile($src)
$bmp = New-Object System.Drawing.Bitmap(4096, 2304)
$g = [System.Drawing.Graphics]::FromImage($bmp)

# Fill background with a color from the image edges or just white/light blue
$g.Clear([System.Drawing.Color]::FromArgb(255, 240, 245, 255)) 

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Calculate scaling to fit without distortion (letterbox) or just stretch
# Given it's a header, stretching usually looks okay if ratios are close, 
# but let's try to fit and center to be professional.
$ratio = [Math]::Max(4096 / $img.Width, 2304 / $img.Height)
$newW = $img.Width * $ratio
$newH = $img.Height * $ratio
$posX = (4096 - $newW) / 2
$posY = (2304 - $newH) / 2

$g.DrawImage($img, $posX, $posY, $newW, $newH)

# Save as JPEG with quality adjustment to stay under 1MB
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 85)

$bmp.Save($dest, $encoder, $params)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Resized header saved to: $dest"
