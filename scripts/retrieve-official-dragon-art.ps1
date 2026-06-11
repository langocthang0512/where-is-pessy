param(
    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$dragonDirectory = Join-Path $ProjectRoot "assets\dragons\official"
New-Item -ItemType Directory -Force -Path $dragonDirectory | Out-Null

$dragons = @(
    @{ Name = "Fire"; File = "Fire_Dragon.png"; Wiki = "Fire_Dragon" },
    @{ Name = "Wind"; File = "Wind_Dragon.png"; Wiki = "Wind_Dragon" },
    @{ Name = "Earth"; File = "Earth_Dragon.png"; Wiki = "Earth_Dragon" },
    @{ Name = "Water"; File = "Water_Dragon.png"; Wiki = "Water_Dragon" },
    @{ Name = "Plant"; File = "Plant_Dragon.png"; Wiki = "Plant_Dragon" },
    @{ Name = "Metal"; File = "Metal_Dragon.png"; Wiki = "Metal_Dragon" },
    @{ Name = "Energy"; File = "Energy_Dragon.png"; Wiki = "Energy_Dragon" },
    @{ Name = "Void"; File = "Void_Dragon.png"; Wiki = "Void_Dragon" },
    @{ Name = "Light"; File = "Light_Dragon.png"; Wiki = "Light_Dragon" },
    @{ Name = "Shadow"; File = "Shadow_Dragon.png"; Wiki = "Shadow_Dragon" },
    @{ Name = "ToyFairy"; File = "Toy_Fairy_Dragon.png"; Wiki = "Toy_Fairy_Dragon" },
    @{ Name = "Vulpine"; File = "Vulpine_Dragon.png"; Wiki = "Vulpine_Dragon" },
    @{ Name = "Darkfire"; File = "Darkfire_Dragon.png"; Wiki = "Darkfire_Dragon" },
    @{ Name = "StarStripeDragon"; File = "Starstripe_Dragon.png"; Wiki = "Starstripe_Dragon" }
)

$report = New-Object System.Collections.Generic.List[object]

foreach ($dragon in $dragons) {
    $sourceUrl = "https://dragonmania.net/assets/images/dragons/adult/$($dragon.File)"
    $wikiUrl = "https://www.dragon-mania-legends.wiki/wiki/$($dragon.Wiki)"
    $destination = Join-Path $dragonDirectory "$($dragon.Name).png"

    try {
        Invoke-WebRequest -Uri $sourceUrl -OutFile $destination -UseBasicParsing -TimeoutSec 60
        $file = Get-Item $destination

        if ($file.Length -lt 10000) {
            throw "Downloaded file is unexpectedly small: $($file.Length) bytes."
        }

        $report.Add([ordered]@{
            name = $dragon.Name
            form = "Adult"
            status = "retrieved"
            sourcePage = $wikiUrl
            retrievalUrl = $sourceUrl
            asset = "assets/dragons/official/$($dragon.Name).png"
            bytes = $file.Length
        })
    } catch {
        if (Test-Path $destination) {
            Remove-Item -LiteralPath $destination -Force
        }

        $report.Add([ordered]@{
            name = $dragon.Name
            form = "Adult"
            status = "missing"
            sourcePage = $wikiUrl
            retrievalUrl = $sourceUrl
            asset = $null
            error = $_.Exception.Message
        })
    }
}

$starStripeSource = Join-Path $dragonDirectory "StarStripeDragon.png"
$starStripeTarget = Join-Path $ProjectRoot "assets\dragons\star_stripe_adult.png"
if (Test-Path $starStripeSource) {
    Copy-Item -LiteralPath $starStripeSource -Destination $starStripeTarget -Force
}

$reportPath = Join-Path $ProjectRoot "assets\dragons\official-assets.json"
$report | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -Path $reportPath

$missingCount = @($report | Where-Object { $_.status -ne "retrieved" }).Count
if ($missingCount -gt 0) {
    throw "$missingCount official adult dragon assets could not be retrieved."
}

Write-Host "Retrieved $($report.Count) official adult dragon assets."
