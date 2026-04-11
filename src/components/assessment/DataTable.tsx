"use client";

import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import DataTableCell from "./DataTableCell";
import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { getEnduranceThreshold, getPatientProfileString } from "@/utils/clinicalThresholds";
import { Section, TableRow } from "@/types/clinical";

interface DataTableProps {
    section: Section; 
    isPrint?: boolean;
}

const DataTable = memo(({ section, isPrint: overrideIsPrint }: DataTableProps) => {
    const params = useParams();
    const state = useAssessmentContext();
    const { patientGender, patientAge, patientActivityLevel } = state;
    
    const answers = state.answers;
    const isEditing = state.isEditing;
    const handleInputChange = state.handleInputChange;
    const onImageClick = state.setSelectedImage;
    const onAnalyzeImage = state.handleAnalyzeImage;
    const assessmentDate = state.assessmentDate;
    const onOpenDynamo = (fieldId: string, label: string) => state.setDynamoModal({ fieldId, label });
    const handleHeaderAction = state.handleHeaderAction;
    const type = state.type || (params.type as string);
    
    const isPrint = overrideIsPrint !== undefined ? overrideIsPrint : state.isPrint;

    const reflexOptions = ['Normal', 'Aumentado', 'Diminuído', 'Abolido'];
    
    const hasValue = (val: any) => val !== undefined && val !== null && val !== "" && val !== "null" && val !== false;

    return (
        <div className="table-responsive" style={{ 
            marginTop: '0.5rem', 
            width: '100%',
            borderRadius: '1.25rem', 
            border: isPrint ? '1px solid #e2e8f0' : '1px solid var(--border)', 
            overflow: 'hidden',
            backgroundColor: 'white',
            boxShadow: isPrint ? 'none' : '0 4px 6px -1px rgba(163, 22, 33, 0.05), 0 2px 4px -1px rgba(163, 22, 33, 0.03)'
        }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        borderTop: '3px solid var(--primary)' // PREMIUM ACCENT
                    }}>
                        {section.columns?.map((col, idx) => (
                            <th 
                                key={idx} 
                                style={{ 
                                    padding: isPrint ? '0.6rem 0.75rem' : '1.1rem 1rem', 
                                    textAlign: idx === 0 ? 'left' : 'center', 
                                    fontSize: isPrint ? '0.65rem' : '0.75rem', 
                                    fontWeight: '800', 
                                    color: 'var(--primary)', // BRAND RED TEXT
                                    letterSpacing: '0.025em',
                                    textTransform: 'uppercase', 
                                    borderBottom: '1px solid var(--border)',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: idx === 0 ? 'flex-start' : 'center', gap: '0.5rem' }}>
                                    <span>{typeof col === "string" ? col : col.label}</span>
                                    {isEditing && typeof col !== "string" && col.action?.type === 'fill' && (
                                        <button
                                            type="button"
                                            onClick={() => handleHeaderAction(col.action, idx, section)}
                                            title={`Preencher tudo como ${col.action.value}`}
                                            className="fill-all-btn"
                                            style={{
                                                background: 'var(--primary-light)',
                                                border: '1px solid var(--primary)',
                                                color: 'var(--primary)',
                                                borderRadius: '30px',
                                                padding: '2px 8px',
                                                fontSize: '0.65rem',
                                                fontWeight: '900',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                boxShadow: 'var(--shadow-sm)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <CheckCircle2 size={12} />
                                            {col.action.value}
                                        </button>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {section.rows?.filter((row: TableRow) => {
                        if (isEditing) return true;
                        return row.fields.some(f => {
                            const fid = typeof f === "string" ? f : (f as any).id;
                            return hasValue(answers[fid]);
                        });
                    }).map((row: TableRow, rIdx) => {
                        let displayLabel = row.label;
                        
                        if (type === 'afLombar' || type === 'afCervical') {
                            const mainField = row.fields[0];
                            const fieldId = typeof mainField === 'string' ? mainField : (mainField as any)?.id;
                            
                            if (['flexao_60', 'sorensen', 'resist_flexora', 'resist_extensora'].includes(fieldId)) {
                                const threshold = getEnduranceThreshold({
                                    testId: fieldId,
                                    gender: patientGender,
                                    age: patientAge,
                                    activityLevel: patientActivityLevel
                                });
                                const profile = getPatientProfileString(patientGender, patientAge, patientActivityLevel);
                                displayLabel = `${displayLabel} (Ref: ${threshold}s - ${profile})`;
                            }
                        }

                        return (
                            <tr key={rIdx} style={{ transition: 'background-color 0.2s' }}>
                                <td style={{ 
                                    padding: isPrint ? '0.5rem 0.75rem' : '1.25rem 1rem', 
                                    fontSize: isPrint ? '0.75rem' : '0.82rem', 
                                    fontWeight: '700', 
                                    color: 'var(--secondary)', 
                                    borderBottom: '1px solid #f8fafc',
                                    backgroundColor: '#fafafa', // SUBTLE CONTRAST
                                    width: '35%',
                                    minWidth: '180px',
                                    lineHeight: '1.3'
                                }}>
                                    {displayLabel}
                                </td>
                                {row.fields.map((f, fIdx) => {
                                    const fieldId = typeof f === "string" ? f : (f as any).id;
                                    const fieldType = typeof f === "string" ? "number" : ((f as any).type || "number");
                                    const fieldOptions = typeof f === "string" ? (fieldType === 'select' ? reflexOptions : []) : (f as any).options || [];
                                    const min = typeof f === "string" ? undefined : (f as any).min;
                                    const max = typeof f === "string" ? undefined : (f as any).max;

                                    let calculatedValue = answers[fieldId];
                                    const isDeficitField = fieldId.endsWith('_deficit') || fieldId.endsWith('_def');

                                    if (isDeficitField) {
                                        const sidePrefix = fieldId.replace('_deficit', '').replace('_def', '');
                                        const valE = parseFloat(String(answers[`${sidePrefix}_esq`] || '0').replace(',', '.'));
                                        const valD = parseFloat(String(answers[`${sidePrefix}_dir`] || '0').replace(',', '.'));
                                        
                                        if (valE > 0 || valD > 0) {
                                            const maxVal = Math.max(valE, valD);
                                            const minVal = Math.min(valE, valD);
                                            if (maxVal > 0) {
                                                const diff = maxVal - minVal;
                                                calculatedValue = ((diff / maxVal) * 100).toFixed(1) + '%';
                                            } else {
                                                calculatedValue = '0%';
                                            }
                                        }
                                    } else if (fieldId.endsWith('_res')) {
                                        let sourceValFieldId = '';
                                        if (fieldId === 'resist_flexora_res') sourceValFieldId = 'resist_flexora';
                                        else if (fieldId === 'resist_extensora_res') sourceValFieldId = 'resist_extensora';
                                        else if (fieldId === 'flexao_60_res') sourceValFieldId = 'flexao_60';
                                        else if (fieldId === 'sorensen_res') sourceValFieldId = 'sorensen';
                                        
                                        if (sourceValFieldId) {
                                            const valStr = answers[sourceValFieldId];
                                            if (valStr && valStr.trim() !== '') {
                                                const numVal = parseFloat(valStr.replace(',', '.'));
                                                const threshold = getEnduranceThreshold({
                                                    testId: sourceValFieldId,
                                                    gender: patientGender,
                                                    age: patientAge,
                                                    activityLevel: patientActivityLevel
                                                });
                                                const isNormal = numVal >= threshold;
                                                calculatedValue = isNormal ? 'Normal' : 'Reduzido';
                                            } else {
                                                calculatedValue = '';
                                            }
                                        }
                                    }

                                    return (
                                        <td key={fIdx} style={{ padding: isPrint ? '0.4rem' : '0.6rem', borderBottom: '1px solid #f8fafc' }}>
                                            <DataTableCell 
                                                fieldId={fieldId}
                                                fieldType={fieldType}
                                                fieldOptions={fieldOptions}
                                                value={calculatedValue}
                                                isPrint={isPrint}
                                                rowLabel={row.label}
                                                isCalculated={isDeficitField}
                                                min={min}
                                                max={max}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
});

export default DataTable;
