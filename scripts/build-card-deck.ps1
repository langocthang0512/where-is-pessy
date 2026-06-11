param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$mappingPath = Join-Path $ProjectRoot "src\data\cardAssetMapping.json"
$mapping = Get-Content -Raw -Path $mappingPath | ConvertFrom-Json
$dragonDirectory = Join-Path $ProjectRoot "assets\dragons\official"
$deckDirectory = Join-Path $ProjectRoot "assets\cards\deck"
New-Item -ItemType Directory -Force -Path $deckDirectory | Out-Null

$expectedDragonNames = $mapping.ranks | ForEach-Object { $mapping.rankToDragon.$_ } | Select-Object -Unique
foreach ($dragonName in $expectedDragonNames) {
    $dragonPath = Join-Path $dragonDirectory "$dragonName.png"
    if (-not (Test-Path $dragonPath)) {
        throw "Missing official adult dragon artwork: $dragonPath"
    }
}

Get-ChildItem -Path $deckDirectory -File -Filter "*.png" | Remove-Item -Force

function New-RoundedRectanglePath {
    param([System.Drawing.RectangleF]$Rectangle, [float]$Radius)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $diameter = $Radius * 2
    $path.AddArc($Rectangle.X, $Rectangle.Y, $diameter, $diameter, 180, 90)
    $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Y, $diameter, $diameter, 270, 90)
    $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Bottom - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($Rectangle.X, $Rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function Draw-CardText {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [System.Drawing.RectangleF]$Bounds,
        [float]$Size,
        [System.Drawing.Color]$Color,
        [System.Drawing.StringAlignment]$Alignment = [System.Drawing.StringAlignment]::Center
    )
    $font = [System.Drawing.Font]::new("Comic Sans MS", $Size, [System.Drawing.FontStyle]::Bold)
    $brush = [System.Drawing.SolidBrush]::new($Color)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = $Alignment
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $Graphics.DrawString($Text, $font, $brush, $Bounds, $format)
    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

function Draw-DragonImage {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.Image]$Image,
        [System.Drawing.RectangleF]$Bounds
    )
    $scale = [Math]::Min($Bounds.Width / $Image.Width, $Bounds.Height / $Image.Height)
    $width = [float]($Image.Width * $scale)
    $height = [float]($Image.Height * $scale)
    $x = $Bounds.X + (($Bounds.Width - $width) / 2)
    $y = $Bounds.Y + (($Bounds.Height - $height) / 2)
    $Graphics.DrawImage($Image, $x, $y, $width, $height)
}

$suitSymbols = @{
    Hearts = [char]0x2665
    Diamonds = [char]0x2666
    Clubs = [char]0x2663
    Spades = [char]0x2660
}

$created = New-Object System.Collections.Generic.List[string]

foreach ($rank in $mapping.ranks) {
    $dragonName = $mapping.rankToDragon.$rank
    $dragonPath = Join-Path $dragonDirectory "$dragonName.png"

    foreach ($suit in $mapping.suits) {
        $bitmap = [System.Drawing.Bitmap]::new(360, 504, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

        $backgroundPath = New-RoundedRectanglePath -Rectangle ([System.Drawing.RectangleF]::new(5, 5, 350, 494)) -Radius 22
        $backgroundBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 251, 239))
        $graphics.FillPath($backgroundBrush, $backgroundPath)

        $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(35, 32, 31), 7)
        $graphics.DrawPath($borderPen, $backgroundPath)
        $innerPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(218, 174, 76), 3)
        $innerPath = New-RoundedRectanglePath -Rectangle ([System.Drawing.RectangleF]::new(17, 17, 326, 470)) -Radius 16
        $graphics.DrawPath($innerPen, $innerPath)

        $isRed = $suit -eq "Hearts" -or $suit -eq "Diamonds"
        $ink = if ($isRed) { [System.Drawing.Color]::FromArgb(190, 57, 61) } else { [System.Drawing.Color]::FromArgb(36, 41, 48) }
        $softInk = if ($isRed) { [System.Drawing.Color]::FromArgb(242, 207, 198) } else { [System.Drawing.Color]::FromArgb(205, 216, 210) }

        $washBrush = [System.Drawing.SolidBrush]::new($softInk)
        $graphics.FillEllipse($washBrush, 66, 94, 228, 276)
        $washPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(110, $ink), 4)
        $graphics.DrawArc($washPen, 51, 80, 258, 305, 15, 310)

        $dragonImage = [System.Drawing.Image]::FromFile($dragonPath)
        Draw-DragonImage -Graphics $graphics -Image $dragonImage -Bounds ([System.Drawing.RectangleF]::new(55, 92, 250, 282))

        $symbol = [string]$suitSymbols[$suit]
        Draw-CardText -Graphics $graphics -Text $rank -Bounds ([System.Drawing.RectangleF]::new(22, 20, 62, 48)) -Size 27 -Color $ink
        Draw-CardText -Graphics $graphics -Text $symbol -Bounds ([System.Drawing.RectangleF]::new(22, 64, 62, 44)) -Size 27 -Color $ink

        $graphics.TranslateTransform(360, 504)
        $graphics.RotateTransform(180)
        Draw-CardText -Graphics $graphics -Text $rank -Bounds ([System.Drawing.RectangleF]::new(22, 20, 62, 48)) -Size 27 -Color $ink
        Draw-CardText -Graphics $graphics -Text $symbol -Bounds ([System.Drawing.RectangleF]::new(22, 64, 62, 44)) -Size 27 -Color $ink
        $graphics.ResetTransform()

        Draw-CardText -Graphics $graphics -Text $dragonName -Bounds ([System.Drawing.RectangleF]::new(48, 397, 264, 42)) -Size 18 -Color ([System.Drawing.Color]::FromArgb(35, 32, 31))
        Draw-CardText -Graphics $graphics -Text "ADULT DRAGON" -Bounds ([System.Drawing.RectangleF]::new(65, 438, 230, 24)) -Size 10 -Color ([System.Drawing.Color]::FromArgb(104, 91, 76))

        $fileName = "$($rank)_$($suit)_$($dragonName).png"
        $outputPath = Join-Path $deckDirectory $fileName
        $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $created.Add("assets/cards/deck/$fileName")

        $dragonImage.Dispose()
        $washPen.Dispose()
        $washBrush.Dispose()
        $innerPath.Dispose()
        $innerPen.Dispose()
        $borderPen.Dispose()
        $backgroundBrush.Dispose()
        $backgroundPath.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

if ($created.Count -ne 52) {
    throw "Expected 52 cards, generated $($created.Count)."
}

$manifest = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    cardCount = $created.Count
    adultArtworkOnly = $true
    placeholders = @()
    cards = @($created)
    mapping = $mapping
}
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -Path (Join-Path $deckDirectory "deck-manifest.json")
Write-Host "Generated $($created.Count) premium cards from official adult dragon artwork."
