param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$assetsRoot = Join-Path $ProjectRoot "assets"
$cardMappingPath = Join-Path $ProjectRoot "src\data\cardAssetMapping.json"
$dragonMappingPath = Join-Path $ProjectRoot "src\data\dragonAssetMapping.json"
$cardMapping = Get-Content -Raw -Path $cardMappingPath | ConvertFrom-Json
$dragonMapping = Get-Content -Raw -Path $dragonMappingPath | ConvertFrom-Json

$requiredDirectories = @(
    "assets\ui",
    "assets\audio",
    "assets\audio\music",
    "assets\audio\sfx",
    "assets\cards",
    "assets\backgrounds",
    "assets\characters",
    "assets\dragons",
    "assets\vfx",
    "assets\sfx",
    "assets\music"
)

foreach ($relativeDir in $requiredDirectories) {
    New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot $relativeDir) | Out-Null
}

function New-Bitmap {
    param([int]$Width, [int]$Height)
    return [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Save-Png {
    param([System.Drawing.Bitmap]$Bitmap, [string]$Path)
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $Bitmap.Dispose()
}

function New-Graphics {
    param([System.Drawing.Bitmap]$Bitmap)
    $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    return $graphics
}

function Draw-CenteredText {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string]$Text,
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Size,
        [System.Drawing.Color]$Color
    )
    $font = [System.Drawing.Font]::new("Comic Sans MS", $Size, [System.Drawing.FontStyle]::Bold)
    $brush = [System.Drawing.SolidBrush]::new($Color)
    $format = [System.Drawing.StringFormat]::new()
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $Graphics.DrawString($Text, $font, $brush, [System.Drawing.RectangleF]::new($X, $Y, $Width, $Height), $format)
    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

function Draw-DragonSilhouette {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$CenterX,
        [float]$CenterY,
        [float]$Scale,
        [System.Drawing.Color]$Fill,
        [System.Drawing.Color]$Stroke
    )
    $fillBrush = [System.Drawing.SolidBrush]::new($Fill)
    $strokePen = [System.Drawing.Pen]::new($Stroke, [Math]::Max(2, 5 * $Scale))
    $Graphics.FillEllipse($fillBrush, $CenterX - (120 * $Scale), $CenterY - (35 * $Scale), 240 * $Scale, 92 * $Scale)
    $Graphics.FillEllipse($fillBrush, $CenterX - (165 * $Scale), $CenterY - (65 * $Scale), 90 * $Scale, 70 * $Scale)
    $wingOne = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new($CenterX - (35 * $Scale), $CenterY - (35 * $Scale)),
        [System.Drawing.PointF]::new($CenterX + (30 * $Scale), $CenterY - (145 * $Scale)),
        [System.Drawing.PointF]::new($CenterX + (72 * $Scale), $CenterY - (32 * $Scale))
    )
    $wingTwo = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new($CenterX + (35 * $Scale), $CenterY - (28 * $Scale)),
        [System.Drawing.PointF]::new($CenterX + (165 * $Scale), $CenterY - (120 * $Scale)),
        [System.Drawing.PointF]::new($CenterX + (150 * $Scale), $CenterY + (35 * $Scale))
    )
    $Graphics.FillPolygon($fillBrush, $wingOne)
    $Graphics.FillPolygon($fillBrush, $wingTwo)
    $hornBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(242, 193, 78))
    $hornOne = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new($CenterX - (195 * $Scale), $CenterY - (95 * $Scale)),
        [System.Drawing.PointF]::new($CenterX - (178 * $Scale), $CenterY - (145 * $Scale)),
        [System.Drawing.PointF]::new($CenterX - (155 * $Scale), $CenterY - (88 * $Scale))
    )
    $hornTwo = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new($CenterX - (150 * $Scale), $CenterY - (102 * $Scale)),
        [System.Drawing.PointF]::new($CenterX - (126 * $Scale), $CenterY - (152 * $Scale)),
        [System.Drawing.PointF]::new($CenterX - (114 * $Scale), $CenterY - (82 * $Scale))
    )
    $Graphics.FillPolygon($hornBrush, $hornOne)
    $Graphics.FillPolygon($hornBrush, $hornTwo)
    $eyeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 247, 223))
    $Graphics.FillEllipse($eyeBrush, $CenterX - (170 * $Scale), $CenterY - (67 * $Scale), 14 * $Scale, 14 * $Scale)
    $Graphics.DrawLine($strokePen, $CenterX + (110 * $Scale), $CenterY + (38 * $Scale), $CenterX + (200 * $Scale), $CenterY + (84 * $Scale))
    $eyeBrush.Dispose()
    $hornBrush.Dispose()
    $strokePen.Dispose()
    $fillBrush.Dispose()
}

