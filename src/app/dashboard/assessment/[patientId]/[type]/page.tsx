"use client";

import { useState, useEffect, Suspense, memo, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle, 
    ArrowLeft, 
    Edit2, 
    Save, 
    History as HistoryIcon, 
    ChevronDown, 
    ChevronUp,
    Camera,
    Upload,
    UploadCloud,
    Trash2,
    Image as ImageIcon,
    Printer,
    X,
    Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { questionnairesData, Section, SectionField } from "@/data/questionnaires";
import { saveAssessment, getAssessment, updateAssessment } from "@/app/dashboard/assessment/actions";
import { getPatient } from "@/app/dashboard/actions";
import { toast } from "sonner";
import BodySchema from "@/components/BodySchema";
import FreeCanvas from "@/components/FreeCanvas";
import AngleMeasurement from "@/components/AngleMeasurement";
import Header from "@/components/Header";
import PatientInfoBanner from "@/components/PatientInfoBanner";
import { calculateAssessmentScore, CalculationType } from "@/lib/calculations";

// Normative data for Muscle Endurance (seconds)
const NORMATIVE_DATA: Record<string, any> = {
    neck_flexor: {
        men: [
            { ageRange: [20, 40], mean: 38.4 },
            { ageRange: [41, 60], mean: 38.1 },
            { ageRange: [61, 80], mean: 40.9 }
        ],
        women: [
            { ageRange: [20, 40], mean: 23.1 },
            { ageRange: [41, 60], mean: 36.2 },
            { ageRange: [61, 80], mean: 28.5 }
        ]
    },
    lumbar_flexor: {
        men: [
            { ageRange: [18, 40], mean: 233.9 },
            { ageRange: [41, 99], mean: 108.2 }
        ],
        women: [
            { ageRange: [18, 40], mean: 233.9 },
            { ageRange: [41, 99], mean: 108.2 }
        ]
    },
    sorensen: {
        men: [
            { ageRange: [18, 40], mean: 181.1 },
            { ageRange: [41, 65], mean: 84.9 },
            { ageRange: [66, 99], mean: 84.9 }
        ],
        women: [
            { ageRange: [18, 40], mean: 171.9 },
            { ageRange: [41, 65], mean: 88.2 },
            { ageRange: [66, 99], mean: 88.2 }
        ]
    }
};

const Bar = ({ value, maxValue, label, color, subLabel, unit = 's', isPrint = false }: { value: number, maxValue: number, label: string, color: string, subLabel?: string, unit?: string, isPrint?: boolean }) => {
    let barColor = color;
    if (isPrint) {
        if (color === 'var(--primary)' || color.toLowerCase() === '#8b0000') barColor = '#8B0000';
        else if (color === 'var(--primary-light)' || color.toLowerCase() === '#fee2e2') barColor = '#fee2e2';
        else if (color === 'var(--secondary)') barColor = '#1e293b';
        else if (color === 'var(--secondary-light)') barColor = '#f1f5f9';
    }
    
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
                height: '150px', 
                width: '100%', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '8px', 
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden'
            }}>
                {isPrint ? (
                    <div style={{ 
                        height: `${(value / (maxValue || 1)) * 100}%`,
                        width: '100%', 
                        backgroundColor: barColor,
                        borderRadius: '4px 4px 0 0'
                    }} />
                ) : (
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / (maxValue || 1)) * 100}%` }}
                        style={{ 
                            width: '100%', 
                            backgroundColor: barColor,
                            borderRadius: '4px 4px 0 0'
                        }}
                    />
                )}
                <div style={{ 
                    position: 'absolute', 
                    top: value / (maxValue || 1) > 0.5 ? '50%' : 'auto',
                    bottom: value / (maxValue || 1) > 0.5 ? 'auto' : '10px',
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    color: value / (maxValue || 1) > 0.5 ? '#fff' : 'var(--text)',
                    textShadow: value / (maxValue || 1) > 0.5 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    zIndex: 1,
                    textAlign: 'center',
                    width: '100%'
                }}>
                    {value}{unit}
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text)', lineHeight: 1.2 }}>{label}</div>
                {subLabel && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{subLabel}</div>}
            </div>
        </div>
    );
};

const MuscleEnduranceChart = ({ 
    currentValue, 
    gender, 
    age, 
    fieldId,
    history = [], 
    isPrint = false 
}: { 
    currentValue: number, 
    gender?: string, 
    age?: number, 
    fieldId: string,
    history?: any[], 
    isPrint?: boolean 
}) => {
    const validHistory = history.filter(h => Number(h.answers?.[fieldId]) > 0);

    if (!currentValue && validHistory.length === 0) return null;

    let type = 'neck_flexor';
    let chartTitle = 'Comparativo de Resistência (Flexores Cervicais)';
    
    if (fieldId === 'flexao_60') {
        type = 'lumbar_flexor';
        chartTitle = 'Resistência Flexora (Flexão 60°)';
    } else if (fieldId === 'sorensen') {
        type = 'sorensen';
        chartTitle = 'Resistência Extensora (Sorensen)';
    } else if (fieldId === 'resist_extensora') {
        chartTitle = 'Comparativo de Resistência (Extensores Cervicais)';
        // No normative for neck extensors yet
        type = 'none';
    }

    const normalizedGender = gender?.toLowerCase().includes('fem') || gender?.toLowerCase() === 'f' ? 'women' : 'men';
    const norm = type !== 'none' ? NORMATIVE_DATA[type]?.[normalizedGender]?.find(
        (n: any) => age && age >= n.ageRange[0] && age <= n.ageRange[1]
    ) : null;

    const maxValue = Math.max(
        currentValue || 0,
        norm?.mean || 0,
        ...validHistory.map(h => Number(h.answers?.[fieldId]) || 0)
    ) * 1.2 || 60;


    return (
        <div className="chart-container">
            <h4 className="chart-title">
                <ImageIcon size={18} /> {chartTitle}
            </h4>
            <div className="chart-scroll-wrapper">
                <div className="chart-bars-container">
                    {norm && (
                        <Bar 
                            value={norm.mean} 
                            maxValue={maxValue}
                            label="Normalidade" 
                            color="#94a3b8" 
                            isPrint={isPrint}
                            subLabel={`${gender === 'Feminino' ? 'Mulheres' : 'Homens'} ${norm.ageRange[0]}-${norm.ageRange[1]}a`} 
                        />
                    )}
                    
                    {(() => {
                        const historyData = validHistory.map(h => ({
                            id: h.id,
                            value: Number(h.answers?.[fieldId]) || 0,
                            date: new Date(h.created_at).toLocaleDateString('pt-BR'),
                            timestamp: new Date(h.created_at).getTime()
                        })).sort((a, b) => a.timestamp - b.timestamp);

                        // Count occurrences per date to add suffixes
                        const dateCounts = new Map();
                        historyData.forEach(item => {
                            dateCounts.set(item.date, (dateCounts.get(item.date) || 0) + 1);
                        });

                        const currentCounts = new Map();
                        return historyData.map((d: any) => {
                            const count = (currentCounts.get(d.date) || 0) + 1;
                            currentCounts.set(d.date, count);
                            const hasMultiple = dateCounts.get(d.date) > 1;
                            const displayDate = hasMultiple ? `${d.date} (${count})` : d.date;

                            return (
                                <Bar 
                                    key={d.id} 
                                    value={d.value} 
                                    maxValue={maxValue}
                                    label={`Avaliação`} 
                                    subLabel={displayDate}
                                    color={isPrint ? "#fee2e2" : "var(--primary-light)"} 
                                    isPrint={isPrint}
                                />
                            );
                        });
                    })()}

                    <Bar 
                        value={Number(currentValue) || 0} 
                        maxValue={maxValue}
                        label="Teste Atual" 
                        color={isPrint ? "#8B0000" : "var(--primary)"} 
                        isPrint={isPrint}
                    />
                </div>
            </div>
            <style jsx>{`
                .chart-container {
                    margin-top: 1.5rem;
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                    background-color: white;
                    border-radius: 1rem;
                    border: 1px solid var(--border);
                    box-shadow: ${isPrint ? 'none' : 'var(--shadow-sm)'};
                }
                .chart-title {
                    font-size: 0.9rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: var(--secondary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .chart-scroll-wrapper {
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
                .chart-bars-container {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-end;
                    min-height: 200px;
                    min-width: 300px;
                }
                @media (max-width: 600px) {
                    .chart-container {
                        padding: 1rem;
                    }
                    .chart-bars-container {
                        min-width: 450px;
                    }
                }
            `}</style>
        </div>
    );
};

const FunctionalHistoryChart = ({ history = [], currentScore, type, isEmbedded = false, isPrint = false, assessmentId }: { history: any[], currentScore: number, type: string, isEmbedded?: boolean, isPrint?: boolean, assessmentId?: string | null }) => {
    if (history.length === 0 && !currentScore) return null;

    // Filter history for the specific type, which has score, and is NOT the current assessment being viewed (to avoid duplication)
    const validHistory = history.filter(h => h.assessment_type === type && h.scoreData?.percentage > 0 && h.id !== assessmentId);

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const rawData = [...validHistory.slice().map(h => ({
        id: h.id,
        date: new Date(h.created_at).toLocaleDateString('pt-BR'),
        score: h.scoreData?.percentage || 0,
        timestamp: new Date(h.created_at).getTime()
    })).sort((a, b) => a.timestamp - b.timestamp)];

    // Add current if it has a score and it's not already in history (by ID or same score today)
    const isAlreadyInHistory = rawData.some(h => 
        h.id === assessmentId || 
        (h.date === todayStr && Math.abs(h.score - currentScore) < 0.1)
    );
    
    if (currentScore > 0 && !isAlreadyInHistory) {
        rawData.push({
            id: 'current',
            date: 'Hoje',
            score: currentScore,
            timestamp: Date.now()
        });
    }

    // Add numbering suffix if multiple evaluations exist for the same date
    const dateCounts = new Map();
    rawData.forEach(item => {
        const dKey = item.date === 'Hoje' ? todayStr : item.date;
        dateCounts.set(dKey, (dateCounts.get(dKey) || 0) + 1);
    });

    const currentCounts = new Map();
    const processedData = rawData.map(item => {
        const dKey = item.date === 'Hoje' ? todayStr : item.date;
        const count = (currentCounts.get(dKey) || 0) + 1;
        currentCounts.set(dKey, count);
        const hasMultiple = dateCounts.get(dKey) > 1;
        
        // Remove "Hoje" - show the actual date
        let displayLabel = item.date === 'Hoje' ? todayStr : item.date;
        if (hasMultiple) {
            displayLabel = `${displayLabel} (${count})`;
        }

        return {
            ...item,
            displayDate: displayLabel
        };
    });

    if (processedData.length === 0) return null;

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    return (
        <div className={`history-chart-container ${isEmbedded ? 'embedded' : ''}`}>
            <h4 className="history-chart-title">
                Evolução Funcional (% Incapacidade - {type.toUpperCase()})
            </h4>
            <div className="history-chart-scroll">
                <div className="history-chart-bars" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', minHeight: '180px' }}>
                    {processedData.map((d, i) => {
                        const isCurrent = d.id === 'current' || d.id === assessmentId;
                        return (
                            <Bar 
                                key={i}
                                value={d.score}
                                maxValue={100}
                                label="Incap."
                                subLabel={d.displayDate}
                                color={isCurrent ? 'var(--primary)' : 'var(--primary-light)'}
                                unit="%"
                                isPrint={isPrint}
                            />
                        );
                    })}
                </div>
            </div>
            <style jsx>{`
                .history-chart-container {
                    margin-top: 2rem;
                    padding: 1.5rem;
                    background-color: var(--bg-secondary);
                    border-radius: 1rem;
                }
                .history-chart-container.embedded {
                    margin-top: 0.5rem;
                    padding: 1rem;
                    background-color: var(--bg);
                    border: 1px solid var(--border);
                    transform-origin: top left;
                    transform: scale(0.9);
                    width: 111%;
                    max-width: 600px;
                }
                .history-chart-title {
                    font-size: 1rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: var(--secondary);
                }
                .embedded .history-chart-title {
                    font-size: 0.85rem;
                }
                .history-chart-scroll {
                    overflow-x: auto;
                    padding-bottom: 0.5rem;
                }
                .history-chart-bars {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-end;
                    height: 200px;
                    min-width: 300px;
                }
                .history-chart-bar-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }
                .bar-wrapper {
                    height: 150px;
                    width: 100%;
                    background-color: rgba(0,0,0,0.05);
                    border-radius: 8px;
                    position: relative;
                    display: flex;
                    align-items: flex-end;
                    overflow: hidden;
                }
                .bar-fill {
                    width: 100%;
                    background-color: var(--primary-light);
                    border-radius: 4px 4px 0 0;
                }
                .bar-fill.current {
                    background-color: var(--primary);
                }
                .bar-value {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.8rem;
                    font-weight: 800;
                    z-index: 1;
                }
                .bar-value.inside {
                    top: 50%;
                    color: #fff;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                }
                .bar-value.outside {
                    bottom: 10px;
                    color: var(--text);
                }
                .bar-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-align: center;
                }
                @media (max-width: 600px) {
                    .history-chart-bars {
                        min-width: 400px;
                    }
                }
            `}</style>
        </div>
    );
};


const ImageUpload = memo(({ 
    value, 
    isEditing, 
    onChange, 
    onImageClick,
    isTable = false 
}: { 
    value: any, 
    isEditing: boolean, 
    onChange: (val: any) => void,
    onImageClick: (img: string) => void,
    isTable?: boolean 
}) => {
    const images: string[] = Array.isArray(value) ? value : (value ? [value] : []);
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: isTable ? 'center' : 'flex-start' }}>
            {images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: isTable ? 'center' : 'flex-start' }}>
                    {images.map((img, idx) => (
                        <div 
                            key={idx}
                            style={{ position: 'relative', width: isTable ? '60px' : '120px', height: isTable ? '60px' : '90px', cursor: 'zoom-in' }}
                            onClick={() => onImageClick(img)}
                        >
                            <img 
                                src={img} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} 
                                alt="Upload" 
                            />
                            {isEditing && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newImages = [...images];
                                        newImages.splice(idx, 1);
                                        onChange(newImages);
                                    }}
                                    style={{ position: 'absolute', top: '-6px', right: '-6px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {isEditing && (
                <div style={{ position: 'relative' }}>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const newImage = reader.result as string;
                                onChange([...images, newImage]);
                            };
                            reader.readAsDataURL(file);
                        }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                    />
                    <button type="button" className="btn-action-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                        <Upload size={14} /> Upload
                    </button>
                </div>
            )}
        </div>
    );
});

const DataTableCell = memo(({ 
    fieldId, 
    fieldType, 
    fieldOptions,
    value, 
    isEditing, 
    handleInputChange, 
    onImageClick,
    isPrint,
    reflexOptions
}: { 
    fieldId: string, 
    fieldType: string, 
    fieldOptions: any[],
    value: any, 
    isEditing: boolean, 
    handleInputChange: (id: string, val: any) => void,
    onImageClick: (img: string) => void,
    isPrint: boolean,
    reflexOptions: string[]
}) => {
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
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: '600' }}>{value || "-"}</span>
            </div>
        ) : (
            <select
                value={value || ""}
                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                disabled={!isEditing}
                style={{ 
                    width: '100%', 
                    padding: '0.4rem', 
                    borderRadius: '0.4rem', 
                    border: '1px solid var(--border)',
                    backgroundColor: isEditing ? 'white' : 'transparent',
                    fontSize: '0.85rem',
                    textAlign: 'center'
                }}
            >
                <option value="">-</option>
                {(fieldOptions.length > 0 ? fieldOptions : reflexOptions).map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
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
                        isTable={true}
                    />
                )}
            </div>
        );
    }

    return isPrint ? (
        <div style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: '600' }}>{value || "-"}</span>
        </div>
    ) : (
        <input 
            type={fieldType === 'number' ? 'number' : 'text'}
            value={value || ""}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            disabled={!isEditing}
            placeholder="-"
            style={{ 
                width: '100%', 
                padding: '0.4rem', 
                borderRadius: '0.4rem', 
                border: isEditing ? '1px solid var(--border)' : '1px solid transparent',
                backgroundColor: isEditing ? 'white' : 'transparent',
                fontSize: '0.85rem',
                textAlign: 'center'
            }}
        />
    );
});


const DataTable = memo(({ 
    section, 
    answers, 
    isEditing, 
    handleInputChange, 
    onImageClick,
    isPrint 
}: { 
    section: any, 
    answers: Record<string, any>, 
    isEditing: boolean, 
    handleInputChange: (id: string, val: any) => void,
    onImageClick: (img: string) => void,
    isPrint: boolean
}) => {
    const reflexOptions = ['Normal', 'Aumentado', 'Diminuído', 'Abolido'];
    
    return (
        <div className="table-wrapper" style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--secondary)', color: 'white' }}>
                        {section.columns?.map((col: any, idx: number) => {
                            const label = typeof col === 'string' ? col : col.label;
                            const action = typeof col === 'string' ? null : col.action;
                            
                            if (isPrint && (label === 'Imagem' || label?.includes('Intensidade') || label?.includes('Observações'))) {
                                const hasAnyData = section.rows?.some((r: any) => {
                                    const f = r.fields[idx - 1];
                                    const fid = typeof f === 'string' ? f : f?.id;
                                    const val = answers[fid];
                                    return val && val !== "" && val !== "0" && val !== false && (!Array.isArray(val) || val.length > 0);
                                });
                                if (!hasAnyData) return null;
                            }

                            return (
                                <th key={idx} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <span>{label}</span>
                                        {isEditing && action?.type === 'fill' && (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    section.rows?.forEach((r: any) => {
                                                        const f = r.fields[idx - 1];
                                                        const fid = typeof f === 'string' ? f : f.id;
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
                    {section.rows?.map((row: any, rIdx: number) => {
                        const hasRowData = row.fields.some((f: any) => {
                            const val = answers[typeof f === 'string' ? f : f.id];
                            return val && val !== "" && val !== "0" && val !== false;
                        });
                        if (isPrint && !hasRowData) return null;

                        return (
                            <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: rIdx % 2 === 0 ? 'white' : 'var(--bg-secondary)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--secondary)', width: '35%' }}>
                                    {row.label}
                                </td>
                                {row.fields.map((field: any, fIdx: number) => {
                                    const fieldId = typeof field === 'string' ? field : field.id;
                                    const fieldType = typeof field === 'string' ? 'text' : field.type;
                                    const fieldOptions = typeof field === 'string' ? [] : (field.options || []);
                                    
                                    if (isPrint) {
                                        const col = section.columns![fIdx + 1];
                                        const colLabel = typeof col === 'string' ? col : col.label;
                                        if (colLabel === 'Imagem' || colLabel?.includes('Intensidade') || colLabel?.includes('Observações')) {
                                            const hasAnyData = section.rows?.some((r: any) => {
                                                const f = r.fields[fIdx];
                                                const fid = typeof f === 'string' ? f : f.id;
                                                const val = answers[fid];
                                                return val && val !== "" && val !== "0" && val !== false && (!Array.isArray(val) || val.length > 0);
                                            });
                                            if (!hasAnyData) return null;
                                        }
                                    }

                                    return (
                                        <td key={fIdx} style={{ padding: '0.5rem 1rem' }}>
                                            <DataTableCell 
                                                fieldId={fieldId}
                                                fieldType={fieldType}
                                                fieldOptions={fieldOptions}
                                                value={answers[fieldId]}
                                                isEditing={isEditing}
                                                handleInputChange={handleInputChange}
                                                onImageClick={onImageClick}
                                                isPrint={isPrint}
                                                reflexOptions={reflexOptions}
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

const FormField = memo(({ 
    field, 
    value, 
    isEditing, 
    handleInputChange, 
    onImageClick, 
    patientGender, 
    patientAge, 
    patientAssessments, 
    patientId, 
    type, 
    assessmentId,
    router
}: { 
    field: SectionField, 
    value: any, 
    isEditing: boolean, 
    handleInputChange: (id: string, val: any) => void,
    onImageClick: (img: string) => void,
    patientGender: string,
    patientAge: number,
    patientAssessments: any[],
    patientId: string,
    type: string,
    assessmentId: string | null,
    router: any
}) => {
    const commonProps = {
        disabled: !isEditing,
        className: `form-input ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <textarea 
              {...commonProps}
              rows={3} 
              value={value || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="Descreva aqui..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}
            />
          </div>
        );
      case 'range':
        return (
          <div key={field.id} className="form-group">
            <div style={{ position: 'relative', width: '100%', height: '40px', marginBottom: '1rem' }}>
                <span style={{ 
                    position: 'absolute', 
                    left: `${(Number(value) || 0) * 10}%`, 
                    transform: 'translateX(-50%)',
                    top: '0',
                    fontWeight: 'bold', 
                    fontSize: '1.25rem', 
                    color: 'var(--primary)',
                    transition: 'left 0.2s ease-out'
                }}>{value || 0}</span>
            </div>
            <input 
              type="range" 
              min={field.min} 
              max={field.max} 
              step={field.step} 
              value={value || 0} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              disabled={!isEditing}
              style={{ width: '100%', cursor: isEditing ? 'pointer' : 'not-allowed', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{field.min}</span>
                <span>{field.max}</span>
            </div>
          </div>
        );
      case 'text':
        if (field.id.endsWith('_score') && value && field.id !== 'sorensen') {
            return null; 
        }
        if (field.id.endsWith('_data_previo')) return null;

        if (field.id.endsWith('_score_previo')) {
            return (
                <div key={field.id} className="form-group" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text)', fontSize: '0.95rem' }}>
                        Histórico Prévio Identificado: <span style={{ color: 'var(--primary)' }}>{value}</span>
                    </div>
                </div>
            );
        }
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <input 
              type="text" 
              {...commonProps}
              value={value || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
          </div>
        );
      case 'number':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <input 
              type="number" 
              {...commonProps}
              value={value || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
            {['resist_flexora', 'resist_extensora', 'flexao_60', 'sorensen'].includes(field.id) && (
                <MuscleEnduranceChart 
                    fieldId={field.id}
                    currentValue={Number(value) || 0}
                    gender={patientGender}
                    age={patientAge}
                    history={patientAssessments}
                />
            )}
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <select 
              {...commonProps}
              value={value || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            >
              <option value="">Selecione...</option>
              {(field.options || [0,1,2,3,4,5]).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        );
      case 'bodyschema':
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block' }}>{field.label}</label>
                <div style={{ pointerEvents: isEditing ? 'auto' : 'none', opacity: isEditing ? 1 : 0.8 }}>
                    <BodySchema 
                        key={field.id}
                        image={field.image || ""} 
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                    />
                </div>
            </div>
        );
      case 'image-upload':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <ImageUpload 
                value={value}
                isEditing={isEditing}
                onChange={(val) => handleInputChange(field.id, val)}
                onImageClick={onImageClick}
            />
          </div>
        );
      case 'paintmap':
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block' }}>{field.label}</label>
                <div style={{ pointerEvents: isEditing ? 'auto' : 'none', opacity: isEditing ? 1 : 0.8 }}>
                    <BodySchema 
                        key={field.id}
                        image={field.image || ""} 
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                        colors={field.colors}
                    />
                </div>
            </div>
        );
      case 'angle_measurement':
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block' }}>{field.label}</label>
                <div style={{ pointerEvents: isEditing ? 'auto' : 'none' }}>
                    <AngleMeasurement 
                        key={field.id}
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                    />
                </div>
            </div>
        );
      case 'freecanvas':
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block' }}>{field.label}</label>
                <div style={{ pointerEvents: isEditing ? 'auto' : 'none' }}>
                    <FreeCanvas 
                        key={field.id}
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                    />
                </div>
            </div>
        );
      case 'button':
        const isQuestButton = field.id.endsWith('_novo');
        const questType = field.id.split('_')[0];
        const scoreKey = field.id.replace('_novo', '_score');
        
        return (
            <div key={field.id} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button 
                    type="button"
                    onClick={() => {
                        if (isQuestButton) {
                            router.push(`/dashboard/assessment/${patientId}/${questType}?returnTo=${type}`);
                        }
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                    {field.label}
                </button>

                {scoreKey && value && (
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Score Identificado: {value}
                        </div>
                        <FunctionalHistoryChart 
                            type={questType}
                            currentScore={Number(String(value).replace('%', '')) || 0}
                            history={patientAssessments}
                            isEmbedded={true}
                            assessmentId={assessmentId}
                        />
                    </div>
                )}
            </div>
        );
      default:
        return null;
    }
});

