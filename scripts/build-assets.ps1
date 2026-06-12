param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$officialDirectory = Join-Path $ProjectRoot "assets\dragons\official"
$requiredDragons = @("Fire", "Wind", "Earth", "Water", "Plant", "Metal", "Energy", "Void", "Light", "Shadow", "ToyFairy", "Vulpine", "Darkfire", "StarStripeDragon")
$missingDragonFiles = @($requiredDragons | Where-Object { -not (Test-Path (Join-Path $officialDirectory "$_.png")) })

if ($missingDragonFiles.Count -gt 0) {
    & (Join-Path $PSScriptRoot "retrieve-official-dragon-art.ps1") -ProjectRoot $ProjectRoot
}

& (Join-Path $PSScriptRoot "build-card-deck.ps1") -ProjectRoot $ProjectRoot

$requiredAssets = @(
    "assets/characters/Cameldo.png",
    "assets/characters/Pessy.png",
    "assets/characters/Dealer.png",
    "assets/dragons/star_stripe_adult.png",
    "assets/cards/Ancient_Card_Back.png",
    "assets/backgrounds/FootballField.webp",
    "assets/backgrounds/SkyKidnap.webp",
    "assets/backgrounds/ShanghaiBund.webp",
    "assets/backgrounds/CasinoRoom.webp",
    "assets/backgrounds/BlackjackTable.webp",
    "assets/backgrounds/FreeDumbLand.webp",
    "assets/backgrounds/BattleField.webp",
    "assets/backgrounds/DiceTable.webp",
    "assets/backgrounds/MainMenu.webp"
)

$missingAssets = @($requiredAssets | Where-Object { -not (Test-Path (Join-Path $ProjectRoot $_)) })
$cardFiles = @(Get-ChildItem -Path (Join-Path $ProjectRoot "assets\cards\deck") -File -Filter "*.png")
$placeholderCards = @($cardFiles | Where-Object { $_.Name -match "PLACEHOLDER" })
$failedImports = New-Object System.Collections.Generic.List[object]

foreach ($missingAsset in $missingAssets) {
    $failedImports.Add([ordered]@{ asset = $missingAsset; error = "Required Build 11.6 asset is missing." })
}

if ($cardFiles.Count -ne 52) {
    $failedImports.Add([ordered]@{ asset = "assets/cards/deck"; error = "Expected 52 cards, found $($cardFiles.Count)." })
}

if ($placeholderCards.Count -gt 0) {
    $failedImports.Add([ordered]@{ asset = "assets/cards/deck"; error = "Placeholder cards are not permitted." })
}

$allAssets = @(Get-ChildItem -Path (Join-Path $ProjectRoot "assets") -Recurse -File | ForEach-Object {
    $_.FullName.Substring($ProjectRoot.Length + 1).Replace("\", "/")
} | Sort-Object)

$officialReportPath = Join-Path $ProjectRoot "assets\dragons\official-assets.json"
$officialReport = if (Test-Path $officialReportPath) { Get-Content -Raw $officialReportPath | ConvertFrom-Json } else { @() }
$officialAdultCount = ($officialReport | Where-Object { $_.status -eq "retrieved" } | Measure-Object).Count
$mapping = Get-Content -Raw (Join-Path $ProjectRoot "src\data\cardAssetMapping.json") | ConvertFrom-Json

$report = [ordered]@{
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    build = "11.6"
    totalAssets = $allAssets.Count
    totalCards = $cardFiles.Count
    requiredCards = 52
    officialAdultDragonAssets = $officialAdultCount
    missingAssets = @($missingAssets)
    placeholderAssets = @()
    failedImports = [object[]]$failedImports.ToArray()
    successfulImports = $allAssets
    cardMapping = $mapping
    dragonAssets = $officialReport
}

$report | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -Path (Join-Path $ProjectRoot "asset_report.json")

if ($failedImports.Count -gt 0) {
    throw "Build 11.6 asset validation failed with $($failedImports.Count) issue(s)."
}

Write-Host "Build 11.6 assets validated: $($cardFiles.Count) cards, $(@($officialReport).Count) official adult dragons."