function New-DragonPlaceholder {
    param([string]$Name, [string]$Path)
    $bitmap = New-Bitmap -Width 512 -Height 360
    $graphics = New-Graphics $bitmap
    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 247, 223))
    Draw-DragonSilhouette -Graphics $graphics -CenterX 256 -CenterY 180 -Scale 0.88 -Fill ([System.Drawing.Color]::FromArgb(106, 153, 78)) -Stroke ([System.Drawing.Color]::FromArgb(56, 102, 65))
    Draw-CenteredText -Graphics $graphics -Text $Name -X 36 -Y 292 -Width 440 -Height 50 -Size 22 -Color ([System.Drawing.Color]::FromArgb(23, 25, 35))
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(23, 25, 35), 4)
    $graphics.DrawRectangle($pen, 2, 2, 507, 355)
    $pen.Dispose()
    $graphics.Dispose()
    Save-Png -Bitmap $bitmap -Path $Path
}

function New-CharacterAsset {
    param([string]$Name, [string]$Label, [string]$Path, [float]$Scale = 1.0)
    $bitmap = New-Bitmap -Width 256 -Height 340
    $graphics = New-Graphics $bitmap
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(23, 25, 35), 12)
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(23, 25, 35))
    $originY = if ($Scale -lt 1) { 92 } else { 72 }
    $graphics.DrawEllipse($pen, 94, $originY - 34, 68, 68)
    $graphics.DrawLine($pen, 128, $originY + 34, 128, $originY + 146)
    $graphics.DrawLine($pen, 128, $originY + 68, 70, $originY + 106)
    $graphics.DrawLine($pen, 128, $originY + 68, 186, $originY + 106)
    $graphics.DrawLine($pen, 128, $originY + 146, 82, $originY + 236)
    $graphics.DrawLine($pen, 128, $originY + 146, 174, $originY + 236)
    $eyeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 247, 223))
    $graphics.FillEllipse($eyeBrush, 111, $originY - 10, 10, 10)
    $graphics.FillEllipse($eyeBrush, 135, $originY - 10, 10, 10)
    Draw-CenteredText -Graphics $graphics -Text $Label -X 88 -Y ($originY + 72) -Width 80 -Height 44 -Size 30 -Color ([System.Drawing.Color]::FromArgb(23, 25, 35))
    $eyeBrush.Dispose()
    $brush.Dispose()
    $pen.Dispose()
    $graphics.Dispose()
    Save-Png -Bitmap $bitmap -Path $Path
}

function New-BackgroundAsset {
    param([string]$Name, [string]$Path, [System.Drawing.Color]$Sky, [System.Drawing.Color]$Ground)
    $bitmap = New-Bitmap -Width 1920 -Height 1080
    $graphics = New-Graphics $bitmap
    $graphics.Clear($Sky)
    $groundBrush = [System.Drawing.SolidBrush]::new($Ground)
    $graphics.FillRectangle($groundBrush, 0, 650, 1920, 430)
    $softBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(150, 255, 247, 223))
    $graphics.FillEllipse($softBrush, 250, 140, 180, 90)
    $graphics.FillEllipse($softBrush, 1220, 180, 240, 105)
    Draw-CenteredText -Graphics $graphics -Text $Name -X 460 -Y 430 -Width 1000 -Height 120 -Size 58 -Color ([System.Drawing.Color]::FromArgb(23, 25, 35))
    $softBrush.Dispose()
    $groundBrush.Dispose()
    $graphics.Dispose()
    Save-Png -Bitmap $bitmap -Path $Path
}