const FormSection = memo(({ 
    section, 
    answers, 
    isEditing, 
    handleInputChange, 
    onImageClick, 
    patientGender, 
    patientAge, 
    patientAssessments, 
    patientId, 
    type, 
    assessmentId,
    router,
    isPrint 
}: { 
    section: Section, 
    answers: Record<string, any>, 
    isEditing: boolean, 
    handleInputChange: (id: string, val: any) => void,
    onImageClick: (img: string) => void,
    patientGender: string,
    patientAge: number,
    patientAssessments: any[],
    patientId: string,
    type: string,
    assessmentId: string | null,
    router: any,
    isPrint: boolean
}) => {
    return (
        <motion.div
            initial={isPrint ? {} : { opacity: 0, x: 20 }}
            animate={isPrint ? {} : { opacity: 1, x: 0 }}
            className="section-container"
            style={{ marginBottom: '2.5rem' }}
        >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {section.title}
            </h3>

            {section.type === 'table' ? (
                <DataTable 
                    section={section} 
                    answers={answers} 
                    isEditing={isEditing} 
                    handleInputChange={handleInputChange} 
                    onImageClick={onImageClick}
                    isPrint={isPrint}
                />
            ) : section.type === 'multi-table' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {section.subsections?.map((sub: any, sidx: number) => (
                        <div key={sidx} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--secondary)' }}>{sub.title}</h4>
                            {sub.type === 'table' ? (
                                <DataTable 
                                    section={sub} 
                                    answers={answers} 
                                    isEditing={isEditing} 
                                    handleInputChange={handleInputChange} 
                                    onImageClick={onImageClick}
                                    isPrint={isPrint}
                                />
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {sub.fields?.map((field: any) => (
                                        <FormField 
                                            key={field.id}
                                            field={field}
                                            value={answers[field.id]}
                                            isEditing={isEditing}
                                            handleInputChange={handleInputChange}
                                            onImageClick={onImageClick}
                                            patientGender={patientGender}
                                            patientAge={patientAge}
                                            patientAssessments={patientAssessments}
                                            patientId={patientId}
                                            type={type}
                                            assessmentId={assessmentId}
                                            router={router}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {section.fields?.map((field: any) => (
                        <FormField 
                            key={field.id}
                            field={field}
                            value={answers[field.id]}
                            isEditing={isEditing}
                            handleInputChange={handleInputChange}
                            onImageClick={onImageClick}
                            patientGender={patientGender}
                            patientAge={patientAge}
                            patientAssessments={patientAssessments}
                            patientId={patientId}
                            type={type}
                            assessmentId={assessmentId}
                            router={router}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
});


function AssessmentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const type = params.type as string;
  const assessmentId = searchParams.get("id");

  const questionnaire = questionnairesData[type];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [originalAnswers, setOriginalAnswers] = useState<Record<string, any>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(!assessmentId);
  const [showLogs, setShowLogs] = useState(false);
  const [changeLogs, setChangeLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [assessmentOwner, setAssessmentOwner] = useState<any>(null);
  const [assessmentOwnerId, setAssessmentOwnerId] = useState<string | null>(null);
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toLocaleDateString('pt-BR'));
  const [patientName, setPatientName] = useState<string>("");
  const [patientGender, setPatientGender] = useState<string>("");
  const [patientAge, setPatientAge] = useState<number>(0);
  const [patientAssessments, setPatientAssessments] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Handle autoPrint: if ?autoPrint=true is in the URL, trigger print once the page loads
  const autoPrint = searchParams.get("autoPrint") === "true";
  useEffect(() => {
    if (!autoPrint || !assessmentId) return;
    // Wait for data to load before printing
    const timer = setTimeout(() => {
      window.print();
    }, 1500);
    return () => clearTimeout(timer);
  }, [autoPrint, assessmentId]);


  useEffect(() => {
    async function load() {
        // Fetch Patient Data
        const pRes = await getPatient(patientId);
        if (pRes.success && pRes.data) {
            setPatientName(pRes.data.name);
            setPatientGender(pRes.data.gender || "");
            setPatientAge(pRes.data.age || 0);
        }

        // Fetch All Patient Assessments for history charts
        const hRes = await import("@/app/dashboard/actions").then(m => m.getPatientAssessments(patientId));
        let latestQuest = null;
        if (hRes.success && hRes.data) {
            const all = hRes.data.assessments;
            setPatientAssessments(all.map((a: any) => ({
                id: a.id,
                assessment_type: a.assessment_type,
                created_at: a.created_at,
                answers: a.questionnaire_answers,
                scoreData: a.clinical_data
            })));

            if (!assessmentId && (type === 'afLombar' || type === 'afCervical' || type === 'afOmbro')) {
                const questType = type === 'afLombar' ? 'oswestry' : type === 'afCervical' ? 'ndi' : 'quickdash';
                // Find latest score > 0 that is NOT from the current session or today if possible
                const today = new Date().toLocaleDateString('pt-BR');
                latestQuest = all.find((a: any) => 
                    a.assessment_type === questType && 
                    (a.clinical_data?.percentage || 0) > 0 &&
                    new Date(a.created_at).toLocaleDateString('pt-BR') !== today
                );
                
                // Fallback: if none from other days, take the latest > 0 from today that isn't the current one (id check)
                if (!latestQuest) {
                    latestQuest = all.find((a: any) => 
                        a.assessment_type === questType && 
                        (a.clinical_data?.percentage || 0) > 0 &&
                        a.id !== assessmentId
                    );
                }
            }
        }

        // Checkpoint redirection if returning to an edited assessment without ID in URL
        const checkpointStr = localStorage.getItem(`checkpoint_${patientId}_${type}`);
        if (checkpointStr && !assessmentId) {
            try {
                const cp = JSON.parse(checkpointStr);
                if (cp.assessmentId) {
                    router.replace(`/dashboard/assessment/${patientId}/${type}?id=${cp.assessmentId}`);
                    return; // Yield to route change
                }
            } catch(e) {}
        }

        if (assessmentId) {
            const res = await getAssessment(assessmentId);
            if (res.success && res.data) {
                const data = res.data as any;
                const loadedAnswers = data.questionnaire_answers as Record<string, any>;
                setOriginalAnswers(loadedAnswers);
                setChangeLogs(data.change_logs as any[] || []);
                setAssessmentOwnerId(data.created_by_id);
                setAssessmentOwner(data.created_by);
                if (data.created_at) {
                    setAssessmentDate(new Date(data.created_at).toLocaleDateString('pt-BR'));
                }
                
                let finalAnswers = loadedAnswers;
                if (checkpointStr) {
                    try {
                        const cp = JSON.parse(checkpointStr);
                        finalAnswers = { ...loadedAnswers, ...cp.answers };
                        setIsEditing(true);
                    } catch(e) {}
                    localStorage.removeItem(`checkpoint_${patientId}_${type}`);
                } else {
                    setIsEditing(false);
                }
                setAnswers(finalAnswers);
            }
        } else {
            // Check for draft or checkpoint
            const draftKey = `assessment_draft_${patientId}_${type}`;
            const draft = localStorage.getItem(draftKey);
            let currentAnswers: Record<string, any> = {};
            
            if (checkpointStr) {
                try {
                    const cp = JSON.parse(checkpointStr);
                    currentAnswers = cp.answers || {};
                } catch(e) {}
                localStorage.removeItem(`checkpoint_${patientId}_${type}`);
            } else if (draft) {
                try {
                    currentAnswers = JSON.parse(draft);
                } catch (e) {
                    console.error("Erro ao carregar rascunho:", e);
                }
            }

            // If no draft but we have a latest quest, populate previous fields
            if (Object.keys(currentAnswers).length === 0 && latestQuest) {
                const prefix = type === 'afLombar' ? 'oswestry' : type === 'afCervical' ? 'ndi' : 'quickdash';
                const score = (latestQuest as any).scoreData?.percentage || (latestQuest as any).clinical_data?.percentage || 0;
                if (score > 0) {
                    currentAnswers[`${prefix}_score_previo`] = `${score}%`;
                    if (latestQuest.created_at) {
                        currentAnswers[`${prefix}_data_previo`] = new Date(latestQuest.created_at).toISOString().split('T')[0];
                    }
                }
            }
            setAnswers(currentAnswers);
            if (draft && !checkpointStr) toast.info("Rascunho detectado e restaurado.");
        }

        // GLOBAL RETURN SCORE CHECK (applies to both NEW and EDITED assessments)
        const returnScoreKey = `return_score_${patientId}_${type}`;
        const returnScore = localStorage.getItem(returnScoreKey);
        if (returnScore) {
            let fieldId = 'score'; // fallback default

            if (type === 'afLombar') fieldId = 'oswestry_score';
            else if (type === 'afCervical') fieldId = 'ndi_score';
            else if (type === 'afOmbro' || type === 'afCotovelo' || type === 'afMao') fieldId = 'quickdash_score';
            else if (type === 'afGeriatria') {
                const geriatricScoreKeys = ['man_score', 'ves13_score', 'lbpq_score', 'brief_score'];
                for (const key of geriatricScoreKeys) {
                    const subKey = `return_score_${patientId}_${type}_${key}`;
                    const subScore = localStorage.getItem(subKey);
                    if (subScore) {
                        setAnswers(prev => ({ ...prev, [key]: subScore }));
                        localStorage.removeItem(subKey);
                    }
                }
                fieldId = ''; 
                localStorage.removeItem(returnScoreKey);
                toast.success(`Resultado do questionário importado!`);
            } else if (type === 'afMmii') {
                const mmiiScoreKeys = ['lysholm_score', 'womac_score', 'ikdc_score', 'aofas_score'];
                for (const key of mmiiScoreKeys) {
                    const subKey = `return_score_${patientId}_${type}_${key}`;
                    const subScore = localStorage.getItem(subKey);
                    if (subScore) {
                        setAnswers(prev => ({ ...prev, [key]: subScore }));
                        localStorage.removeItem(subKey);
                    }
                }
                fieldId = '';
                localStorage.removeItem(returnScoreKey);
                toast.success(`Resultado do questionário importado!`);
            }

            if (fieldId) {
                const formattedScore = returnScore.includes('%') ? returnScore : `${returnScore}%`;
                setAnswers(prev => ({ ...prev, [fieldId]: formattedScore }));
                localStorage.removeItem(returnScoreKey);
                toast.success(`Resultado do questionário importado!`);
            }
            
            // Jump to integration section
            if (questionnaire.sections) {
                const idx = questionnaire.sections.findIndex(s => s.id.includes('integracao'));
                if (idx !== -1) {
                    setCurrentIdx(idx);
                }
            }
        }
    }
    load();
  }, [assessmentId, patientId, type]);

  // Save draft to localStorage
  useEffect(() => {
    if (!assessmentId && Object.keys(answers).length > 0) {
        const draftKey = `assessment_draft_${patientId}_${type}`;
        localStorage.setItem(draftKey, JSON.stringify(answers));
    }
  }, [answers, patientId, type, assessmentId]);

  if (!questionnaire) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Questionário não encontrado.</div>;
  }

  const isClinical = !!questionnaire.sections;
  const items = isClinical ? questionnaire.sections! : questionnaire.questions!;
  const currentItem = items[currentIdx];
  const progress = ((currentIdx + 1) / items.length) * 100;

  const handleSelect = (value: number) => {
    if (!isEditing) return;
    setAnswers({ ...answers, [currentIdx]: value });
    if (currentIdx < items.length - 1) {
      setTimeout(() => setCurrentIdx(currentIdx + 1), 300);
    }
  };

  const handleInputChange = useCallback((fieldId: string, value: any) => {
    if (!isEditing) return;
    setAnswers(prev => {
        const newAnswers = { ...prev, [fieldId]: value };
        
        // Auto-calculate RL/RM ratio for Shoulder
        if (type === 'afOmbro' && (fieldId === 'forca_rl' || fieldId === 'forca_rm')) {
            const rl = Number(newAnswers['forca_rl']);
            const rm = Number(newAnswers['forca_rm']);
            if (rl && rm) {
                const ratio = Math.round((rl / rm) * 100);
                newAnswers['rl_rm_ratio'] = `${ratio}%`;
            } else {
                newAnswers['rl_rm_ratio'] = '';
            }
        }

        // New Table-based calculations for afOmbro
        if (type === 'afOmbro') {
            const movements = ['forca_abd', 'forca_rl', 'forca_rm'];
            movements.forEach(mId => {
                if (fieldId === `${mId}_esq` || fieldId === `${mId}_dir`) {
                    const esq = Number(newAnswers[`${mId}_esq`]);
                    const dir = Number(newAnswers[`${mId}_dir`]);
                    if (esq > 0 || dir > 0) {
                        const max = Math.max(esq, dir);
                        const min = Math.min(esq, dir);
                        const deficit = Math.round(((max - min) / max) * 100);
                        newAnswers[`${mId}_deficit`] = `${deficit}%`;
                    } else {
                        newAnswers[`${mId}_deficit`] = '';
                    }
                }
            });

            // Ratio calculation in new table format
            if (fieldId === 'forca_rl_esq' || fieldId === 'forca_rm_esq') {
                const rl = Number(newAnswers['forca_rl_esq']);
                const rm = Number(newAnswers['forca_rm_esq']);
                if (rl && rm) newAnswers['rl_rm_ratio_esq'] = `${Math.round((rl / rm) * 100)}%`;
                else newAnswers['rl_rm_ratio_esq'] = '';
            }
            if (fieldId === 'forca_rl_dir' || fieldId === 'forca_rm_dir') {
                const rl = Number(newAnswers['forca_rl_dir']);
                const rm = Number(newAnswers['forca_rm_dir']);
                if (rl && rm) newAnswers['rl_rm_ratio_dir'] = `${Math.round((rl / rm) * 100)}%`;
                else newAnswers['rl_rm_ratio_dir'] = '';
            }
        }

        // Auto-calculate Hip Ratio for afLombar
        if (type === 'afLombar' && (fieldId === 'mmii_ri_esq' || fieldId === 'mmii_re_esq')) {
            const ri = Number(newAnswers['mmii_ri_esq']);
            const re = Number(newAnswers['mmii_re_esq']);
            if (ri && re) newAnswers['mmii_ri_re_ratio_esq'] = `${Math.round((ri / re) * 100)}%`;
            else newAnswers['mmii_ri_re_ratio_esq'] = '';
        }
        if (type === 'afLombar' && (fieldId === 'mmii_ri_dir' || fieldId === 'mmii_re_dir')) {
            const ri = Number(newAnswers['mmii_ri_dir']);
            const re = Number(newAnswers['mmii_re_dir']);
            if (ri && re) newAnswers['mmii_ri_re_ratio_dir'] = `${Math.round((ri / re) * 100)}%`;
            else newAnswers['mmii_ri_re_ratio_dir'] = '';
        }

        return newAnswers;
    });
  }, [isEditing, type]);

  const isPrint = searchParams.get("print") === "true";

  const handleFinish = async () => {
    setSaving(true);
    
    // Get calculation type from questionnaire structure or use default
    const calculationType = (questionnaire as any).structure?.calculationType || (type as CalculationType);
    const result = calculateAssessmentScore(calculationType as CalculationType, answers);

    
    if (assessmentId) {
        const logEntries: string[] = [];
        const timestamp = new Date().toLocaleString('pt-BR');
        
        if (isClinical) {
            questionnaire.sections?.forEach(section => {
                section.fields?.forEach(field => {
                    const oldVal = originalAnswers[field.id];
                    const newVal = answers[field.id];
                    
                    if (String(oldVal || "") !== String(newVal || "")) {
                        if (field.type === 'bodyschema') {
                            logEntries.push(`${timestamp} - ${user?.name || 'Usuário'} alterou o mapa corporal.`);
                        } else {
                            logEntries.push(`${timestamp} - ${user?.name || 'Usuário'} alterou o campo '${field.label}' de '${oldVal || 'vazio'}' para '${newVal || 'vazio'}'`);
                        }
                    }
                });

                // Also log table changes if any
                if (section.type === 'table' && section.rows) {
                    section.rows.forEach(row => {
                        row.fields.forEach(field => {
                            const fieldId = typeof field === 'string' ? field : field.id;
                            const oldVal = originalAnswers[fieldId];
                            const newVal = answers[fieldId];
                            if (String(oldVal || "") !== String(newVal || "")) {
                                logEntries.push(`${timestamp} - ${user?.name || 'Usuário'} alterou '${row.label} (${fieldId})' de '${oldVal || 'vazio'}' para '${newVal || 'vazio'}'`);
                            }
                        });
                    });
                }
            });
        } else {
            questionnaire.questions?.forEach((q, idx) => {
                const oldVal = originalAnswers[idx];
                const newVal = answers[idx];
                if (oldVal !== newVal) {
                    const oldLabel = q.options?.find(o => o.value === oldVal)?.label || 'vazio';
                    const newLabel = q.options?.find(o => o.value === newVal)?.label || 'vazio';
                    logEntries.push(`${timestamp} - ${user?.name || 'Usuário'} alterou a questão '${q.text}' de '${oldLabel}' para '${newLabel}'`);
                }
            });
        }

        
        if (logEntries.length > 0) {
            const response = await updateAssessment(assessmentId, {
                answers,
                scoreData: result,
                logEntries: logEntries
            });

            if (response.success) {
                toast.success("Alterações salvas com sucesso!");
                setIsEditing(false);
                
                const newLocalLogs = logEntries.map(entry => ({ 
                    timestamp: new Date().toISOString(), 
                    entry 
                }));
                
                setChangeLogs([...changeLogs, ...newLocalLogs]);
                setOriginalAnswers(answers);
            } else {
                toast.error("Erro ao atualizar avaliação.");
            }
        } else {
            setIsEditing(false);
            toast.info("Nenhuma alteração detectada.");
        }
    } else {
        const response = await saveAssessment({
            patientId,
            type,
            segment: questionnaire.segment,
            answers,
            scoreData: result,
            userId: user?.id
        });


        if (response.success) {
            setIsFinished(true);
            toast.success("Avaliação salva com sucesso!");
            // Clear draft
            const draftKey = `assessment_draft_${patientId}_${type}`;
            localStorage.removeItem(draftKey);
        } else {
            toast.error("Erro ao salvar avaliação.");
        }
    }
    setSaving(false);
  };

  const handleHeaderAction = (action: any, columnIndex: number, section: Section) => {
    if (action.type === 'fill') {
        const newAnswers = { ...answers };
        section.rows?.forEach(row => {
            const field = row.fields[columnIndex - 1]; // -1 because first column is row label
            if (field) {
                const fieldId = typeof field === 'string' ? field : field.id;
                newAnswers[fieldId] = action.value;
            }
        });
        setAnswers(newAnswers);
        if (!isEditing) setIsEditing(true);
        toast.info(`Coluna preenchida com ${action.value}`);
    }
  };

  // Old render functions removed for performance optimization

  if (isFinished) {
    const result = questionnaire.calculateScore?.(answers);
    const returnTo = searchParams.get("returnTo");

    const handleReturn = () => {
        if (returnTo) {
            // For geriatric sub-questionnaires, save to specific field key
            const mmiiMapping: Record<string, string> = {
                lysholm: 'lysholm_score',
                womac: 'womac_score',
                ikdc: 'ikdc_score',
                aofas: 'aofas_score',
            };

            const geriatricMapping: Record<string, string> = {
                man: 'man_score',
                ves13: 'ves13_score',
                lbpq: 'lbpq_score',
                brief: 'brief_score',
            };

            const fieldKey = geriatricMapping[type] || mmiiMapping[type];
            const isGeriatricTarget = returnTo === 'afGeriatria';
            const isMmiiTarget = returnTo === 'afMmii';

            if ((isGeriatricTarget || isMmiiTarget) && fieldKey) {
                // Save with the specific score key
                let scoreStr = "";
                if (result.unit === 'média') {
                    scoreStr = `${result.interpretation}`;
                } else if (result.unit === 'pontos') {
                    scoreStr = `${result.score} pts — ${result.interpretation}`;
                } else {
                    scoreStr = `${result.percentage}% — ${result.interpretation}`;
                }
                
                localStorage.setItem(`return_score_${patientId}_${returnTo}_${fieldKey}`, scoreStr);
                // Also set the general key without % so the parent code knows to check questionnaire-specific keys
                localStorage.setItem(`return_score_${patientId}_${returnTo}`, isGeriatricTarget ? 'geriatria' : 'mmii');
            } else {
                localStorage.setItem(`return_score_${patientId}_${returnTo}`, String(result.percentage));
            }
            router.push(`/dashboard/assessment/${patientId}/${returnTo}`);
        }
    };

    return (
      <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: 'white' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'var(--primary-light)', padding: '1.5rem', borderRadius: '1rem', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
                <CheckCircle size={48} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>Avaliação Concluída!</h2>
                <p style={{ color: 'var(--text)' }}>Abaixo estão os dados registrados prontos para conferência ou impressão.</p>
            </div>
        </div>

        {renderFullPrintView()}

        <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <button
                className="btn-action-outline"
                onClick={() => window.print()}
                style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid var(--border)', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: 'white' }}
            >
                <Printer size={20} /> Imprimir Avaliação
            </button>
            {returnTo && (
                <button 
                    className="btn-primary"
                    onClick={handleReturn}
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '0.75rem', cursor: 'pointer' }}
                >
                    Retornar ao Questionário
                </button>
            )}
            <button 
                className="btn-primary"
                onClick={() => router.push(`/dashboard/patient/${patientId}`)}
                style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '0.75rem', cursor: 'pointer', backgroundColor: 'var(--secondary)' }}
            >
                Voltar ao Histórico
          </button>
        </div>
      </div>
    );
  }

  function renderFullPrintView() {
    return (
      <div className="print-all-content">
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>
            <h1 style={{ fontSize: '2rem', color: '#000', marginBottom: '0.5rem' }}>{questionnaire.title}</h1>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Paciente: {patientName || patientId}</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>Data da Avaliação: {assessmentDate}</p>
            {(user || assessmentOwner) && (
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '600' }}>
                    Avaliador: {(assessmentOwner?.name || user?.name)} 
                    {((assessmentOwner?.crefito || user?.crefito)) ? ` (CREFITO: ${assessmentOwner?.crefito || user?.crefito})` : ""}
                </p>
            )}
        </div>

        {items.map((item, idx) => (
            <FormSection 
                key={idx}
                section={item as Section}
                isPrint={true}
                answers={answers}
                handleInputChange={handleInputChange}
                isEditing={false}
                onImageClick={setSelectedImage}
                patientGender={patientGender}
                patientAge={patientAge}
                patientAssessments={patientAssessments}
                assessmentId={assessmentId}
                patientId={patientId}
                type={type}
                router={router}
            />
        ))}

        {isFinished && !isClinical && (
            <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid #8B0000', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Resultado da Avaliação:</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#8B0000' }}>
                    {(() => {
                        const res = calculateAssessmentScore((questionnaire as any).structure?.calculationType || (type as CalculationType), answers);
                        let scoreStr = `${res.score} pts`;
                        if (res.percentage !== undefined && res.unit === '%') {
                            scoreStr += ` (${res.percentage}%)`;
                        }
                        const displayInterpretation = res.interpretation === 'Avaliação Concluída' ? '' : ` — ${res.interpretation}`;
                        return `Pontuação: ${scoreStr}${displayInterpretation}`;
                    })()}
                </div>
            </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            {['ndi', 'oswestry', 'quickdash', 'man', 'ves13', 'lbpq', 'brief', 'lysholm', 'womac', 'ikdc', 'aofas'].map(questType => {
                const scoreKey = `${questType}_score`;
                const scoreValue = answers[scoreKey] || answers[`${questType}_score_previo`];
                if (!scoreValue) return null;
                
                const numScore = Number(String(scoreValue).split('%')[0].trim()) || 0;
                const labels: Record<string, string> = {
                    ndi: "Neck Disability Index (NDI)", oswestry: "Índice de Oswestry (ODI)", quickdash: "QuickDASH",
                    man: "Mini Avaliação Nutricional (MAN)", ves13: "Vulnerabilidade (VES-13)",
                    lbpq: "Questionário de Dor Lombar (LBPQ)", brief: "Inventário Breve de Dor (BPI-SF)",
                    lysholm: "Questionário de Lysholm", womac: "WOMAC", ikdc: "IKDC", aofas: "AOFAS"
                };

                return (
                    <div key={`print-functional-chart-${questType}`} className="print-chart-container" style={{ width: '100%', maxWidth: '600px', pageBreakInside: 'avoid', margin: '0 auto' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8B0000', marginBottom: '0.5rem', textAlign: 'center' }}>
                            Evolução: {labels[questType]}
                        </div>
                        <FunctionalHistoryChart 
                            type={questType}
                            currentScore={numScore}
                            history={patientAssessments}
                            isEmbedded={true}
                            isPrint={true}
                            assessmentId={assessmentId}
                        />
                    </div>
                );
            })}
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div className="background-gradient" />
      
      <Header />

      <main className="no-print container main-content">
        <header className="assessment-header">
            <div className="header-top stack-on-mobile">
                <div className="header-left">
                    <button 
                        onClick={() => router.back()}
                        className="btn-exit"
                    >
                        <ArrowLeft size={18} />
                        <span>Sair</span>
                    </button>

                    {(user || assessmentOwner) && (
                        <div className="evaluator-info">
                            <div className="info-row">
                                <span className="label">Avaliador:</span>
                                <span className="value">
                                    {(assessmentOwner?.name || user?.name)} 
                                    {((assessmentOwner?.crefito || user?.crefito)) ? ` (CREFITO: ${assessmentOwner?.crefito || user?.crefito})` : ""}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="label">Data:</span>
                                <span className="value">{assessmentDate}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="header-center">
                    <h1 className="page-title">{questionnaire.title}</h1>
                </div>
                
                <div className="header-actions">
                    <button 
                        onClick={() => window.print()}
                        className="btn-action-outline"
                    >
                        <Printer size={16} />
                        <span>Imprimir</span>
                    </button>

                    {assessmentId && !isEditing && (user?.role === 'ADMINISTRADOR' || assessmentOwnerId === user?.id) && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="btn-action-primary"
                        >
                            <Edit2 size={16} />
                            <span>Editar</span>
                        </button>
                    )}
                </div>
            </div>

            <PatientInfoBanner patientId={patientId} />
        </header>

        <div className="assessment-form-container">
            {/* Progress Bar */}
            <div className="progress-bar-wrapper">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="progress-bar-fill"
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="assessment-card"
                >
                    {isClinical ? (
                        <FormSection 
                            section={currentItem as Section}
                            answers={answers}
                            handleInputChange={handleInputChange}
                            isEditing={isEditing}
                            onImageClick={setSelectedImage}
                            patientGender={patientGender}
                            patientAge={patientAge}
                            patientAssessments={patientAssessments}
                            assessmentId={assessmentId}
                            patientId={patientId}
                            isPrint={false}
                            type={type}
                            router={router}
                        />
                    ) : (
                        <FormSection 
                            section={currentItem as any}
                            answers={answers}
                            handleInputChange={handleInputChange}
                            isEditing={isEditing}
                            onImageClick={setSelectedImage}
                            patientGender={patientGender}
                            patientAge={patientAge}
                            patientAssessments={patientAssessments}
                            assessmentId={assessmentId}
                            patientId={patientId}
                            isPrint={false}
                            type={type}
                            router={router}
                        />
                    )}

                    <div className="navigation-footer">
                        <button
                            disabled={currentIdx === 0}
                            onClick={() => {
                                setCurrentIdx(currentIdx - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-nav-back"
                        >
                            <ChevronLeft size={20} />
                            <span>Anterior</span>
                        </button>

                        <div className="nav-main-actions">
                            {currentIdx < items.length - 1 && (
                                <button
                                    onClick={() => {
                                        setCurrentIdx(currentIdx + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="btn-nav-next"
                                >
                                    <span>Próxima</span>
                                    <ChevronRight size={20} />
                                </button>
                            )}

                            {isEditing && currentIdx === items.length - 1 && (
                                <button
                                    disabled={saving}
                                    onClick={handleFinish}
                                    className="btn-finish"
                                >
                                    <span>{saving ? "Salvando..." : (assessmentId ? "Salvar" : "Finalizar")}</span>
                                    {assessmentId && <Save size={20} />}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Audit Log Timeline */}
            {assessmentId && changeLogs.length > 0 && (
                <div className="audit-log-section">
                    <button 
                        onClick={() => setShowLogs(!showLogs)}
                        className="log-toggle-btn"
                    >
                        <div className="log-toggle-left">
                            <HistoryIcon size={20} className="icon" />
                            <span>Histórico de Alterações ({changeLogs.length})</span>
                        </div>
                        {showLogs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    <AnimatePresence>
                        {showLogs && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="log-content"
                            >
                                <div className="timeline">
                                    <div className="timeline-line" />
                                    
                                    {changeLogs.map((log, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-dot" />
                                            <p className="timeline-text">{log.entry}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
      </main>

      <div className="print-restricted-wrapper">
         {renderFullPrintView()}
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                className="image-zoom-overlay"
            >
                <div className="zoom-close">
                    <X size={32} />
                </div>
                <motion.img 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    src={selectedImage} 
                    alt="Zoom" 
                />
            </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .print-restricted-wrapper {
          display: none;
        }
        @media print {
          .print-restricted-wrapper {
            display: block;
          }
        }
        .assessment-page {
          min-height: 100vh;
          background-color: var(--bg);
        }
        .main-content {
          padding: 2rem 1.5rem;
        }
        .assessment-header {
          margin-bottom: 2.5rem;
        }
        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .btn-exit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: rgba(255,255,255,0.8);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
        }
        .evaluator-info {
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
          padding-left: 1rem;
          margin-left: 0.5rem;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .info-row .label {
          font-weight: 600;
        }
        .info-row .value {
          color: var(--text);
          font-weight: 700;
        }
        .page-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--secondary);
          margin: 0;
          text-align: center;
        }
        .header-actions {
          display: flex;
          gap: 0.75rem;
        }
        .btn-action-outline, .btn-action-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          white-space: nowrap;
        }
        .btn-action-outline {
          background-color: white;
          color: var(--secondary);
          border: 1px solid var(--border);
        }
        .btn-action-primary {
          background-color: var(--primary);
          color: white;
          border: none;
        }
        
        .assessment-form-container {
          max-width: 750px;
          margin: 0 auto;
          padding-bottom: 5rem;
        }
        .progress-bar-wrapper {
          width: 100%;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 3rem;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background-color: var(--primary);
        }
        .assessment-card {
          background-color: white;
          padding: 2.5rem;
          border-radius: 2rem;
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--border);
          position: relative;
        }
        .section-title {
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 2.5rem;
          color: var(--primary);
        }
        .section-fields {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .functional-title {
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 2.5rem;
          line-height: 1.3;
          color: var(--secondary);
        }
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .option-button {
          width: 100%;
          text-align: left;
          padding: 1.5rem;
          border-radius: 1.25rem;
          border: 2px solid #f3f4f6;
          background-color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .option-button.selected {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }
        .option-label {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text);
        }
        .selected .option-label {
          color: var(--primary);
        }
        .radio-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .selected .radio-circle {
          border-color: var(--primary);
        }
        .radio-inner {
          width: 12px;
          height: 12px;
          background-color: var(--primary);
          border-radius: 50%;
        }
        
        .navigation-footer {
          margin-top: 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }
        .btn-nav-back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
        }
        .btn-nav-back:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .nav-main-actions {
          display: flex;
          gap: 1rem;
        }
        .btn-finish, .btn-nav-next {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-finish {
          background-color: var(--primary);
          color: white;
          border: none;
        }
        .btn-nav-next {
          background-color: var(--primary-light);
          color: var(--primary);
          border: none;
        }
        
        .audit-log-section {
          margin-top: 3rem;
        }
        .log-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background-color: white;
          border: 1px solid var(--border);
          border-radius: 1rem;
          cursor: pointer;
          font-weight: 600;
          color: var(--secondary);
        }
        .log-toggle-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .log-toggle-left .icon {
          color: var(--primary);
        }
        .log-content {
          background-color: white;
          border: 1px solid var(--border);
          border-top: none;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
          padding: 1.5rem;
          overflow: hidden;
        }
        .timeline {
          position: relative;
          padding-left: 2rem;
        }
        .timeline-line {
          position: absolute;
          left: 7px;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: #e5e7eb;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }
        .timeline-dot {
          position: absolute;
          left: -28px;
          top: 4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--primary);
          border: 3px solid white;
        }
        .timeline-text {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text);
          font-weight: 500;
        }
        
        .image-zoom-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
        }
        .zoom-close {
          position: absolute;
          top: 2rem;
          right: 2rem;
          color: white;
          cursor: pointer;
        }
        .image-zoom-overlay img {
          max-width: 100%;
          max-height: 100%;
          border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }

        .chart-container {
            margin-top: 1.5rem;
            margin-bottom: 2rem;
        }
        .table-responsive-wrapper {
            overflow-x: auto;
            width: 100%;
            -webkit-overflow-scrolling: touch;
        }
        .print-all-content {
            display: none;
        }
        @media (max-width: 768px) {
          .main-content {
            padding: 1.5rem 1rem;
          }
          .header-top {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-center {
            order: -1;
            width: 100%;
          }
          .page-title {
            text-align: left;
            font-size: 1.5rem;
          }
          .header-actions {
            width: 100%;
          }
          .header-actions button {
            flex: 1;
            justify-content: center;
          }
          .evaluator-info {
            display: none;
          }
          .assessment-card {
            padding: 1.5rem;
            border-radius: 1.25rem;
          }
          .section-title, .functional-title {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
          }
          .option-button {
            padding: 1rem;
            border-radius: 0.75rem;
          }
          .option-label {
            font-size: 1rem;
          }
          .navigation-footer {
            flex-direction: column-reverse;
            gap: 1.5rem;
            margin-top: 2.5rem;
          }
          .nav-main-actions {
            width: 100%;
            flex-direction: column;
          }
          .btn-nav-back, .btn-finish, .btn-nav-next {
            width: 100%;
            justify-content: center;
            padding: 1rem;
          }
        }
      `}</style>

      <style jsx global>{`
        @media print {
            @page { margin: 0.8cm; }
            .no-print { display: none !important; }
            .print-all-content { display: block !important; width: 100% !important; background: white !important; color: black !important; }
            body { background: white !important; padding: 0 !important; overflow: visible !important; }
            .background-gradient { display: none !important; }
            .form-group { break-inside: avoid; margin-bottom: 0.5rem !important; }
            div[style*="max-width: 800px"] { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            div[style*="box-shadow"], div[style*="border: 1px solid var(--border)"] { 
                box-shadow: none !important; 
                border: none !important; 
                padding: 0 !important; 
                margin: 0 !important; 
                background: none !important;
            }
            main { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
            table { font-size: 8pt !important; width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
            th, td { border: 1px solid #333 !important; padding: 3px 6px !important; word-wrap: break-word !important; }
            .btn-primary, button, .no-print-element { display: none !important; }
            img, canvas { max-width: 100% !important; height: auto !important; }
            .print-section { page-break-inside: auto; margin-bottom: 0.75rem; }
            footer, .footer, #footer { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            /* Chart fixes for print */
            .chart-container { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; padding: 0.75rem !important; }
            .chart-bars-container { min-height: 140px !important; }
            .print-chart-container { page-break-inside: avoid; }
            /* Prevent title from orphaning from its content */
            h3 { page-break-after: avoid; }
            h4 { page-break-after: avoid; }
            /* Keep table headers with their table body */
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
            /* Keep sections together */
            .print-section div { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

export default function AssessmentPage() {
    return (
        <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Carregando...</div>}>
            <AssessmentContent />
        </Suspense>
    );
}
