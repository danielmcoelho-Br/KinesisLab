"use client";

import { memo } from "react";
import { Calculator } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { useAssessmentContext } from "@/contexts/AssessmentContext";

interface DataTableCellProps {
    fieldId: string; 
    fieldType: string; 
    fieldOptions: any[];
    value?: any; 
    isPrint?: boolean;
    rowLabel?: string;
    isCalculated?: boolean;
    min?: number;
    max?: number;
}

const DataTableCell = memo(({ 
    fieldId, 
    fieldType, 
    fieldOptions,
    value: propValue, 
    isPrint: overrideIsPrint,
    rowLabel,
    isCalculated = false,
    min,
    max
}: DataTableCellProps) => {
    const state = useAssessmentContext();
    const isEditing = state.isEditing;
    const handleInputChange = state.handleInputChange;
    const onImageClick = state.setSelectedImage;
    const onAnalyzeImage = state.handleAnalyzeImage;
    const onOpenDynamo = (fieldId: string, label: string) => state.setDynamoModal({ fieldId, label });
    
    const isPrint = overrideIsPrint !== undefined ? overrideIsPrint : state.isPrint;
    const value = propValue !== undefined ? propValue : state.answers[fieldId];
    
    const reflexOptions = ['Normal', 'Aumentado', 'Diminuído', 'Abolido'];
    const numValue = value !== undefined && value !== "" ? parseFloat(String(value).replace(',', '.')) : NaN;
    const isOutOfRange = !isNaN(numValue) && (
        (min !== undefined && numValue < min) ||
        (max !== undefined && numValue > max)
    );

    if (isCalculated) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: isPrint ? '0.2rem 0.1rem' : '0.4rem', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '0.4rem',
                border: '1px solid var(--border)',
                fontWeight: '700',
                color: 'var(--primary)',
                fontSize: isPrint ? '0.75rem' : '0.85rem'
            }}>
                {value || "0%"}
            </div>
        );
    }

    if (fieldType === 'checkbox') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {isPrint ? (
                    value ? (
                        <span style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.2rem' }}>✓</span>
                    ) : (
                        <span style={{ color: '#ccc' }}>-</span>
                    )
                ) : (
                    <input 
                        type="checkbox" 
                        checked={!!value}
                        onChange={(e) => handleInputChange(fieldId, e.target.checked)}
                        disabled={!isEditing}
                        style={{ width: '18px', height: '18px', cursor: isEditing ? 'pointer' : 'not-allowed' }}
                    />
                )}
            </div>
        );
    }

    if (fieldType === 'select') {
        return isPrint ? (
            <div style={{ textAlign: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: '600' }}>{value || "-"}</span>
            </div>
        ) : (
            <select
                value={value || ""}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                disabled={!isEditing}
                style={{ 
                    width: '100%', 
                    padding: '0.3rem 0.4rem', 
                    borderRadius: '0.4rem', 
                    border: '1px solid var(--border)',
                    backgroundColor: isEditing ? 'white' : 'transparent',
                    fontSize: '0.82rem',
                    textAlign: 'center'
                }}
            >
                <option value="">-</option>
                {(fieldOptions.length > 0 ? fieldOptions : reflexOptions).map((opt: string | { id: string, value: string }) => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    return <option key={typeof opt === 'string' ? opt : opt.id} value={optValue}>{optValue}</option>;
                })}
            </select>
        );
    }

    if (fieldType === 'image-upload') {
        return (
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {isPrint ? (
                    (() => {
                        const imgs = Array.isArray(value) ? value : (value ? [value] : []);
                        return imgs.length > 0 ? imgs.map((img: string, i: number) => (
                            <img key={i} src={img} style={{ height: '60px', borderRadius: '4px' }} alt="Upload" />
                        )) : <span style={{ color: '#ccc' }}>-</span>;
                    })()
                ) : (
                    <ImageUpload 
                        value={value}
                        isEditing={isEditing}
                        onChange={(val: any) => handleInputChange(fieldId, val)}
                        onImageClick={onImageClick}
                        onAnalyzeImage={onAnalyzeImage ? (img, idx) => onAnalyzeImage(img, fieldId, idx) : undefined}
                        isTable={true}
                        isPrint={isPrint}
                    />
                )}
            </div>
        );
    }

    if (fieldType === 'static') {
        return (
            <div style={{ textAlign: 'center', fontWeight: '800', color: '#64748b', fontSize: isPrint ? '0.75rem' : '0.82rem' }}>
                {fieldOptions.find((o: string | { id: string, value: string }) => typeof o !== 'string' && o.id === fieldId)?.value || (fieldId.includes('obj') ? fieldId.split('_obj')[0] : value) || '-'} 
            </div>
        );
    }

    if (fieldId.endsWith('_res') || fieldId.endsWith('_res_esq') || fieldId.endsWith('_res_dir') || fieldId.endsWith('_class') || fieldId.endsWith('_status')) {
        const isNormal = value === 'Normal' || value === 'NORMAL';
        const isReduced = value === 'Reduzido' || value === 'Abaixo' || value === 'Déficit' || value === 'ABAIXO' || value?.includes('Déficit');
        
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ 
                    color: isNormal ? '#059669' : (isReduced ? '#991b1b' : '#64748b'), 
                    fontWeight: '800',
                    fontSize: isPrint ? '0.65rem' : '0.7rem',
                    textTransform: 'uppercase',
                    backgroundColor: isNormal ? '#ecfdf5' : (isReduced ? '#fee2e2' : '#f1f5f9'),
                    padding: isPrint ? '2px 6px' : '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${isNormal ? '#10b981' : (isReduced ? '#991b1b' : '#cbd5e1')}`,
                    display: 'inline-block',
                    minWidth: isPrint ? '45px' : '65px'
                }}>
                    {value || "-"}
                </span>
            </div>
        );
    }

    return isPrint ? (
        <div style={{ textAlign: 'center', fontSize: '0.78rem' }}>
            <span style={{ fontWeight: '600' }}>{value || "-"}</span>
        </div>
    ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
            <input 
                type={fieldType === 'number' ? 'number' : 'text'}
                value={value || ""}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                disabled={!isEditing}
                placeholder="-"
                style={{ 
                    flex: 1, 
                    padding: '0.3rem 0.4rem', 
                    borderRadius: '0.4rem', 
                    border: isEditing ? (isOutOfRange ? '2px solid #f97316' : '1px solid var(--border)') : '1px solid transparent',
                    backgroundColor: isEditing ? (isOutOfRange ? '#fff7ed' : 'white') : 'transparent',
                    fontSize: '0.82rem',
                    textAlign: 'center',
                    boxShadow: isOutOfRange ? '0 0 0 2px #ffedd5' : 'none'
                }}
            />
            {isEditing && state.type !== 'afLombar' && state.type !== 'afCervical' && fieldType === 'number' && (fieldId.includes('forca') || fieldId.startsWith('f_') || fieldId.includes('preensao') || fieldId.includes('polpa') || fieldId.includes('lateral') || fieldId.includes('tripode') || fieldId.includes('resist')) && onOpenDynamo && (
                <button
                    type="button"
                    onClick={() => onOpenDynamo(fieldId, rowLabel || "")}
                    title="Inserir medidas"
                    style={{ 
                        padding: '4px', 
                        borderRadius: '4px', 
                        border: '1px solid var(--border)', 
                        background: 'var(--bg-secondary)', 
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <Calculator size={14} />
                </button>
            )}
        </div>
    );
});

export default DataTableCell;