function New-CardAsset {
    param([string]$Rank, [string]$Suit, [string]$DragonName, [string]$Path)
    $bitmap = New-Bitmap -Width 300 -Height 420
    $graphics = New-Graphics $bitmap
    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 255))
    $borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(23, 25, 35), 8)
    $graphics.DrawRectangle($borderPen, 6, 6, 288, 408)
    $isRed = $Suit -eq "Hearts" -or $Suit -eq "Diamonds"
    $ink = if ($isRed) { [System.Drawing.Color]::FromArgb(176, 42, 42) } else { [System.Drawing.Color]::FromArgb(23, 25, 35) }
    $symbol = switch ($Suit) {
        "Hearts" { "♥" }
        "Diamonds" { "♦" }
        "Clubs" { "♣" }
        "Spades" { "♠" }
    }
    Draw-CenteredText -Graphics $graphics -Text $Rank -X 18 -Y 18 -Width 58 -Height 42 -Size 24 -Color $ink
    Draw-CenteredText -Graphics $graphics -Text $symbol -X 18 -Y 58 -Width 58 -Height 42 -Size 24 -Color $ink
    Draw-CenteredText -Graphics $graphics -Text $Rank -X 224 -Y 360 -Width 58 -Height 42 -Size 24 -Color $ink
    Draw-CenteredText -Graphics $graphics -Text $symbol -X 224 -Y 320 -Width 58 -Height 42 -Size 24 -Color $ink
    Draw-DragonSilhouette -Graphics $graphics -CenterX 150 -CenterY 212 -Scale 0.52 -Fill ([System.Drawing.Color]::FromArgb(106, 153, 78)) -Stroke ([System.Drawing.Color]::FromArgb(56, 102, 65))
    Draw-CenteredText -Graphics $graphics -Text $DragonName -X 30 -Y 274 -Width 240 -Height 46 -Size 18 -Color ([System.Drawing.Color]::FromArgb(23, 25, 35))
    $borderPen.Dispose()
    $graphics.Dispose()
    Save-Png -Bitmap $bitmap -Path $Path
}

$created = New-Object System.Collections.Generic.List[string]
$placeholders = New-Object System.Collections.Generic.List[string]
$missing = New-Object System.Collections.Generic.List[object]
$failed = New-Object System.Collections.Generic.List[object]

$dragonDir = Join-Path $assetsRoot "dragons"
foreach ($dragonName in $dragonMapping.dragons.PSObject.Properties.Name) {
    $file = Join-Path $dragonDir "$($dragonName)_PLACEHOLDER.png"
    try {
        New-DragonPlaceholder -Name $dragonName -Path $file
        $relative = "assets/dragons/$($dragonName)_PLACEHOLDER.png"
        $created.Add($relative)
        $placeholders.Add($relative)
        $missing.Add([ordered]@{
            requested = "assets/dragons/$dragonName.png"
            fallback = $relative
            reason = "External image was not bundled; generated local placeholder."
        })
    } catch {
        $failed.Add([ordered]@{ asset = $file; error = $_.Exception.Message })
    }
}

$characterDir = Join-Path $assetsRoot "characters"
New-CharacterAsset -Name "Cameldo" -Label "7" -Path (Join-Path $characterDir "Cameldo.png")
New-CharacterAsset -Name "Pessy" -Label "10" -Path (Join-Path $characterDir "Pessy.png") -Scale 0.9
New-CharacterAsset -Name "Dealer" -Label "$" -Path (Join-Path $characterDir "Dealer.png")
$created.Add("assets/characters/Cameldo.png")
$created.Add("assets/characters/Pessy.png")
$created.Add("assets/characters/Dealer.png")

