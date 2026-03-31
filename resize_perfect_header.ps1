Add-Type -AssemblyName System.Drawing
$src = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\media__1772802403566.png"
$dest = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72\vocaquest_dev_header_perfect_4096.jpg"

$img = [System.Drawing.Image]::FromFile($src)
$bmp = New-Object System.Drawing.Bitmap(4096, 2304)
$g = [System.Drawing.Graphics]::FromImage($bmp)

# Set high quality rendering options
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::White) # Base background

# Logic: "Cover" - Fill the 4096x2304 area and center it
$ratio = [Math]::Max(4096 / $img.Width, 2304 / $img.Height)
$newW = $img.Width * $ratio
$newH = $img.Height * $ratio
$posX = (4096 - $newW) / 2
$posY = (2304 - $newH) / 2

$g.DrawImage($img, $posX, $posY, $newW, $newH)

# Save as JPEG with quality adjustment to ensure < 1MB
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80)

$bmp.Save($dest, $encoder, $params)

$g.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Success! Perfect header saved to: $dest"
