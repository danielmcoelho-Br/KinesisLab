
$path = 'C:\Users\daniel\.gemini\antigravity\scratch\KinesisLab\src\components\assessment\FormSection.tsx'
$content = Get-Content $path

$newContent = @()
$caseAFound = $false
$inChartContainer = $false

for ($i = 0; $i -lt $content.Count; $i++) {
    $line = $content[$i]
    
    if ($line -like "*/* Case A: Only 1 measurement*") { $caseAFound = $true }
    
    # 1. Update Case A Grid Header
    if ($caseAFound -and $line -like "*gridTemplateColumns: '1fr 1fr'*") {
        $newContent += $line.Replace("'1fr 1fr'", "'2fr 1fr 1fr'")
    } 
    # 2. Add isEndurance flag to ALL AssessmentHistoryChart calls (Case A and B)
    elseif ($line -like "*referenceLabel=`"Normalidade`"*") {
        $newContent += $line
        $newContent += "                                                                                 isEndurance={true}"
    } 
    # 3. Handle Case A charts container flattening
    elseif ($caseAFound -and $line -like "*<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>*") {
        $inChartContainer = $true
        # Skip this div
    } 
    elseif ($caseAFound -and $inChartContainer -and $line.Trim() -eq "</div>" -and $content[$i-1] -like "*}))}*") {
        # Skip the closing div of the charts container
        $inChartContainer = $false
        $caseAFound = $false # End of Case A block we care about
    }
    else {
        $newContent += $line
    }
}

$newContent | Set-Content $path