$backgrounds = @(
    @{ Name = "Football Field"; File = "FootballField.png"; Sky = [System.Drawing.Color]::FromArgb(189, 224, 254); Ground = [System.Drawing.Color]::FromArgb(149, 213, 178) },
    @{ Name = "Sky Kidnap"; File = "SkyKidnap.png"; Sky = [System.Drawing.Color]::FromArgb(167, 216, 255); Ground = [System.Drawing.Color]::FromArgb(143, 207, 136) },
    @{ Name = "Shanghai Bund"; File = "ShanghaiBund.png"; Sky = [System.Drawing.Color]::FromArgb(157, 209, 241); Ground = [System.Drawing.Color]::FromArgb(77, 150, 184) },
    @{ Name = "Casino Room"; File = "CasinoRoom.png"; Sky = [System.Drawing.Color]::FromArgb(43, 45, 66); Ground = [System.Drawing.Color]::FromArgb(141, 36, 64) },
    @{ Name = "FreeDumb Land"; File = "FreeDumbLand.png"; Sky = [System.Drawing.Color]::FromArgb(189, 224, 254); Ground = [System.Drawing.Color]::FromArgb(149, 213, 178) },
    @{ Name = "Battle Field"; File = "BattleField.png"; Sky = [System.Drawing.Color]::FromArgb(86, 98, 70); Ground = [System.Drawing.Color]::FromArgb(58, 63, 48) },
    @{ Name = "Dice Table"; File = "DiceTable.png"; Sky = [System.Drawing.Color]::FromArgb(90, 53, 32); Ground = [System.Drawing.Color]::FromArgb(122, 74, 45) },
    @{ Name = "Main Menu"; File = "MainMenu.png"; Sky = [System.Drawing.Color]::FromArgb(189, 224, 254); Ground = [System.Drawing.Color]::FromArgb(149, 213, 178) },
    @{ Name = "Credits"; File = "Credits.png"; Sky = [System.Drawing.Color]::FromArgb(0, 0, 0); Ground = [System.Drawing.Color]::FromArgb(0, 0, 0) },
    @{ Name = "Hidden Ending"; File = "HiddenEnding.png"; Sky = [System.Drawing.Color]::FromArgb(0, 0, 0); Ground = [System.Drawing.Color]::FromArgb(0, 0, 0) }
)
$backgroundDir = Join-Path $assetsRoot "backgrounds"
foreach ($background in $backgrounds) {
    $file = Join-Path $backgroundDir $background.File
    New-BackgroundAsset -Name $background.Name -Path $file -Sky $background.Sky -Ground $background.Ground
    $created.Add("assets/backgrounds/$($background.File)")
}

$cardsDir = Join-Path $assetsRoot "cards"
$resolvedCardsDir = (Resolve-Path $cardsDir).Path
if (-not $resolvedCardsDir.StartsWith((Resolve-Path $assetsRoot).Path)) {
    throw "Refusing to clean card directory outside assets root: $resolvedCardsDir"
}
Get-ChildItem -Path $cardsDir -File -Filter "*.png" | Remove-Item -Force

foreach ($rank in $cardMapping.ranks) {
    $dragonName = $cardMapping.rankToDragon.$rank
    foreach ($suit in $cardMapping.suits) {
        $fileName = "$($rank)_$($suit)_$($dragonName).png"
        New-CardAsset -Rank $rank -Suit $suit -DragonName $dragonName -Path (Join-Path $cardsDir $fileName)
        $created.Add("assets/cards/$fileName")
    }
}

