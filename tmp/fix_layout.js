
const fs = require('fs');
const path = 'C:\\Users\\daniel\\.gemini\\antigravity\\scratch\\KinesisLab\\src\\components\\assessment\\FormSection.tsx';
let data = fs.readFileSync(path, 'utf8');

const regex = /\/\* Specialized Layout for Endurance\/Muscular Resistance Tests \*\/[\s\S]+?\) : \(/;

const newBlock = `/* Specialized Layout for Endurance/Muscular Resistance Tests */
                                         <>
                                             {patientAssessments.length > 1 ? (
                                                 /* Case B: More than 1 measurement -> Flexors (50%) | Extensors (50%) side-by-side */
                                                 <div style={{ 
                                                     display: 'grid', 
                                                     gridTemplateColumns: '1fr 1fr', 
                                                     gap: '1.5rem' 
                                                 }}>
                                                     {sub.rows?.map((row: TableRow) => (
                                                         <div key={row.id} style={{ 
                                                             display: 'flex', 
                                                             flexDirection: 'column',
                                                             gap: '1rem'
                                                         }}>
                                                             <div style={{ width: '100%' }}>
                                                                 <DataTable 
                                                                     section={{ ...sub, rows: [row] }} 
                                                                     isPrint={isPrint}
                                                                 />
                                                             </div>
                                                             <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                                 {row.fields.map((f, fidx: number) => {
                                                                     const fid = typeof f === "string" ? f : (f as any).id;
                                                                     const currentValue = Number(String(answers[fid] || "0").replace("%", "").replace(",", "."));
                                                                     const referenceValue = getEnduranceThreshold({ testId: fid, gender: patientGender, age: patientAge, activityLevel: state.patientActivityLevel });
                                                                     const profile = getPatientProfileString(patientGender, patientAge, state.patientActivityLevel);
                                                                     const chartTitle = \`\${row.label.replace('(Ref: Normativa)', '').trim()} (\${profile}: \${referenceValue}s)\`;

                                                                     if (referenceValue || patientAssessments.length > 1) {
                                                                         return (
                                                                             <AssessmentHistoryChart 
                                                                                 key={\`hist-endur-b-\${fid}\`}
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
                                                                 })}
                                                             </div>
                                                         </div>
                                                     ))}
                                                 </div>
                                             ) : (
                                                 /* Case A: Only 1 measurement -> Table (50%) | Side-by-side Charts (25% + 25%) */
                                                 <div style={{ 
                                                     display: 'grid', 
                                                     gridTemplateColumns: '2fr 1fr 1fr', 
                                                     gap: '1.5rem',
                                                     alignItems: 'flex-start'
                                                 }}>
                                                     <div style={{ width: '100%' }}>
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
                                                         const chartTitle = \`\${row.label.replace('(Ref: Normativa)', '').trim()} (\${profile}: \${referenceValue}s)\`;

                                                         if (referenceValue || patientAssessments.length > 1) {
                                                             return (
                                                                 <AssessmentHistoryChart 
                                                                     key={\`hist-endur-a-\${fid}\`}
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
                                                 </div>
                                             )}
                                         </>
                                     ) : (`;

fs.writeFileSync(path, data.replace(regex, newBlock));
