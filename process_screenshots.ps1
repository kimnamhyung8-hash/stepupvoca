Add-Type -AssemblyName System.Drawing
$folder = "C:\Users\idouh\.gemini\antigravity\brain\268729fb-f30c-4562-a066-d6ccf325ac72"
$files = Get-ChildItem "$folder\media__1772792206*.png"
$count = 1

foreach ($file in $files) {
    $img = [System.Drawing.Image]::FromFile($file.FullName)
    
    # Crop bars: Top 100, Bottom 150
    $cropY = 100
    $cropH = $img.Height - 250
    $rect = New-Object System.Drawing.Rectangle(0, $cropY, $img.Width, $cropH)
    
    # 1. Phone (1080x1920)
    $phoneImg = New-Object System.Drawing.Bitmap(1080, 1920)
    $g = [System.Drawing.Graphics]::FromImage($phoneImg)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, 1080, 1920)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $phonePath = "$folder\phone_screenshot_$count.png"
    $phoneImg.Save($phonePath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # 2. Tablet (1200x1920)
    $tabletImg = New-Object System.Drawing.Bitmap(1200, 1920)
    $gt = [System.Drawing.Graphics]::FromImage($tabletImg)
    $gt.Clear([System.Drawing.Color]::FromArgb(255, 79, 70, 229)) # #4F46E5
    $gt.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gt.DrawImage($phoneImg, 60, 0, 1080, 1920)
    $tabletPath = "$folder\tablet_screenshot_$count.png"
    $tabletImg.Save($tabletPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    if ($count -eq 1) {
        # Create a new Icon 512x512 from the wizard in screen 1
        $iconImg = New-Object System.Drawing.Bitmap(512, 512)
        $gi = [System.Drawing.Graphics]::FromImage($iconImg)
        $gi.Clear([System.Drawing.Color]::White)
        # Wizard is roughly in the middle top. Let's crop a square around it.
        # Screenshot 1 is 1080x2400-ish? Let's assume wizard is at 400,600
        $wizardRect = New-Object System.Drawing.Rectangle(300, 450, 480, 480)
        $gi.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, 512, 512)), $wizardRect, [System.Drawing.GraphicsUnit]::Pixel)
        $iconImg.Save("$folder\vocaquest_icon_wizard_512.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $gi.Dispose()
        $iconImg.Dispose()

        # Create a Feature Graphic 1024x500
        $featImg = New-Object System.Drawing.Bitmap(1024, 500)
        $gf = [System.Drawing.Graphics]::FromImage($featImg)
        $gf.Clear([System.Drawing.Color]::FromArgb(255, 79, 70, 229))
        $gf.DrawImage($img, (New-Object System.Drawing.Rectangle(600, -200, 600, 1200)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
        $gf.DrawString("VocaQuest", (New-Object System.Drawing.Font("Arial", 60, [System.Drawing.FontStyle]::Bold)), [System.Drawing.Brushes]::White, (New-Object System.Drawing.PointF(50, 200)))
        $featImg.Save("$folder\vocaquest_feature_wizard_1024x500.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $gf.Dispose()
        $featImg.Dispose()
    }

    $g.Dispose()
    $gt.Dispose()
    $phoneImg.Dispose()
    $tabletImg.Dispose()
    $img.Dispose()
    
    $count++
}
Write-Host "Success"