$audioAliases = @{
    "assets/audio/music/main_menu.wav" = "assets/audio/bgm/main_menu.wav"
    "assets/audio/music/visual_novel.wav" = "assets/audio/bgm/visual_novel.wav"
    "assets/audio/music/blackjack.wav" = "assets/audio/bgm/blackjack.wav"
    "assets/audio/music/battle.wav" = "assets/audio/bgm/battle.wav"
    "assets/audio/music/ending.wav" = "assets/audio/bgm/ending.wav"
    "assets/music/main_menu.wav" = "assets/audio/bgm/main_menu.wav"
    "assets/music/visual_novel.wav" = "assets/audio/bgm/visual_novel.wav"
    "assets/music/blackjack.wav" = "assets/audio/bgm/blackjack.wav"
    "assets/music/battle.wav" = "assets/audio/bgm/battle.wav"
    "assets/music/ending.wav" = "assets/audio/bgm/ending.wav"
    "assets/audio/sfx/attack.wav" = "assets/audio/sfx/first_fight_attack.wav"
    "assets/audio/sfx/correct_input.wav" = "assets/audio/sfx/last_fight_correct.wav"
    "assets/audio/sfx/wrong_input.wav" = "assets/audio/sfx/last_fight_wrong.wav"
    "assets/audio/sfx/round_complete.wav" = "assets/audio/sfx/last_fight_complete.wav"
    "assets/audio/sfx/victory.wav" = "assets/audio/sfx/blackjack_victory.wav"
    "assets/sfx/card_draw.wav" = "assets/audio/sfx/card_draw.wav"
    "assets/sfx/card_flip.wav" = "assets/audio/sfx/card_flip.wav"
    "assets/sfx/dice_roll.wav" = "assets/audio/sfx/dice_roll.wav"
    "assets/sfx/dice_stop.wav" = "assets/audio/sfx/dice_stop.wav"
    "assets/sfx/attack.wav" = "assets/audio/sfx/first_fight_attack.wav"
    "assets/sfx/correct_input.wav" = "assets/audio/sfx/last_fight_correct.wav"
    "assets/sfx/wrong_input.wav" = "assets/audio/sfx/last_fight_wrong.wav"
    "assets/sfx/round_complete.wav" = "assets/audio/sfx/last_fight_complete.wav"
    "assets/sfx/button_click.wav" = "assets/audio/sfx/button_click.wav"
    "assets/sfx/button_hover.wav" = "assets/audio/sfx/button_hover.wav"
    "assets/sfx/victory.wav" = "assets/audio/sfx/blackjack_victory.wav"
    "assets/sfx/scene_transition.wav" = "assets/audio/sfx/scene_transition.wav"
}

foreach ($entry in $audioAliases.GetEnumerator()) {
    $target = Join-Path $ProjectRoot $entry.Key
    $source = Join-Path $ProjectRoot $entry.Value
    if (Test-Path $source) {
        Copy-Item -Force -Path $source -Destination $target
        $created.Add($entry.Key)
    } else {
        $missing.Add([ordered]@{ requested = $entry.Key; fallback = $null; reason = "Source audio alias missing: $($entry.Value)" })
    }
}

$allAssets = Get-ChildItem -Path $assetsRoot -Recurse -File | ForEach-Object {
    $_.FullName.Substring($ProjectRoot.Length + 1).Replace("\", "/")
} | Sort-Object

$cardFiles = Get-ChildItem -Path $cardsDir -File -Filter "*.png" | Select-Object -ExpandProperty Name | Sort-Object
$expectedCards = foreach ($rank in $cardMapping.ranks) {
    $dragonName = $cardMapping.rankToDragon.$rank
    foreach ($suit in $cardMapping.suits) {
        "$($rank)_$($suit)_$($dragonName).png"
    }
}

foreach ($expectedCard in $expectedCards) {
    if ($cardFiles -notcontains $expectedCard) {
        $failed.Add([ordered]@{ asset = "assets/cards/$expectedCard"; error = "Expected card was not generated." })
    }
}

$report = [System.Collections.Specialized.OrderedDictionary]::new()
$report["generatedAt"] = (Get-Date).ToUniversalTime().ToString("o")
$report["totalAssets"] = $allAssets.Count
$report["totalCards"] = $cardFiles.Count
$report["requiredCards"] = $expectedCards.Count
$report["missingAssets"] = [object[]]$missing.ToArray()
$report["placeholderAssets"] = [object[]]$placeholders.ToArray()
$report["failedImports"] = [object[]]$failed.ToArray()
$report["successfulImports"] = @($allAssets)
$report["cardMapping"] = $cardMapping
$report["dragonMapping"] = $dragonMapping

$reportPath = Join-Path $ProjectRoot "asset_report.json"
$report | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -Path $reportPath
Write-Host "Asset pipeline complete: $($allAssets.Count) assets, $($cardFiles.Count) cards, $($failed.Count) failed imports."
