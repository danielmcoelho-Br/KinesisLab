
$path = 'C:\Users\daniel\.gemini\antigravity\scratch\KinesisLab\src\components\assessment\FormSection.tsx'
$content = Get-Content $path

$newContent = @()
foreach($line in $content) {
    # Skip the nested chart container div and its closing tag in Case A
    if ($line -like "*<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>*") {
        continue
    }
    # This is rough but matches the closing div I added for the charts container
    if ($line -trim() -eq "</div>" -and $content[$newContent.Count] -like "*}))}*") {
        # continue # Actually, this logic is too brittle. 
    }
    
    # Let's just do a string replacement for the whole block to be 100% sure
}

# RE-DO: Just use a targeted -replace on the raw string for the specific nested div
$raw = Get-Content $path -Raw
$raw = $raw -replace '<div style=\{\{ display: ''grid'', gridTemplateColumns: ''2fr 1fr 1fr'', gap: ''1rem'' \}\}>', ''

# Remove the closing div that was right after the map loop
# The pattern is: }))} \r?\n\s+</div> \r?\n\s+</div>
$raw = $raw -replace '\}\)\)\}\s+<\/div>\s+<\/div>', '}))}</div>'

# Fix indentation and props
$raw = $raw -replace 'referenceLabel="Normalidade"\s+isEndurance=\{true\}', 'referenceLabel="Normalidade", isEndurance: true'

# Actually, I'll just write THE WHOLE BLOCK I WANT carefully
$caseABlock = '/* Case A: Only 1 measurement -> Table (50%) | Side-by-side Charts (25% + 25%) */
                                                <div style={{ 
                                                    display: ''grid'', 
                                                    gridTemplateColumns: ''2fr 1fr 1fr'', 
                                                    gap: ''1.5rem'',
                                                    alignItems: ''flex-start''
                                                }}>
                                                    <div style={{ width: ''100%'' }}>
                                                        <DataTable 
                                                            section={sub} 
                                                            isPrint={isPrint}
                                                        />
                                                    </div>
                                                    {sub.rows?.map((row: TableRow) => row.fields.map((f, fidx: number) => {
                                                        const fid = typeof f === "string" ? f : (f as any).id;
                                                        const currentValue = Number(String(answers[fid] || "0").replace("%", "").replace(",", "."));
                                                        const referenceValue = getEnduranceThreshold({ testId: fid, gender: patientGender, age: patientAge, activityLevel: state.patientActivityLevel });
                                                        const profile = getPatientProfileString(patientGender, patientAge, state.patientActivityLevel);
                                                        const chartTitle = `${row.label.replace(''(Ref: Normativa)'', '''').trim()} (${profile}: ${referenceValue}s)`;

                                                        if (referenceValue || patientAssessments.length > 1) {
                                                            return (
                                                                <AssessmentHistoryChart 
                                                                    key={`hist-endur-a-${fid}`}
                                                                    fieldId={fid}
                                                                    currentValue={currentValue || 0}
                                                                    chartTitle={chartTitle}
                                                                    unit="s"
                                                                    history={patientAssessments}
                                                                    isPrint={isPrint}
                                                                    assessmentId={assessmentId}
                                                                    referenceValue={referenceValue}
                                                                    referenceLabel="Normalidade"
                                                                    isEndurance={true}
                                                                />
                                                            );
                                                        }
                                                        return null;
                                                    }))}
                                                </div>'

# This is still risky. I'll use a better approach: Line by line with a state machine.
$newContent = @()
$skipCaseA = $false
foreach($line in $content) {
    if ($line -like "*/* Case A: Only 1 measurement*") {
        $newContent += $line
        $newContent += $caseABlock
        $skipCaseA = $true
        continue
    }
    if ($skipCaseA) {
        if ($line -like "*/* Subsection Comparison Charts */*") {
            $skipCaseA = $false
            # continue to add this line
        } else {
            continue
        }
    }
    
    # Fix Case B indentation while at it
    if ($line -like "*isEndurance={true}*") {
        $newContent += "                                                                                 isEndurance={true}"
        continue
    }
    
    $newContent += $line
}
$newContent | Set-Content $path
