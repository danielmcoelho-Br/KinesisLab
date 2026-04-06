"use client";

import { memo } from "react";
import DataTableCell from "./DataTableCell";
import { useAssessmentContext } from "@/contexts/AssessmentContext";

import { Section, SectionColumn, TableRow } from "@/types/clinical";

interface DataTableProps {
    section: Section; 
    isPrint?: boolean;
}

const DataTable = memo(({ section, isPrint: overrideIsPrint }: DataTableProps) => {
    const state = useAssessmentContext();
    
    const answers = state.answers;
    const isEditing = state.isEditing;
    const handleInputChange = state.handleInputChange;
    const onImageClick = state.setSelectedImage;
    const onAnalyzeImage = state.handleAnalyzeImage;
    const assessmentDate = state.assessmentDate;
    const onOpenDynamo = (fieldId: string, label: string) => state.setDynamoModal({ fieldId, label });
    
    const isPrint = overrideIsPrint !== undefined ? overrideIsPrint : state.isPrint;

    const reflexOptions = ['Normal', 'Aumentado', 'Diminuído', 'Abolido'];
    
    const isNarrowTable = isPrint && ['movimento', 'irritabilidade', 'teste_fadiga'].some(id => section.id?.includes(id));
    
    return (
        <div className="table-wrapper print-avoid-break" style={{ overflowX: 'auto', marginBottom: '2rem', pageBreakInside: 'avoid', breakInside: 'avoid', maxWidth: isNarrowTable ? '50%' : '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                        {section.columns?.map((col: SectionColumn, idx: number) => {
                            const label = typeof col === 'string' ? col : col.label;
                            const action = typeof col === 'string' ? null : col.action;
                            
                            if (isPrint && (label === 'Imagem' || label?.includes('Intensidade') || label?.includes('Observações'))) {
                                const hasAnyData = section.rows?.some((r: TableRow) => {
                                    const f = r.fields[idx - 1];
                                    const fid = typeof f === 'string' ? f : (f as any)?.id;
                                    const val = answers[fid];
                                    return val !== undefined && val !== '' && val !== null && val !== false && (!Array.isArray(val) || val.length > 0);
                                });
                                if (!hasAnyData) return null;
                            }

                            return (
                                <th key={idx} style={{ padding: '0.75rem 0.6rem', textAlign: 'center', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <span>{label}</span>
                                        {isEditing && action?.type === 'fill' && (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    section.rows?.forEach((r: TableRow) => {
                                                        const f = r.fields[idx - 1];
                                                        const fid = typeof f === 'string' ? f : (f as any).id;
                                                        handleInputChange(fid, action.value);
                                                    });
                                                }}
                                                style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer' }}
                                            >
                                                Preencher {action.value}
                                            </button>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {section.rows?.filter((row: TableRow) => {
                        if (!isPrint) return true;
                        return row.fields.some((f: any) => {
                            const fid = typeof f === 'string' ? f : f.id;
                            const val = answers[fid];
                            return val !== undefined && val !== '' && val !== null && val !== false;
                        });
                    }).map((row: TableRow, rIdx: number) => {
                        return (
                            <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: rIdx % 2 === 0 ? 'white' : 'var(--bg-secondary)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600', fontSize: '0.82rem', color: 'var(--secondary)', width: '30%' }}>
                                    {row.label}
                                </td>
                                {row.fields.map((field: any, fIdx: number) => {
                                    const fieldId = typeof field === 'string' ? field : field.id;
                                    const col = section.columns![fIdx + 1];
                                    const colLabel = (typeof col === 'string' ? col : col.label) || "";
                                    
                                    let fieldType = typeof field === 'string' ? 'text' : field.type;
                                    
                                    if (typeof field === 'string') {
                                        const lowerId = fieldId.toLowerCase();
                                        const lowerCol = colLabel.toLowerCase();
                                        
                                        if (
                                            lowerId.includes('forca') || 
                                            lowerId.startsWith('f_') || 
                                            lowerId.includes('preensao') || 
                                            lowerId.includes('polpa') || 
                                            lowerId.includes('lateral') || 
                                            lowerId.includes('tripode') || 
                                            lowerId.includes('resist') || 
                                            lowerId.includes('peri') || 
                                            lowerId.includes('graus') ||
                                            lowerId.includes('int') ||
                                            lowerCol.includes('graus') ||
                                            lowerCol.includes('kgf') ||
                                            lowerCol.includes('cm') ||
                                            lowerCol.includes('segundos')
                                        ) {
                                            fieldType = 'number';
                                        }
                                    }
                                    
                                    const fieldOptions = typeof field === 'string' ? [] : (field.options || []);
                                    const min = typeof field === 'string' ? undefined : (field as any).min;
                                    const max = typeof field === 'string' ? undefined : (field as any).max;
                                    
                                    // Automatic deficit calculation
                                    const isDeficitField = fieldId.toLowerCase().includes('deficit') || fieldId.toLowerCase().includes('_def');
                                    let calculatedValue = answers[fieldId];
                                    
                                    if (isDeficitField) {
                                        const esqFieldId = row.fields.find((f: any) => {
                                            const id = typeof f === 'string' ? f : f.id;
                                            return id.toLowerCase().includes('_esq') || id.toLowerCase().includes('esquerdo');
                                        });
                                        const dirFieldId = row.fields.find((f: any) => {
                                            const id = typeof f === 'string' ? f : f.id;
                                            return id.toLowerCase().includes('_dir') || id.toLowerCase().includes('direito');
                                        });
                                        
                                        if (esqFieldId && dirFieldId) {
                                            const esqFid = typeof esqFieldId === 'string' ? esqFieldId : esqFieldId.id;
                                            const dirFid = typeof dirFieldId === 'string' ? dirFieldId : dirFieldId.id;
                                            const esqVal = Number(String(answers[esqFid] || '0').replace(',', '.')) || 0;
                                            const dirVal = Number(String(answers[dirFid] || '0').replace(',', '.')) || 0;
                                            
                                            if (esqVal > 0 || dirVal > 0) {
                                                const maxVal = Math.max(esqVal, dirVal);
                                                const diff = Math.abs(esqVal - dirVal);
                                                calculatedValue = ((diff / maxVal) * 100).toFixed(1) + '%';
                                            } else {
                                                calculatedValue = '0%';
                                            }
                                        }
                                    }

                                    return (
                                        <td key={fIdx} style={{ padding: '0.5rem 0.6rem' }}>
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
