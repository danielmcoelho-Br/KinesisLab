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
    Maximize2,
    Calculator,
    ArrowUp,
    ArrowDownLeft,
    ArrowDownRight,
    Ruler
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
import PosturalAnalysisModal from "@/components/PosturalAnalysisModal";
import { calculateAssessmentScore, CalculationType } from "@/lib/calculations";
import { compressImage } from "@/lib/image-compressor";

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
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
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

const AssessmentHistoryChart = ({ 
    currentValue, 
    fieldId,
    chartTitle,
    unit = 'seg',
    history = [], 
    isPrint = false,
    referenceValue,
    referenceLabel,
    assessmentId,
    currentDate = new Date().toLocaleDateString('pt-BR'),
    isEndurance = false,
    useScoreData = false
}: { 
    currentValue: number, 
    fieldId?: string,
    chartTitle: string,
    unit?: string,
    history?: any[], 
    isPrint?: boolean,
    referenceValue?: number,
    referenceLabel?: string,
    assessmentId?: string | null,
    currentDate?: string,
    isEndurance?: boolean,
    useScoreData?: boolean
}) => {
    // Filter history for the specific field, score > 0, and NOT the current assessment being viewed
    const validHistory = history.filter(h => {
        const val = useScoreData ? Number(h.scoreData?.score) : Number(h.answers?.[fieldId || '']);
        return val > 0 && h.id !== assessmentId;
    });

    if (!currentValue && validHistory.length === 0 && !isPrint) return null;

    const maxValue = Math.max(
        currentValue || 0,
        referenceValue || 0,
        ...validHistory.map(h => {
            const val = useScoreData ? Number(h.scoreData?.score) : Number(h.answers?.[fieldId || '']);
            return val || 0;
        })
    ) * 1.2 || 60;
    
    const validHistoryData = validHistory.map(h => ({
        id: h.id,
        value: useScoreData ? Number(h.scoreData?.score) : Number(h.answers?.[fieldId || '']),
        date: new Date(h.created_at).toLocaleDateString('pt-BR'),
        timestamp: new Date(h.created_at).getTime()
    })).sort((a, b) => a.timestamp - b.timestamp);

    const totalBars = validHistoryData.length + (currentValue ? 1 : 0) + (referenceValue ? 1 : 0);
    const chartMaxWidth = isPrint ? (isEndurance ? '100%' : `${Math.min(50, Math.max(25, totalBars * 12))}%`) : '100%';



    return (
        <div className="chart-container">
            <h4 className="chart-title">
                <ImageIcon size={18} /> {chartTitle}
            </h4>
            <div className="chart-scroll-wrapper">
                <div className="chart-bars-container" style={{ position: 'relative' }}>
                    {referenceValue && (
                        <div style={{ 
                            position: 'absolute', 
                            left: 0, 
                            right: 0, 
                            bottom: `calc(${(referenceValue / (maxValue || 1)) * 150}px + 30px)`, // 30px is roughly the label height offset if any, but Bar uses bottom alignment
                            borderTop: '2px dashed #94a3b8',
                            zIndex: 5,
                            pointerEvents: 'none'
                        }}>
                            <span style={{ 
                                position: 'absolute', 
                                top: '-1.1rem', 
                                right: '10px', 
                                fontSize: '0.65rem', 
                                fontWeight: '800', 
                                color: '#64748b',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                whiteSpace: 'nowrap'
                            }}>
                                {referenceLabel || 'Ref'}: {referenceValue}{unit}
                            </span>
                        </div>
                    )}
                    
                    {referenceValue && (
                        <Bar 
                            value={referenceValue} 
                            maxValue={maxValue}
                            label="Referência" 
                            unit={unit}
                            color="#cbd5e1" 
                            isPrint={isPrint}
                        />
                    )}

                    {(() => {
                        // Count occurrences per date to add suffixes
                        const dateCounts = new Map();
                        validHistoryData.forEach(item => {
                            dateCounts.set(item.date, (dateCounts.get(item.date) || 0) + 1);
                        });

                        const currentCounts = new Map();
                        return validHistoryData.map((d: any) => {
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
                                    unit={unit}
                                    color={isPrint ? "#fee2e2" : "var(--primary-light)"} 
                                    isPrint={isPrint}
                                />
                            );
                        });
                    })()}

                    <Bar 
                        value={Number(currentValue) || 0} 
                        maxValue={maxValue}
                        label={assessmentId ? currentDate : new Date().toLocaleDateString('pt-BR')} 
                        unit={unit}
                        color={isPrint ? "#8B0000" : "var(--primary)"} 
                        isPrint={isPrint}
                    />
                </div>
            </div>
            <style jsx>{`
                .chart-container {
                    margin-top: 1rem;
                    margin-bottom: 1.5rem;
                    background-color: white;
                    border-radius: 1rem;
                    border: 1px solid var(--border);
                    box-shadow: ${isPrint ? 'none' : 'var(--shadow-sm)'};
                    max-width: ${isPrint ? chartMaxWidth : '100%'};
                    overflow-x: ${isPrint ? 'hidden' : 'auto'};
                    -webkit-overflow-scrolling: touch;
                }
                .chart-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    margin-bottom: 1.25rem;
                    color: var(--secondary);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .chart-scroll-wrapper {
                    overflow-x: ${isPrint ? 'hidden' : 'auto'};
                    padding-bottom: 0.5rem;
                }
                .chart-bars-container {
                    display: flex;
                    gap: ${isPrint ? '0.5rem' : '0.75rem'};
                    align-items: flex-end;
                    min-height: 180px;
                    min-width: ${isPrint ? 'auto' : '250px'};
                    width: ${isPrint ? '100%' : 'auto'};
                }
                @media (max-width: 600px) {
                    .chart-container {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

const FunctionalHistoryChart = ({ history = [], currentScore, type, isEmbedded = false, isPrint = false, assessmentId, assessmentDate = new Date().toLocaleDateString('pt-BR') }: { history: any[], currentScore: number, type: string, isEmbedded?: boolean, isPrint?: boolean, assessmentId?: string | null, assessmentDate?: string }) => {
    if (history.length === 0 && !currentScore && !isPrint) return null;

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
        const dKey = item.date === 'Hoje' ? (assessmentId ? assessmentDate : todayStr) : item.date;
        const count = (currentCounts.get(dKey) || 0) + 1;
        currentCounts.set(dKey, count);
        const hasMultiple = dateCounts.get(dKey) > 1;
        
        let displayLabel = item.date === 'Hoje' ? (assessmentId ? assessmentDate : todayStr) : item.date;
        if (hasMultiple) {
            displayLabel = `${displayLabel} (${count})`;
        }

        return {
            ...item,
            displayDate: displayLabel
        };
    });

    if (processedData.length === 0 && !isPrint) return null;

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

    return (
        <div className={`history-chart-container ${isEmbedded ? 'embedded' : ''}`}>
            <h4 className="history-chart-title">
                Evolução Funcional (% Incapacidade - {type.toUpperCase()})
            </h4>
            <div className="history-chart-scroll">
                <div className="history-chart-bars" style={{ display: 'flex', gap: isPrint ? '0.6rem' : '1rem', alignItems: 'flex-end', minHeight: '180px' }}>
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
                    transform: ${isPrint ? 'none' : 'scale(0.9)'};
                    width: ${isPrint ? '100%' : '111%'};
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
                    overflow-x: ${isPrint ? 'hidden' : 'auto'};
                    padding-bottom: 0.5rem;
                }
                .history-chart-bars {
                    display: flex;
                    gap: ${isPrint ? '0.6rem' : '1rem'};
                    align-items: flex-end;
                    height: 200px;
                    min-width: ${isPrint ? 'auto' : '300px'};
                    width: ${isPrint ? '100%' : 'auto'};
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
                    .history-chart-container {
                        padding: 1rem;
                        overflow-x: auto;
                    }
                    .history-chart-bars {
                        min-width: 400px;
                    }
                }
            `}</style>
        </div>
    );
};


const AssessmentComparisonChart = memo(({ 
    label, 
    leftValue, 
    rightValue,
    unit = "kgF",
    isPrint = false,
    normValue,
    history = [],
    fieldIdPrefix = ""
}: { 
    label: string, 
    leftValue: number, 
    rightValue: number,
    unit?: string,
    isPrint?: boolean,
    normValue?: number,
    history?: any[],
    fieldIdPrefix?: string
}) => {
    const maxValue = Math.max(leftValue, rightValue, normValue || 0, 1) * 1.1;
    const leftHeight = (leftValue / maxValue) * 100;
    const rightHeight = (rightValue / maxValue) * 100;
    const normHeight = normValue ? (normValue / maxValue) * 100 : 0;

    return (
        <div className="comparison-chart-container" style={{ 
            backgroundColor: 'white', 
            padding: isPrint ? '1rem' : '1.5rem', 
            borderRadius: '1.25rem', 
            border: '1px solid #e2e8f0',
            boxShadow: isPrint ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
            position: 'relative',
            pageBreakInside: 'avoid'
        }}>
            <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--secondary)', textAlign: 'center', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </h5>
            
            <div style={{ position: 'relative', display: 'flex', height: '180px', alignItems: 'flex-end', justifyContent: 'center', gap: '2rem', padding: '1rem 0.5rem', marginTop: '1rem' }}>
                {/* Normative Bar (Far Left) */}
                {normValue && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px', height: '100%', zIndex: 2 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                            <div 
                                style={{ 
                                    height: `${normHeight}%`,
                                    width: '100%', 
                                    backgroundColor: '#94a3b8', 
                                    borderRadius: '8px 8px 0 0',
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}
                            >
                                <span style={{ position: 'absolute', top: '-25px', fontSize: '0.85rem', fontWeight: '900', color: '#64748b' }}>{normValue}</span>
                            </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: '800', color: '#64748b' }}>NORMAL</span>
                    </div>
                )}

                {/* Left Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px', height: '100%', zIndex: 2 }}>
                     <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                        <div 
                            style={{ 
                                height: `${leftHeight}%`,
                                width: '100%', 
                                backgroundColor: 'var(--primary-light)', 
                                borderRadius: '8px 8px 0 0',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(139, 0, 0, 0.1)'
                            }}
                        >
                            <span style={{ position: 'absolute', top: '-25px', fontSize: '0.85rem', fontWeight: '900', color: 'var(--primary)' }}>{leftValue}</span>
                        </div>
                     </div>
                     <span style={{ fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: '800', color: '#64748b' }}>ESQ</span>
                </div>

                {/* Right Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px', height: '100%', zIndex: 2 }}>
                     <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                        <div 
                            style={{ 
                                height: `${rightHeight}%`,
                                width: '100%', 
                                backgroundColor: 'var(--primary)', 
                                borderRadius: '8px 8px 0 0',
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(139, 0, 0, 0.2)'
                            }}
                        >
                            <span style={{ position: 'absolute', top: '-25px', fontSize: '0.85rem', fontWeight: '900', color: 'var(--primary)' }}>{rightValue}</span>
                        </div>
                     </div>
                     <span style={{ fontSize: '0.75rem', marginTop: '0.75rem', fontWeight: '800', color: '#64748b' }}>DIR</span>
                </div>
            </div>

            {/* Historical Legend/Trend if available */}
            {history.length > 1 && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                    * Gráfico comparativo baseado na avaliação atual e metas clínicas.
                </div>
            )}
        </div>
    );
});


const ImageUpload = memo(({ 
    value, 
    isEditing, 
    onChange, 
    onImageClick,
    onAnalyzeImage,
    isTable = false,
    isPrint = false 
}: { 
    value: any, 
    isEditing: boolean, 
    onChange: (val: any) => void,
    onImageClick: (img: string) => void,
    onAnalyzeImage?: (img: string, index: number) => void,
    isTable?: boolean,
    isPrint?: boolean 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageForAnalysis, setSelectedImageForAnalysis] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const images: string[] = Array.isArray(value) ? value : (value ? [value] : []);
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: (isTable || isPrint) ? 'center' : 'flex-start', width: '100%' }}>
            {images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: (isTable || isPrint) ? 'center' : 'flex-start', width: '100%' }}>
                    {images.map((img, idx) => (
                        <div 
                            key={idx}
                            style={{ 
                                position: 'relative', 
                                width: isPrint ? '100%' : (isTable ? '60px' : '360px'), 
                                maxWidth: isPrint ? '700px' : '100%',
                                height: isPrint ? 'auto' : (isTable ? '60px' : '270px'), 
                                minHeight: isPrint ? '500px' : '0',
                                cursor: 'zoom-in',
                                margin: isPrint ? '0 auto 2rem' : '0'
                            }}
                            onClick={() => onImageClick(img)}
                        >
                            <img 
                                src={img} 
                                style={{ width: '100%', height: '100%', objectFit: isPrint ? 'contain' : 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
                                alt="Upload" 
                            />
                            {isEditing && (
                                <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px' }}>
                                    {onAnalyzeImage && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAnalyzeImage(img, idx);
                                            }}
                                            title="Análise Postural"
                                            style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                        >
                                            <Maximize2 size={12} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newImages = [...images];
                                            newImages.splice(idx, 1);
                                            onChange(newImages);
                                        }}
                                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    const compressed = await compressImage(file);
                                    onChange([...images, compressed]);
                                } catch (err) {
                                    console.error("Compression error:", err);
                                    // Fallback to original via reader if compressor fails somehow
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        onChange([...images, reader.result as string]);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        />
                        <button type="button" className="btn-action-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                            <Upload size={14} /> Upload
                        </button>
                    </div>

                    {onAnalyzeImage && (
                        <button 
                            type="button" 
                            className="btn-action" 
                            onClick={() => onAnalyzeImage('', images.length)}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Maximize2 size={14} /> Análise Postural
                        </button>
                    )}
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
    reflexOptions,
    onOpenDynamo,
    onAnalyzeImage,
    rowLabel,
    isCalculated = false
}: { 
    fieldId: string, 
    fieldType: string, 
    fieldOptions: any[],
    value: any, 
    isEditing: boolean, 
    handleInputChange: (id: string, val: any) => void,
    onImageClick: (img: string) => void,
    onAnalyzeImage?: (img: string, fieldId: string, index: number) => void,
    isPrint: boolean,
    reflexOptions: string[],
    onOpenDynamo?: (fieldId: string, label: string) => void,
    rowLabel?: string,
    isCalculated?: boolean
}) => {
    if (isCalculated) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '0.4rem', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '0.4rem',
                border: '1px solid var(--border)',
                fontWeight: '700',
                color: 'var(--primary)',
                fontSize: '0.85rem'
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
                    padding: '0.3rem 0.4rem', 
                    borderRadius: '0.4rem', 
                    border: '1px solid var(--border)',
                    backgroundColor: isEditing ? 'white' : 'transparent',
                    fontSize: '0.82rem',
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
            <div style={{ textAlign: 'center', fontWeight: '800', color: '#64748b', fontSize: '0.82rem' }}>
                {fieldOptions.find((o: any) => o.id === fieldId)?.value || (fieldId.includes('obj') ? fieldId.split('_obj')[0] : value) || '-'} 
                {/* Fallback for static value stored in field definition */}
                {(() => {
                    // Logic to find value from field definition if not in value
                    return ''; 
                })()}
            </div>
        );
    }

    if (fieldId.endsWith('_res') || fieldId.endsWith('_res_esq') || fieldId.endsWith('_res_dir')) {
        const isNormal = value === 'Normal';
        const isAbaixo = value === 'Abaixo';
        
        return (
            <div style={{ textAlign: 'center' }}>
                <span style={{ 
                    color: isNormal ? '#059669' : (isAbaixo ? '#dc2626' : '#94a3b8'), 
                    fontWeight: '800',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    backgroundColor: isNormal ? '#ecfdf5' : (isAbaixo ? '#fef2f2' : '#f8fafc'),
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${isNormal ? '#10b981' : (isAbaixo ? '#f87171' : '#e2e8f0')}`,
                    display: 'inline-block',
                    minWidth: '60px'
                }}>
                    {value || "-"}
                </span>
            </div>
        );
    }

    return isPrint ? (
        <div style={{ textAlign: 'center' }}>
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
                    border: isEditing ? '1px solid var(--border)' : '1px solid transparent',
                    backgroundColor: isEditing ? 'white' : 'transparent',
                    fontSize: '0.82rem',
                    textAlign: 'center'
                }}
            />
            {isEditing && fieldType === 'number' && (fieldId.includes('forca') || fieldId.startsWith('f_') || fieldId.includes('preensao') || fieldId.includes('polpa') || fieldId.includes('lateral') || fieldId.includes('tripode') || fieldId.includes('resist')) && onOpenDynamo && (
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


const DataTable = memo(({ 
    section, 
    answers, 
    isEditing, 
    handleInputChange, 
    onImageClick,
    onOpenDynamo,
    onAnalyzeImage,
    isPrint,
    assessmentDate
}: { 
    section: any, 
    answers: Record<string, any>, 
    isEditing: boolean, 
    handleInputChange: (id: string, val: any) => void,
    onImageClick: (img: string) => void,
    onOpenDynamo?: (fieldId: string, label: string) => void,
    onAnalyzeImage?: (img: string, fieldId: string, index: number) => void,
    isPrint: boolean,
    assessmentDate: string
}) => {
    const reflexOptions = ['Normal', 'Aumentado', 'Diminuído', 'Abolido'];
    
    const isNarrowTable = isPrint && ['movimento', 'irritabilidade', 'teste_fadiga'].some(id => section.id?.includes(id));
    
    return (
        <div className="table-wrapper print-avoid-break" style={{ overflowX: 'auto', marginBottom: '2rem', pageBreakInside: 'avoid', breakInside: 'avoid', maxWidth: isNarrowTable ? '50%' : '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                        {section.columns?.map((col: any, idx: number) => {
                            const label = typeof col === 'string' ? col : col.label;
                            const action = typeof col === 'string' ? null : col.action;
                            
                            if (isPrint && (label === 'Imagem' || label?.includes('Intensidade') || label?.includes('Observações'))) {
                                const hasAnyData = section.rows?.some((r: any) => {
                                    const f = r.fields[idx - 1];
                                    const fid = typeof f === 'string' ? f : f?.id;
                                    const val = answers[fid];
                                    return val !== undefined && val !== '' && val !== null && val !== '0' && val !== 0 && (!Array.isArray(val) || val.length > 0);
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
                    {section.rows?.filter((row: any) => {
                        if (!isPrint) return true;
                        return row.fields.some((f: any) => {
                            const fid = typeof f === 'string' ? f : f.id;
                            const val = answers[fid];
                            return val !== undefined && val !== '' && val !== null && val !== '0' && val !== 0;
                        });
                    }).map((row: any, rIdx: number) => {
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
                                    
                                    // Infer number type for string-based IDs in clinical assessments
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

                                    if (isPrint) {
                                        const col = section.columns![fIdx + 1];
                                        const colLabel = typeof col === 'string' ? col : col.label;
                                        if (colLabel === 'Imagem' || colLabel?.includes('Intensidade') || colLabel?.includes('Observações')) {
                                            const hasAnyData = section.rows?.some((r: any) => {
                                                const f = r.fields[fIdx];
                                                const fid = typeof f === 'string' ? f : f.id;
                                                const val = answers[fid];
                                                return val !== undefined && val !== '' && val !== null && val !== '0' && val !== 0 && (!Array.isArray(val) || val.length > 0);
                                            });
                                            if (!hasAnyData) return null;
                                        }
                                    }

                                    return (
                                        <td key={fIdx} style={{ padding: '0.5rem 0.6rem' }}>
                                            <DataTableCell 
                                                fieldId={fieldId}
                                                fieldType={fieldType}
                                                fieldOptions={fieldOptions}
                                                value={calculatedValue}
                                                isEditing={isEditing}
                                                handleInputChange={handleInputChange}
                                                onImageClick={onImageClick}
                                                isPrint={isPrint}
                                                reflexOptions={reflexOptions}
                                                onOpenDynamo={onOpenDynamo}
                                                onAnalyzeImage={onAnalyzeImage}
                                                rowLabel={row.label}
                                                isCalculated={isDeficitField}
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

const FunctionalQuestionnaireBlock = ({ 
    questType, 
    title, 
    history, 
    answers, 
    isEditing, 
    patientId, 
    type, 
    router,
    assessmentId,
    assessmentDate,
    isPrint
}: { 
    questType: string, 
    title: string, 
    history: any[], 
    answers: any, 
    isEditing: boolean, 
    patientId: string, 
    type: string, 
    router: any,
    assessmentId: string | null,
    assessmentDate: string,
    isPrint: boolean
}) => {
    const scoreKey = `${questType}_score`;
    const currentScoreRaw = answers[scoreKey];
    const currentScore = typeof currentScoreRaw === 'string' 
        ? parseFloat(currentScoreRaw.replace(',', '.').replace('%', '').replace(' pts', '')) 
        : (typeof currentScoreRaw === 'number' ? currentScoreRaw : 0);
    
    // Filter history for THIS specific questionnaire type
    const validHistory = history.filter(h => h.assessment_type === questType).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleNavigate = () => {
        // Explicitly save draft before redirecting to sub-questionnaire
        const draftKey = `assessment_draft_${patientId}_${type}`;
        
        // Smart Storage: Filter out heavy base64 images to avoid QuotaExceededError
        const cleanAnswers: Record<string, any> = {};
        Object.keys(answers).forEach(k => {
            const val = answers[k];
            if (typeof val === 'string' && val.startsWith('data:image')) return;
            if (Array.isArray(val)) {
                cleanAnswers[k] = val.filter(v => typeof v !== 'string' || !v.startsWith('data:image'));
                if (cleanAnswers[k].length === 0) delete cleanAnswers[k];
                return;
            }
            cleanAnswers[k] = val;
        });

        localStorage.setItem(draftKey, JSON.stringify(cleanAnswers));
        router.push(`/dashboard/assessment/${patientId}/${questType}?returnTo=${type}${assessmentId ? `&id=${assessmentId}` : ''}`);
    };

    return (
        <div className="functional-block">
            <div className="functional-block-header">
                <h3 className="functional-block-title">{title}</h3>
            </div>
            
            <div style={{ 
                display: isPrint ? 'grid' : 'block', 
                gridTemplateColumns: isPrint ? '1fr 1fr' : 'none', 
                gap: isPrint ? '2rem' : '0' 
            }}>
                <div className="functional-history-section">
                    <h4 className="section-subtitle">Histórico de Avaliações</h4>
                    {validHistory.length > 0 ? (
                        <div className="history-table-wrapper">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Pontuação</th>
                                        <th>Classificação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {validHistory.map((h, i) => (
                                        <tr key={i}>
                                            <td>{new Date(h.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td>{h.scoreData?.percentage !== undefined ? `${h.scoreData.percentage}%` : `${h.scoreData?.score || 0} pts`}</td>
                                            <td>
                                                <span className="status-badge" style={{ 
                                                    backgroundColor: 'var(--primary-light)', 
                                                    color: 'var(--primary)',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontWeight: '600',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    {h.scoreData?.interpretation || 'Concluído'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-history" style={{ color: '#94a3b8', fontStyle: 'italic', margin: '1rem 0' }}>Sem avaliação prévia</p>
                    )}

                    {!isEditing && (
                        <div className="current-results-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
                            <div className="result-main" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span className="result-label" style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.85rem' }}>RESULTADO ATUAL:</span>
                                    <span className="result-value" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{currentScoreRaw || '0%'}</span>
                                </div>
                                {(() => {
                                    const latest = history.find(h => h.assessment_type === questType);
                                    if (latest?.scoreData?.interpretation) {
                                        return (
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                                                Classificação: <span style={{ color: 'var(--primary)' }}>{latest.scoreData.interpretation}</span>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="history-chart-wrapper-print">
                    {(currentScore > 0 || !isEditing) && (
                        <div style={{ height: '100%' }}>
                            {!isPrint && isEditing && (
                                <div className="current-results-section" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
                                    <div className="result-main" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                        <span className="result-label" style={{ fontWeight: 700, color: 'var(--secondary)' }}>Resultado Atual:</span>
                                        <span className="result-value" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{currentScoreRaw || '0%'}</span>
                                    </div>
                                </div>
                            )}
                            <div className="history-chart-container-wrapper" style={{ marginTop: isPrint ? '1rem' : '0' }}>
                                <FunctionalHistoryChart 
                                    history={history}
                                    currentScore={currentScore}
                                    type={questType}
                                    isEmbedded={true}
                                    assessmentId={assessmentId}
                                    assessmentDate={assessmentDate}
                                    isPrint={!isEditing}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isEditing && (
                <button 
                    type="button"
                    onClick={handleNavigate}
                    className="btn-premium-red"
                    style={{ marginTop: '1.5rem' }}
                >
                    Preencher Novo Questionário
                </button>
            )}

            <style jsx>{`
                .functional-block {
                    background: white;
                    border-radius: 1.25rem;
                    padding: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                    border: 1px solid var(--border);
                    grid-column: 1 / -1;
                }
                .functional-block-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: var(--secondary);
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 2px solid var(--primary-light);
                }
                .section-subtitle {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.75rem;
                }
                .history-table-wrapper {
                    overflow-x: auto;
                    margin-bottom: 1.25rem;
                }
                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.85rem;
                }
                .history-table th {
                    text-align: left;
                    padding: 0.6rem;
                    background: var(--bg-secondary);
                    color: var(--secondary);
                    font-weight: 700;
                }
                .history-table td {
                    padding: 0.6rem;
                    border-bottom: 1px solid var(--border);
                }
                .btn-premium-red {
                    width: 100%;
                    padding: 0.85rem;
                    background-color: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-premium-red:hover {
                    background-color: #720000;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(139,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

const FormField = memo(function FormField({ 
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
    router,
    isPrint,
    answers,
    assessmentDate,
    onAnalyzeImage,
    onOpenYbt
}: { 
    field: SectionField, 
    value: any, 
    isEditing: boolean, 
    handleInputChange: (fieldId: string, value: any) => void,
    onImageClick: (img: string) => void,
    onAnalyzeImage?: (img: string, fieldId: string, index: number) => void,
    patientGender: string,
    patientAge: number,
    patientAssessments: any[],
    patientId: string,
    type: string,
    assessmentId: string | null,
    router: any,
    isPrint: boolean,
    answers: Record<string, any>,
    assessmentDate: string,
    onOpenYbt?: () => void
}) {
    const isQuestButton = field.type === 'button' && field.id.endsWith('_novo');
    if (isPrint && !isQuestButton && (!value || value === '' || value === '0' || value === false || (Array.isArray(value) && value.length === 0))) return null;

    const commonProps = {
        disabled: !isEditing,
        className: `form-input ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        if (field.id === 'slhrt_class' && value) {
            return (
                <div key={field.id} style={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
                    padding: '1.5rem', 
                    borderRadius: '1.25rem', 
                    border: '1px solid #cbd5e1', 
                    borderLeft: '6px solid var(--primary)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    marginBottom: '1.5rem',
                    gridColumn: '1 / -1',
                    marginTop: '0.5rem'
                }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <span style={{ display: 'block', fontWeight: '950', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '1rem' }}>Single Leg Heel Raise Test</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', color: '#334155', lineHeight: '1.8' }}>
                        {String(value || "").split('\n').map((line, idx) => {
                            if (line.includes('ESQUERDO') || line.includes('DIREITO')) {
                                const parts = line.split(': ');
                                const label = parts[0];
                                const status = parts[1] || "";
                                const isAdequate = status.includes('Adequado');
                                return (
                                    <div key={idx} style={{ 
                                        marginBottom: '10px', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        padding: '10px 16px', 
                                        background: 'white', 
                                        borderRadius: '0.75rem', 
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.85rem' }}>{label}</span>
                                        <span style={{ 
                                            padding: '4px 12px', 
                                            borderRadius: '9999px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: '800',
                                            backgroundColor: isAdequate ? '#dcfce7' : '#fee2e2',
                                            color: isAdequate ? '#15803d' : '#991b1b',
                                            border: `1px solid ${isAdequate ? '#bbf7d0' : '#fecaca'}`
                                        }}>{status}</span>
                                    </div>
                                );
                            }
                            if (line.includes('Assimetria')) {
                                const isSim = line.includes('SIM');
                                return (
                                    <div key={idx} style={{ 
                                        marginTop: '1.25rem', 
                                        padding: '12px 16px', 
                                        background: isSim ? '#fff1f2' : '#f0fdf4', 
                                        borderRadius: '0.75rem', 
                                        border: `1px solid ${isSim ? '#fecaca' : '#bbf7d0'}`, 
                                        color: isSim ? '#991b1b' : '#15803d', 
                                        fontWeight: '800', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px',
                                        fontSize: '0.95rem'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>{isSim ? '⚠️' : '✅'}</span>
                                        <span>{line}</span>
                                    </div>
                                );
                            }
                            return <div key={idx} style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '4px' }}>{line}</div>;
                        })}
                    </div>
                </div>
            );
        }
        return (
          <div key={field.id} className="form-group" style={{ gridColumn: (field.id === 'inspecao_text' || field.id === 'obs_perimetria') ? '1 / -1' : 'auto' }}>
            <label className="form-label">{field.label}</label>
            {!isEditing ? (
                <div style={{ 
                    width: '100%', 
                    padding: '1.25rem', 
                    borderRadius: '0.75rem', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#1e293b',
                    whiteSpace: 'pre-wrap',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                }}>
                    {value || "Nenhuma informação registrada."}
                </div>
            ) : (
                <textarea 
                    {...commonProps}
                    rows={field.rows || 3} 
                    value={value || ""} 
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    placeholder="Descreva aqui..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                />
            )}
          </div>
        );
      case 'range': {
        const isEVA = field.id === 'intensidade_dor';
        
        const isAreaDor = field.id === 'area_dor';
        
        // MODO FORMULÁRIO (EDIÇÃO)
        if (isEditing && !isPrint) {
            return (
                <div key={field.id} className="form-group">
                    <label className="form-label">{field.label}</label>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '1rem' }}>
                        <input 
                            type="range" 
                            min={field.min} 
                            max={field.max} 
                            step={field.step} 
                            value={value || 0} 
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="custom-range"
                            style={{ 
                                width: '100%', 
                                cursor: 'pointer', 
                                accentColor: '#8B0000'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            <span>0 — {isEVA ? 'SEM DOR' : 'MÍNIMO'}</span>
                            <span style={{ 
                                backgroundColor: '#8B0000', 
                                color: 'white', 
                                width: '24px', 
                                height: '24px', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                position: 'absolute',
                                left: `${(Number(value) || 0) * 10}%`,
                                transform: 'translateX(-50%)',
                                top: '-4px',
                                pointerEvents: 'none',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                {value || 0}
                            </span>
                            <span>10 — {isEVA ? 'DOR INSURPORTÁVEL' : 'MÁXIMO'}</span>
                        </div>
                    </div>
                </div>
            );
        }

        // MODO RESUMO / IMPRESSÃO (NUMERO APENAS NO MARKER)
        return (
            <div key={field.id} className="form-group" style={{ 
                maxWidth: '100%',
                alignSelf: 'center'
            }}>
                <label className="form-label" style={{ fontWeight: '800', marginBottom: '2.5rem', display: 'block' }}>
                    {isEVA ? 'Intensidade de Dor (EVA)' : field.label}
                </label>
                
                <div style={{ position: 'relative', width: '100%', paddingTop: '0.5rem' }}>
                    <div style={{ 
                        height: '6px', 
                        width: '100%', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '3px',
                        position: 'relative'
                    }}>
                        <div style={{ 
                            height: '100%', 
                            width: `${(Number(value) || 0) * 10}%`, 
                            backgroundColor: '#8B0000', 
                            borderRadius: '3px'
                        }} />
                        
                        {/* Marcador com o valor embutido (Sem numero acima) */}
                        <div style={{ 
                            position: 'absolute', 
                            left: `${(Number(value) || 0) * 10}%`, 
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '28px', 
                            height: '28px', 
                            borderRadius: '50%', 
                            backgroundColor: '#8B0000',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            border: '3px solid white',
                            zIndex: 2
                        }}>
                            {value || 0}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#666', marginTop: '0.8rem', fontWeight: '600' }}>
                        <span>0 — {isEVA ? 'SEM DOR' : 'MÍNIMO'}</span>
                        <span>10 — {isEVA ? 'DOR INSUPORTÁVEL' : 'MÁXIMO'}</span>
                    </div>
                </div>
            </div>
        );
      }
      case 'text':
        if (field.id.endsWith('_score') && value && field.id !== 'sorensen') {
            return null; 
        }
        if (field.id.endsWith('_data_previo')) return null;
        if (field.id.endsWith('_score_previo')) return null;
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
      case 'number': {
        const isForce = field.id.includes('forca_') || field.id.includes('resist_');
        const isPerimetry = field.id.includes('perimetria_');
        const isEndurance = ['flexao_60', 'sorensen'].includes(field.id);
        const isGeriatriaTest = ['pes_juntos', 'semi_tandem', 'tandem', 'toques_tempo', 'tug', 'vel_marcha', 'sentar_levantar', 'preensao'].includes(field.id) || 
                               field.id.startsWith('unipodal_');
        
        let referenceValue: number | undefined;
        let referenceLabel = 'Referência';
        let unit = isForce ? 'kgF' : isPerimetry ? 'cm' : 'seg';
        if (field.id === 'vel_marcha') unit = 'm/s';
        if (field.id === 'preensao') unit = 'kg';

        if (isForce || isPerimetry || isEndurance || isGeriatriaTest) {
            if (field.id === 'pes_juntos') referenceValue = 30;
            if (field.id === 'semi_tandem') referenceValue = 30;
            if (field.id === 'tandem') referenceValue = 17.56;
            if (field.id.startsWith('unipodal_')) referenceValue = 10.43;
            if (field.id === 'toques_tempo') referenceValue = 10;
            if (field.id === 'tug') referenceValue = 12.47;
            if (field.id === 'vel_marcha') referenceValue = 0.8;
            if (field.id === 'preensao') {
                referenceValue = (patientGender || "").toLowerCase() === 'masculino' ? 27 : 16;
                referenceLabel = `Ref (${(patientGender || "").toLowerCase() === 'masculino' ? 'Masc' : 'Fem'})`;
            }
            if (field.id === 'resist_flexora') {
                referenceValue = (patientGender || "").toLowerCase() === 'masculino' ? 38 : 29;
                referenceLabel = `Ref (${(patientGender || "").toLowerCase() === 'masculino' ? 'Masc' : 'Fem'})`;
            }
            if (field.id === 'resist_extensora' || field.id === 'sorensen') {
                referenceValue = (patientGender || "").toLowerCase() === 'masculino' ? 120 : 120;
                referenceLabel = 'Ref';
            }
            if (field.id === 'flexao_60') referenceValue = 60;
        }

        return (
          <div key={field.id} className="form-group" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <label className="form-label">
                {field.label}
                {referenceValue !== undefined && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: isPrint ? '#666' : 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({referenceLabel}: {referenceValue}{unit})
                    </span>
                )}
            </label>
            <input 
              type="number" 
              {...commonProps}
              value={value || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
            {(() => {
                if (isForce || isPerimetry || isEndurance || isGeriatriaTest) {
                    let title = field.label.split('(')[0].trim();
                    const isResistencia = ['flexao_60', 'sorensen', 'resist_flexora', 'resist_extensora'].includes(field.id);
                    
                    return (
                        <div key={`chart-${field.id}`} style={{ marginTop: 'auto', width: isPrint ? (isResistencia ? '100%' : '50%') : '100%', margin: isPrint ? '0 auto' : '0' }}>
                            <AssessmentHistoryChart 
                                fieldId={field.id}
                                currentValue={Number(value) || 0}
                                chartTitle={`Evolução: ${title}`}
                                unit={unit}
                                history={patientAssessments}
                                isPrint={isPrint}
                                referenceValue={referenceValue}
                                referenceLabel={referenceLabel}
                                assessmentId={assessmentId}
                                isEndurance={isResistencia}
                            />
                        </div>
                    );
                }
                return null;
            })()}
          </div>
        );
      }
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
      case 'bodyschema': {
        const isAreaDor = field.id === 'area_dor';

        const isImageUrl = value && (typeof value === 'string') && (value.startsWith('data:image') || value.startsWith('http'));

        // MODO FORMULÁRIO (ADIÇÃO/EDIÇÃO)
        if (isEditing && !isPrint) {
            return (
                <div key={field.id} className="form-group">
                    <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block' }}>{field.label}</label>
                    <BodySchema 
                        image={field.image || "/img/esquema_corpo_inteiro.png"}
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                        readOnly={false}
                    />
                </div>
            );
        }

        // MODO RESUMO / IMPRESSÃO
        return (
            <div key={field.id} className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '1rem', display: 'block', fontWeight: '800', color: isPrint ? '#8b0000' : 'var(--secondary)' }}>
                    {(isPrint || !isEditing) ? field.label.split('(')[0].trim() : field.label}
                </label>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: isPrint ? 'transparent' : 'white', borderRadius: '1rem', padding: isPrint ? '0' : '1rem', border: isPrint ? 'none' : '1px solid var(--border)' }}>
                    {isImageUrl ? (
                        <img 
                            src={value} 
                            alt="Esquema Corporal" 
                            style={{ 
                                width: 'auto', 
                                height: 'auto', 
                                maxWidth: '100%', 
                                maxHeight: isPrint ? '450px' : '550px', 
                                objectFit: 'contain',
                                display: 'block',
                                borderRadius: '0.5rem'
                            }} 
                        />
                    ) : (value ? (
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', transform: isPrint ? 'scale(0.9)' : 'none', transformOrigin: 'center top' }}>
                            <BodySchema 
                                image={field.image || "/img/esquema_corpo_inteiro.png"}
                                value={value} 
                                onChange={() => {}}
                                readOnly={true}
                            />
                        </div>
                    ) : (
                        <div style={{ color: '#ccc', fontSize: '0.9rem', padding: '2rem', fontStyle: 'italic' }}>Nenhuma marcação realizada</div>
                    ))}
                </div>
            </div>
        );
      }
      case 'image-upload':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <ImageUpload 
                value={value}
                isEditing={isEditing}
                onChange={(val) => handleInputChange(field.id, val)}
                onImageClick={onImageClick}
                onAnalyzeImage={onAnalyzeImage ? (img, idx) => onAnalyzeImage(img, field.id, idx) : undefined}
                isPrint={isPrint}
            />
          </div>
        );
      case 'paintmap':
        const isDataUrl = typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'));
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block', fontWeight: (isPrint || !isEditing) ? '800' : 'inherit' }}>{field.label}</label>
                <div style={{ pointerEvents: isEditing ? 'auto' : 'none', opacity: 1 }}>
                    {(isPrint || !isEditing) && isDataUrl ? (
                        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <img 
                                src={value} 
                                style={{ 
                                    width: '100%', 
                                    maxWidth: '600px', 
                                    borderRadius: '1rem', 
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-md)',
                                    display: 'block'
                                }} 
                                alt="Esquema Corporal" 
                            />
                        </div>
                    ) : (
                        <BodySchema 
                            key={field.id}
                            image={field.image || ""} 
                            value={value} 
                            onChange={(val) => handleInputChange(field.id, val)} 
                            colors={field.colors}
                            mode="stamp"
                            readOnly={!isEditing}
                        />
                    )}
                </div>
            </div>
        );
      case 'angle_measurement':
        const isAngleDataUrl = typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'));
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block', fontWeight: (isPrint || !isEditing) ? '800' : 'inherit' }}>{field.label}</label>
                {(isPrint || !isEditing) && isAngleDataUrl ? (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                         <img 
                            src={value} 
                            style={{ 
                                width: 'auto', 
                                height: 'auto', 
                                maxWidth: '100%', 
                                maxHeight: '650px',
                                borderRadius: '1.5rem', 
                                border: '2px solid #eee',
                                boxShadow: 'var(--shadow-lg)',
                                objectFit: 'contain'
                            }} 
                            alt="Análise Angular" 
                        />
                    </div>
                ) : (
                    <AngleMeasurement 
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)}
                        isEditing={isEditing}
                    />
                )}
            </div>
        );
      case 'freecanvas':
        return (
            <div key={field.id} className="form-group">
                <label className="form-label" style={{ marginBottom: '1.5rem', display: 'block', fontWeight: (isPrint || !isEditing) ? '800' : 'inherit' }}>{field.label}</label>
                {(isPrint || !isEditing) && value && (value.startsWith('data:image') || value.startsWith('http')) ? (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                         <img 
                            src={value} 
                            style={{ 
                                width: 'auto', 
                                height: 'auto', 
                                maxWidth: '100%', 
                                maxHeight: '500px',
                                borderRadius: '1rem', 
                                border: '1px solid var(--border)',
                                objectFit: 'contain'
                            }} 
                            alt="Canvas Desenho" 
                        />
                    </div>
                ) : (
                    <FreeCanvas 
                        value={value} 
                        onChange={(val) => handleInputChange(field.id, val)}
                        isEditing={isEditing}
                    />
                )}
            </div>
        );
      case 'button': {
        const isQuestButton = field.id.endsWith('_novo');
        if (isQuestButton) {
            const questPrefix = field.id.split('_')[0];
            return (
                <FunctionalQuestionnaireBlock 
                    questType={questPrefix}
                    title={field.label.replace('Preencher ', '').replace('novo ', '').replace('Novo ', '')}
                    history={patientAssessments}
                    answers={answers}
                    isEditing={isEditing}
                    patientId={patientId}
                    type={type}
                    router={router}
                    assessmentId={assessmentId}
                    assessmentDate={assessmentDate}
                    isPrint={isPrint}
                />
            );
        }
        
        return (
            <div key={field.id} className="form-group">
                <button 
                    type="button"
                    onClick={() => {
                        if (field.id === 'ybt_calc' && onOpenYbt) {
                            onOpenYbt();
                        }
                    }}
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                >
                    {field.label}
                </button>
            </div>
        );
      }
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
    isPrint,
    assessmentDate,
    onOpenDynamo,
    onOpenYbt,
    onAnalyzeImage
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
    isPrint: boolean,
    assessmentDate: string,
    onOpenDynamo?: (fieldId: string, label: string) => void,
    onOpenYbt?: () => void,
    onAnalyzeImage?: (img: string, fieldId: string, index: number) => void
}) => {
    // Helpers for visibility
    const hasVal = (val: any) => val !== undefined && val !== null && val !== '' && val !== 'null' && (Array.isArray(val) ? val.length > 0 : true);
    
    // Check if section as a whole has any data
    const sectionHasData = () => {
        if (isEditing) return true;
        if (['anamnese', 'diagnostico_conclusoes'].includes(section.id)) return true;
        
        const checkFields = (fs?: any[]) => fs?.some(f => hasVal(answers[typeof f === 'string' ? f : f.id]));
        const checkRows = (rs?: any[]) => rs?.some(r => r.fields.some((f: any) => hasVal(answers[typeof f === 'string' ? f : f.id])));
        
        if (section.type === 'table') return checkRows(section.rows);
        if (section.type === 'multi-table') return section.subsections?.some(sub => 
            checkFields(sub.fields) || (sub.type === 'table' && checkRows(sub.rows))
        );
        return checkFields(section.fields);
    };

    if (!sectionHasData()) return null;

    return (
        <motion.div
            initial={isPrint ? {} : { opacity: 0, x: 20 }}
            animate={isPrint ? {} : { opacity: 1, x: 0 }}
            className="section-container"
            style={{ marginBottom: '2.5rem', pageBreakInside: 'avoid' }}
        >
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {section.title}
            </h3>

            {section.id === 'ybt' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ 
                            padding: '1.5rem', 
                            borderRadius: '1.25rem', 
                            backgroundColor: 'white', 
                            border: '1px solid var(--border)', 
                            boxShadow: 'var(--shadow-sm)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Membro Esquerdo</span>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>
                                {answers.ybt_esq ? `${answers.ybt_esq}%` : '---'}
                            </div>
                        </div>

                        <div style={{ 
                            padding: '1.5rem', 
                            borderRadius: '1.25rem', 
                            backgroundColor: 'white', 
                            border: '1px solid var(--border)', 
                            boxShadow: 'var(--shadow-sm)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Membro Direito</span>
                            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>
                                {answers.ybt_dir ? `${answers.ybt_dir}%` : '---'}
                            </div>
                        </div>

                        <div style={{ 
                            padding: '1.5rem', 
                            borderRadius: '1.25rem', 
                            backgroundColor: 'var(--bg-secondary)', 
                            border: '2px dashed var(--border)', 
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase' }}>Assimetria</span>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: (parseFloat(answers.ybt_diff) > 4) ? 'var(--danger)' : 'var(--success)' }}>
                                {answers.ybt_diff || '0.0%'}
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <button 
                            onClick={onOpenYbt}
                            className="btn-primary"
                            style={{ 
                                padding: '1rem', 
                                borderRadius: '1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '0.75rem',
                                fontWeight: '800',
                                boxShadow: 'var(--shadow-md)'
                            }}
                        >
                            <Calculator size={20} />
                            Abrir Calculadora YBT
                        </button>
                    )}

                    {/* STEP-DOWN TEST SECTION */}
                    <div style={{ 
                        marginTop: '2.5rem', 
                        paddingTop: '2rem', 
                        borderTop: '2px dashed var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '4px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '2px' }} />
                            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Step-Down Test</h4>
                        </div>

                        {/* Angle Measurement Buttons (Side by Side) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>Estúdio Esquerdo</label>
                                <AngleMeasurement 
                                    value={answers.sd_estudio_esq} 
                                    onChange={(val) => handleInputChange('sd_estudio_esq', val)}
                                    isEditing={isEditing}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)' }}>Estúdio Direito</label>
                                <AngleMeasurement 
                                    value={answers.sd_estudio_dir} 
                                    onChange={(val) => handleInputChange('sd_estudio_dir', val)}
                                    isEditing={isEditing}
                                />
                            </div>
                        </div>

                        {/* Result Table (Similar to WBL but for Step-Down) */}
                        <div className="table-responsive" style={{ marginTop: '1rem', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            <table className="w-full border-collapse" style={{ backgroundColor: 'white' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Parâmetro</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Esq (°)</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Resultado</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Dir (°)</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>Resultado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', borderBottom: '1px solid #f1f5f9' }}>Valgo dinâmico do joelho (8°±5)</td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={answers.sd_valgo_esq || ''} 
                                                onChange={(e) => handleInputChange('sd_valgo_esq', e.target.value)}
                                                disabled={!isEditing}
                                                className="form-control"
                                                style={{ width: '70px', margin: '0 auto', textAlign: 'center', fontWeight: '700' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                            {answers.sd_valgo_res_esq ? (
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: '800', 
                                                    color: answers.sd_valgo_res_esq === 'Déficit' ? '#991b1b' : '#166534',
                                                    backgroundColor: answers.sd_valgo_res_esq === 'Déficit' ? '#fee2e2' : '#f0fdf4',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${answers.sd_valgo_res_esq === 'Déficit' ? '#fecaca' : '#bbf7d0'}`
                                                }}>
                                                    {answers.sd_valgo_res_esq}
                                                </span>
                                            ) : <span style={{ color: '#cbd5e1' }}>---</span>}
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={answers.sd_valgo_dir || ''} 
                                                onChange={(e) => handleInputChange('sd_valgo_dir', e.target.value)}
                                                disabled={!isEditing}
                                                className="form-control"
                                                style={{ width: '70px', margin: '0 auto', textAlign: 'center', fontWeight: '700' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                            {answers.sd_valgo_res_dir ? (
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: '800', 
                                                    color: answers.sd_valgo_res_dir === 'Déficit' ? '#991b1b' : '#166534',
                                                    backgroundColor: answers.sd_valgo_res_dir === 'Déficit' ? '#fee2e2' : '#f0fdf4',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${answers.sd_valgo_res_dir === 'Déficit' ? '#fecaca' : '#bbf7d0'}`
                                                }}>
                                                    {answers.sd_valgo_res_dir}
                                                </span>
                                            ) : <span style={{ color: '#cbd5e1' }}>---</span>}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)' }}>Queda pélvica (10°±5)</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={answers.sd_queda_esq || ''} 
                                                onChange={(e) => handleInputChange('sd_queda_esq', e.target.value)}
                                                disabled={!isEditing}
                                                className="form-control"
                                                style={{ width: '70px', margin: '0 auto', textAlign: 'center', fontWeight: '700' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {answers.sd_queda_res_esq ? (
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: '800', 
                                                    color: answers.sd_queda_res_esq === 'Déficit' ? '#991b1b' : '#166534',
                                                    backgroundColor: answers.sd_queda_res_esq === 'Déficit' ? '#fee2e2' : '#f0fdf4',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${answers.sd_queda_res_esq === 'Déficit' ? '#fecaca' : '#bbf7d0'}`
                                                }}>
                                                    {answers.sd_queda_res_esq}
                                                </span>
                                            ) : <span style={{ color: '#cbd5e1' }}>---</span>}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <input 
                                                type="number" 
                                                value={answers.sd_queda_dir || ''} 
                                                onChange={(e) => handleInputChange('sd_queda_dir', e.target.value)}
                                                disabled={!isEditing}
                                                className="form-control"
                                                style={{ width: '70px', margin: '0 auto', textAlign: 'center', fontWeight: '700' }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {answers.sd_queda_res_dir ? (
                                                <span style={{ 
                                                    fontSize: '0.7rem', 
                                                    fontWeight: '800', 
                                                    color: answers.sd_queda_res_dir === 'Déficit' ? '#991b1b' : '#166534',
                                                    backgroundColor: answers.sd_queda_res_dir === 'Déficit' ? '#fee2e2' : '#f0fdf4',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${answers.sd_queda_res_dir === 'Déficit' ? '#fecaca' : '#bbf7d0'}`
                                                }}>
                                                    {answers.sd_queda_res_dir}
                                                </span>
                                            ) : <span style={{ color: '#cbd5e1' }}>---</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Observations field */}
                    <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label className="form-label" style={{ fontWeight: '700' }}>OBSERVAÇÕES</label>
                        <textarea 
                            value={answers.ybt_obs || ''}
                            onChange={(e) => handleInputChange('ybt_obs', e.target.value)}
                            disabled={!isEditing}
                            rows={3}
                            placeholder="Notas clínicas sobre a execução do teste..."
                            className="form-control"
                            style={{ 
                                width: '100%', 
                                padding: '1rem', 
                                borderRadius: '0.75rem', 
                                border: '1px solid var(--border)', 
                                resize: 'vertical' 
                            }}
                        />
                    </div>
                </div>
            ) : section.type === 'table' ? (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <DataTable 
                            section={section} 
                            answers={answers} 
                            isEditing={isEditing} 
                            handleInputChange={handleInputChange} 
                            onImageClick={onImageClick}
                            onOpenDynamo={onOpenDynamo}
                            onAnalyzeImage={onAnalyzeImage}
                            isPrint={isPrint}
                            assessmentDate={assessmentDate}
                        />
                        {['perimetria', 'forca', 'dinamometria', 'ndi_integracao', 'oswestry_integracao', 'quickdash_integracao', 'testes_especiais_resistidos'].includes(section.id) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
                                {section.rows?.map((row: any) => row.fields.map((f: any, fidx: number) => {
                                    const fid = typeof f === 'string' ? f : f.id;
                                    const col = section.columns?.[fidx + 1];
                                    const colLabel = typeof col === 'string' ? col : (col?.label || "");
                                    if (colLabel.includes('Esquerdo') || colLabel.includes('Direito') || fid.endsWith('_score')) {
                                        return (
                                            <AssessmentHistoryChart 
                                                key={`hist-${fid}`}
                                                fieldId={fid}
                                                currentValue={Number(String(answers[fid] || '0').replace('%', '').replace(',', '.')) || 0}
                                                chartTitle={`Evolução: ${row.label} (${colLabel})`}
                                                unit={fid.endsWith('_score') ? '%' : (section.id.includes('forca') ? 'kgF' : 'cm')}
                                                history={patientAssessments}
                                                isPrint={isPrint}
                                                assessmentId={assessmentId}
                                            />
                                        );
                                    }
                                    return null;
                                }))}
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: section.fields?.some((f:any)=> f.type === 'textarea') ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
                            {section.fields?.filter(f => {
                                if (isEditing) return true;
                                if (f.type === 'button') return false;
                                return hasVal(answers[f.id]);
                            }).map((field: any) => (
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
                                    isPrint={isPrint}
                                    answers={answers}
                                    assessmentDate={assessmentDate}
                                    onAnalyzeImage={onAnalyzeImage}
                                    onOpenYbt={onOpenYbt}
                                />
                            ))}
                        </div>
                        {section.chart === 'normative_strength' && (
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', width: '100%', pageBreakInside: 'avoid' }}>
                                <AssessmentComparisonChart 
                                    label={section.title}
                                    leftValue={Number(answers['preensao_esq']) || 0}
                                    rightValue={Number(answers['preensao_dir']) || 0}
                                    unit="kg"
                                    normValue={patientGender === 'Feminino' ? 16 : 27}
                                    isPrint={isPrint}
                                    history={patientAssessments}
                                />
                            </div>
                        )}
                    </div>
                </>
            ) : section.type === 'multi-table' ? (
                <div style={{ 
                    display: (isPrint || !isEditing) && ['exame_neurologico', 'avaliacao_do_movimento', 'miofascial_neural', 'irritabilidade'].some(id => section.id.includes(id)) ? 'grid' : 'flex', 
                    gridTemplateColumns: (isPrint || !isEditing) && ['exame_neurologico', 'avaliacao_do_movimento', 'miofascial_neural', 'irritabilidade'].some(id => section.id.includes(id)) ? '1fr 1fr' : 'none',
                    flexDirection: 'column', 
                    gap: isPrint ? '0.75rem' : '1.5rem' 
                }}>
                    {section.subsections?.filter(sub => {
                        if (isEditing) return true;
                        const checkFields = (fs?: any[]) => fs?.some(f => hasVal(answers[typeof f === 'string' ? f : f.id]));
                        const checkRows = (rs?: any[]) => rs?.some(r => r.fields.some((f: any) => hasVal(answers[typeof f === 'string' ? f : f.id])));
                        return checkFields(sub.fields) || (sub.type === 'table' && checkRows(sub.rows));
                    }).map((sub: any, sidx: number) => (
                        <div key={sidx} style={{ 
                            padding: isPrint ? '0.75rem' : '1.5rem', 
                            backgroundColor: 'white', 
                            borderRadius: '0.75rem', 
                            border: '1px solid var(--border)',
                            pageBreakInside: 'avoid',
                            boxShadow: isPrint ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--secondary)' }}>{sub.title}</h4>
                             {sub.type === 'table' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <DataTable 
                                        section={sub} 
                                        answers={answers} 
                                        isEditing={isEditing} 
                                        handleInputChange={handleInputChange} 
                                        onImageClick={onImageClick}
                                        onOpenDynamo={onOpenDynamo}
                                        onAnalyzeImage={onAnalyzeImage}
                                        isPrint={isPrint}
                                        assessmentDate={assessmentDate}
                                    />
                                    {sub.fields && sub.fields.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: (sub.type === 'table' && sub.fields.some((f:any) => f.type === 'textarea')) ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                            {sub.fields.filter((f: any) => isEditing || hasVal(answers[f.id])).map((field: any) => (
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
                                                    isPrint={isPrint}
                                                    answers={answers}
                                                    assessmentDate={assessmentDate}
                                                    onAnalyzeImage={onAnalyzeImage}
                                                    onOpenYbt={onOpenYbt}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: sub.fields?.some((f: any) => f.type === 'image-upload') ? '1fr 1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
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
                                            isPrint={isPrint}
                                            answers={answers}
                                            assessmentDate={assessmentDate}
                                            onAnalyzeImage={onAnalyzeImage}
                                            onOpenYbt={onOpenYbt}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Subsection Comparison Charts */}
                            {['forca', 'dinamometria'].includes(sub.id) && sub.type === 'table' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                                    {sub.rows?.map((row: any) => {
                                        const esq = row.fields.find((f: any) => (typeof f === 'string' ? f : f.id).toLowerCase().includes('esq'));
                                        const dir = row.fields.find((f: any) => (typeof f === 'string' ? f : f.id).toLowerCase().includes('dir'));
                                        if (esq && dir) {
                                            const vE = Number(String(answers[typeof esq === 'string' ? esq : esq.id] || '0').replace(',', '.')) || 0;
                                            const vD = Number(String(answers[typeof dir === 'string' ? dir : dir.id] || '0').replace(',', '.')) || 0;
                                            if (vE > 0 || vD > 0) return (
                                                <AssessmentComparisonChart 
                                                    key={`comp-sub-${row.id}`}
                                                    label={`Comparativo: ${row.label}`}
                                                    leftValue={vE}
                                                    rightValue={vD}
                                                    unit="kgF"
                                                    isPrint={isPrint}
                                                />
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                        {section.fields?.filter(f => {
                            if (isEditing) return true;
                            if (f.type === 'button') return false;
                            return hasVal(answers[f.id]);
                        }).map((field: any) => (
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
                                isPrint={isPrint}
                                answers={answers}
                                assessmentDate={assessmentDate}
                                onAnalyzeImage={onAnalyzeImage}
                                onOpenYbt={onOpenYbt}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: (isPrint || !isEditing) 
                        ? ((section.id === 'anamnese' || section.id === 'testes_resistencia') ? '1fr 1fr' : (section.fields?.some((f: any) => f.type === 'image-upload') ? '1fr 1fr' : 'repeat(auto-fit, minmax(300px, 1fr))')) 
                        : '1fr', 
                    gap: '1.5rem' 
                }}>
                    {section.fields?.filter(f => {
                        if (isEditing) return true;
                        if (f.type === 'button') return false;
                        return hasVal(answers[f.id]);
                    }).map((field: any) => (
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
                            isPrint={isPrint}
                            answers={answers}
                            assessmentDate={assessmentDate}
                            onAnalyzeImage={onAnalyzeImage}
                            onOpenYbt={onOpenYbt}
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
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<Record<string, any> | null>(null);
  const [dynamoModal, setDynamoModal] = useState<{ fieldId: string, label: string } | null>(null);
  const [dynamoValues, setDynamoValues] = useState<[string, string, string]>(['', '', '']);
  const [ybtModal, setYbtModal] = useState<boolean>(false);
  const [ybtValues, setYbtValues] = useState<{ anterior: string, postMedial: string, postLateral: string, limbLength: string, side: 'esq' | 'dir' }>({ anterior: '', postMedial: '', postLateral: '', limbLength: '', side: 'esq' });
  const [posturalModal, setPosturalModal] = useState<{ isOpen: boolean, image: string, fieldId: string, index: number }>({ isOpen: false, image: '', fieldId: '', index: 0 });

  const handleRecoverDraft = () => {
    if (pendingDraft) {
      setAnswers(pendingDraft);
      toast.success("Rascunho recuperado!");
    }
    setShowDraftModal(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    const draftKey = `assessment_draft_${patientId}_${type}`;
    const checkpointKey = `checkpoint_${patientId}_${type}`;
    localStorage.removeItem(draftKey);
    localStorage.removeItem(checkpointKey);
    setShowDraftModal(false);
    setPendingDraft(null);
    toast.info("Rascunho descartado.");
  };

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
                    const parsedDraft = JSON.parse(draft);
                    const draftKeys = Object.keys(parsedDraft);
                    const currentKeys = Object.keys(answers);
                    
                    // Only offer draft recovery if the current session hasn't already collected significant data
                    // and we're not already in the middle of a question (currentIdx > 0)
                    const hasActiveSessionData = currentKeys.some(k => !k.endsWith('_score_previo') && !k.endsWith('_data_previo')) || currentIdx > 0;

                    if (draftKeys.length > 0 && !hasActiveSessionData) {
                        // Check both searchParams hook and window.location as fallback for reliability
                        const isReturning = searchParams.get('returnTo') || 
                                           (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('returnTo') : null);
                        
                        if (isReturning) {
                            currentAnswers = parsedDraft;
                            setOriginalAnswers(parsedDraft);
                            toast.success("Dados restaurados automaticamente.");
                        } else {
                            // Offer recovery regardless of time limit as per requirement
                            setPendingDraft(parsedDraft);
                            setShowDraftModal(true);
                        }
                    }
                } catch (e) {
                    console.error("Erro ao carregar rascunho:", e);
                }
            }

            // If no draft and no pending draft, but we have a latest quest, populate previous fields
            if (Object.keys(currentAnswers).length === 0 && !pendingDraft && latestQuest) {
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
  }, [assessmentId, patientId, type, searchParams]);

  // Save draft to localStorage (Smart Storage: filter out heavy base64 images to avoid QuotaExceededError)
  useEffect(() => {
    if (!assessmentId && Object.keys(answers).length > 0) {
        // Only save if answers contains more than just historical reference fields
        const keys = Object.keys(answers);
        const hasRealData = keys.some(k => !k.endsWith('_score_previo') && !k.endsWith('_data_previo'));
        
        if (hasRealData) {
            const draftKey = `assessment_draft_${patientId}_${type}`;
            
            // Filter answers to remove base64 strings (starting with data:image)
            const cleanAnswers: Record<string, any> = {};
            Object.keys(answers).forEach(k => {
                const val = answers[k];
                if (typeof val === 'string' && val.startsWith('data:image')) {
                    // Do not save the image data to localStorage to save quota
                    return;
                }
                if (Array.isArray(val)) {
                    // Filter arrays of images too
                    cleanAnswers[k] = val.filter(v => typeof v !== 'string' || !v.startsWith('data:image'));
                    if (cleanAnswers[k].length === 0) delete cleanAnswers[k];
                    return;
                }
                cleanAnswers[k] = val;
            });

            try {
                localStorage.setItem(draftKey, JSON.stringify(cleanAnswers));
            } catch (e) {
                console.warn("Could not save full draft to localStorage (quota exceeded), clearing and trying again.");
                localStorage.removeItem(draftKey);
            }
        }
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
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }
  };

  const handleAnalyzeImage = useCallback((img: string, fieldId: string, index: number) => {
    setPosturalModal({ isOpen: true, image: img, fieldId, index });
  }, []);

  const handleSavePosturalAnalysis = useCallback(async (processedImage: string) => {
    const compressed = await compressImage(processedImage);
    const { fieldId, index } = posturalModal;
    setAnswers(prev => {
        const currentVal = prev[fieldId];
        let newVal;
        if (Array.isArray(currentVal)) {
            newVal = [...currentVal];
            newVal[index] = compressed;
        } else {
            newVal = compressed;
        }
        return { ...prev, [fieldId]: newVal, _lastModified: Date.now() };
    });
    toast.success("Análise postural salva e inserida no formulário!");
  }, [posturalModal]);

  const handleInputChange = useCallback((fieldId: string, value: any) => {
    if (!isEditing) return;
    setAnswers(prev => {
        const newAnswers = { ...prev, [fieldId]: value, _lastModified: Date.now() };
        
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

        // New Table-based calculations for afMao
        if (type === 'afMao') {
            const groups = [
                ['peri_ant_sup', 'peri_ant_inf', 'peri_punho'],
                ['flexao_pun_at', 'extensao_pun_at', 'desv_radial_at', 'desv_ulnar_at'],
                ['flexao_pun_ps', 'extensao_pun_ps', 'desv_radial_ps', 'desv_ulnar_ps'],
                ['flex_mcf_at', 'ext_mcf_at', 'flex_ifp_at', 'flex_ifd_at', 'oposicao_polegar_at'],
                ['flex_mcf_ps', 'ext_mcf_ps', 'flex_ifp_ps', 'flex_ifd_ps', 'oposicao_polegar_ps'],
                ['preensao', 'polpa', 'lateral', 'tripode']
            ];
            groups.flat().forEach(mId => {
                const esqId = `${mId}_esq`;
                const dirId = `${mId}_dir`;
                if (fieldId === esqId || fieldId === dirId) {
                    const esq = parseFloat(String(newAnswers[esqId] || '0').replace(',', '.'));
                    const dir = parseFloat(String(newAnswers[dirId] || '0').replace(',', '.'));
                    if (esq > 0 || dir > 0) {
                        const max = Math.max(esq, dir);
                        const min = Math.min(esq, dir);
                        const deficit = Math.round(((max - min) / max) * 100);
                        newAnswers[`${mId}_def`] = `${deficit}%`;
                    } else {
                        newAnswers[`${mId}_def`] = '';
                    }
                }
            });
        }

        if (type === 'afGeriatria') {
            const val = parseFloat(String(value).replace(',', '.'));
            const resMap: Record<string, string> = {
                'pes_juntos': 'pes_juntos_res',
                'semi_tandem': 'semi_tandem_res',
                'tandem': 'tandem_res',
                'tug': 'tug_res',
                'vel_marcha': 'vel_marcha_res',
                'preensao': 'preensao_res',
                'unipodal_dir': 'unipodal_dir_res',
                'unipodal_esq': 'unipodal_esq_res',
                'toques_valor': 'toques_res',
                'sentar_levantar': 'sentar_levantar_res',
                'preensao_esq': 'preensao_res_esq',
                'preensao_dir': 'preensao_res_dir'
            };

            if (!isNaN(val)) {
                if (fieldId === 'pes_juntos') newAnswers['pes_juntos_res'] = val >= 30 ? 'Normal' : 'Abaixo';
                if (fieldId === 'semi_tandem') newAnswers['semi_tandem_res'] = val >= 30 ? 'Normal' : 'Abaixo';
                if (fieldId === 'tandem') newAnswers['tandem_res'] = val > 17.56 ? 'Normal' : 'Abaixo';
                if (fieldId === 'tug') newAnswers['tug_res'] = val < 12.47 ? 'Normal' : 'Abaixo';
                if (fieldId === 'vel_marcha') newAnswers['vel_marcha_res'] = val >= 0.8 ? 'Normal' : 'Abaixo';
                if (fieldId === 'preensao_esq' || fieldId === 'preensao_dir') {
                    const threshold = patientGender === 'Feminino' ? 16 : 27;
                    const esqVal = parseFloat(String(newAnswers['preensao_esq'] || '0').replace(',', '.'));
                    const dirVal = parseFloat(String(newAnswers['preensao_dir'] || '0').replace(',', '.'));
                    
                    if (!isNaN(esqVal) && newAnswers['preensao_esq'] !== undefined && newAnswers['preensao_esq'] !== '') {
                        newAnswers['preensao_res_esq'] = esqVal >= threshold ? 'Normal' : 'Abaixo';
                    }
                    if (!isNaN(dirVal) && newAnswers['preensao_dir'] !== undefined && newAnswers['preensao_dir'] !== '') {
                        newAnswers['preensao_res_dir'] = dirVal >= threshold ? 'Normal' : 'Abaixo';
                    }
                }
                if (fieldId === 'unipodal_dir') newAnswers['unipodal_dir_res'] = val > 10 ? 'Normal' : 'Abaixo';
                if (fieldId === 'unipodal_esq') newAnswers['unipodal_esq_res'] = val > 10 ? 'Normal' : 'Abaixo';
                if (fieldId === 'toques_valor') newAnswers['toques_res'] = val >= 8 ? 'Normal' : 'Abaixo';
                if (fieldId === 'sentar_levantar') {
                    const age = Number(patientAge);
                    let threshold = 14.8; 
                    if (age >= 60 && age <= 69) threshold = 11.4;
                    else if (age >= 70 && age <= 79) threshold = 12.6;
                    else if (age < 60) threshold = 11.4; 
                    newAnswers['sentar_levantar_res'] = val < threshold ? 'Normal' : 'Abaixo';
                }
            } else if (resMap[fieldId]) {
                newAnswers[resMap[fieldId]] = '';
            }
        }

        if (type === 'afTornozelo') {
            const groups = [
                ['fig8', 'p_perna_tat'],
                ['flex_pla_at', 'dorsi_at', 'inv_at', 'eve_at'],
                ['flex_pla_ps', 'dorsi_ps', 'inv_ps', 'eve_ps'],
                ['wblt'],
                ['f_pla_tor', 'f_dor_tor', 'f_inv_tor', 'f_eve_tor']
            ];
            groups.flat().forEach(mId => {
                const esqId = `${mId}_esq`;
                const dirId = `${mId}_dir`;
                if (fieldId === esqId || fieldId === dirId) {
                    const esq = parseFloat(String(newAnswers[esqId] || '0').replace(',', '.'));
                    const dir = parseFloat(String(newAnswers[dirId] || '0').replace(',', '.'));
                    if (esq > 0 || dir > 0) {
                        const max = Math.max(esq, dir);
                        const min = Math.min(esq, dir);
                        const deficit = Math.round(((max - min) / max) * 100);
                        newAnswers[`${mId}_def`] = `${deficit}%`;
                    } else {
                        newAnswers[`${mId}_def`] = '';
                    }
                }
            });

            // SLHRT Classification
            const esq = Number(newAnswers['slhrt_esq']);
            const dir = Number(newAnswers['slhrt_dir']);
            if (esq > 0 || dir > 0) {
                const classify = (val: number) => {
                    if (val >= 25) return "Adequado (≥25)";
                    if (val >= 20) return "Limítrofe (20-24)";
                    if (val >= 15) return "Déficit Moderado (15-19)";
                    return "Déficit Importante (<15)";
                };

                const diff = Math.abs(esq - dir);
                const max = Math.max(esq, dir);
                const pctDiff = max > 0 ? (diff / max) * 100 : 0;
                const isAsymmetric = diff > 5 || pctDiff > 10;

                const statusEsq = esq > 0 ? classify(esq) : "Não realizado";
                const statusDir = dir > 0 ? classify(dir) : "Não realizado";
                const asymmetryText = isAsymmetric ? "SIM" : "NÃO";

                newAnswers['slhrt_class'] = `ESQUERDO: ${statusEsq}\nDIREITO: ${statusDir}\nAssimetria Significativa: ${asymmetryText} (${diff} reps / ${pctDiff.toFixed(1)}%)`;
            } else {
                newAnswers['slhrt_class'] = '';
            }

            // YBT Asymmetry for afTornozelo
            if (fieldId === 'ybt_esq' || fieldId === 'ybt_dir') {
                const yesq = parseFloat(String(newAnswers['ybt_esq'] || '0').replace(',', '.'));
                const ydir = parseFloat(String(newAnswers['ybt_dir'] || '0').replace(',', '.'));
                if (yesq > 0 || ydir > 0) {
                    const diff = Math.abs(yesq - ydir).toFixed(1);
                    newAnswers['ybt_diff'] = `${diff}%`;
                } else {
                    newAnswers['ybt_diff'] = '';
                }
            }

            // Step-Down Test Classification
            const vEsq = parseFloat(String(newAnswers.sd_valgo_esq || '0').replace(',', '.'));
            const vDir = parseFloat(String(newAnswers.sd_valgo_dir || '0').replace(',', '.'));
            const qEsq = parseFloat(String(newAnswers.sd_queda_esq || '0').replace(',', '.'));
            const qDir = parseFloat(String(newAnswers.sd_queda_dir || '0').replace(',', '.'));

            if (vEsq > 0) newAnswers.sd_valgo_res_esq = (vEsq >= 3 && vEsq <= 13) ? 'Normal' : 'Déficit';
            if (vDir > 0) newAnswers.sd_valgo_res_dir = (vDir >= 3 && vDir <= 13) ? 'Normal' : 'Déficit';
            if (qEsq > 0) newAnswers.sd_queda_res_esq = (qEsq >= 5 && qEsq <= 15) ? 'Normal' : 'Déficit';
            if (qDir > 0) newAnswers.sd_queda_res_dir = (qDir >= 5 && qDir <= 15) ? 'Normal' : 'Déficit';
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

        // Auto-calculate MMII (afMmii) Muscle Strength Deficits and Ratios
        if (type === 'afMmii') {
            const mmiiMovements = ['f_abd_q', 'f_ext_q', 'f_ext_j', 'f_flex_j', 'f_flex_j_p'];
            mmiiMovements.forEach(mId => {
                if (fieldId === `${mId}_esq` || fieldId === `${mId}_dir`) {
                    const esq = Number(newAnswers[`${mId}_esq`]);
                    const dir = Number(newAnswers[`${mId}_dir`]);
                    if (esq > 0 || dir > 0) {
                        const max = Math.max(esq, dir);
                        const min = Math.min(esq, dir);
                        const deficit = Math.round(((max - min) / max) * 100);
                        newAnswers[`${mId}_def`] = `${deficit}%`;
                    } else {
                        newAnswers[`${mId}_def`] = '';
                    }
                }
            });

            // Knee Ratios (I/Q)
            const sides = ['esq', 'dir'];
            sides.forEach(side => {
                const ext = Number(newAnswers[`f_ext_j_${side}`]);
                const flex_sentado = Number(newAnswers[`f_flex_j_${side}`]);
                const flex_prono = Number(newAnswers[`f_flex_j_p_${side}`]);
                const flexValue = flex_sentado || flex_prono;

                if (ext && flexValue) {
                    const ratio = Math.round((flexValue / ext) * 100);
                    newAnswers[`rel_iq_${side}`] = `${ratio}%`;
                } else {
                    newAnswers[`rel_iq_${side}`] = '';
                }
            });

            // YBT Asymmetry
            if (fieldId === 'ybt_esq' || fieldId === 'ybt_dir') {
                const esq = parseFloat(String(newAnswers['ybt_esq']).replace(',', '.'));
                const dir = parseFloat(String(newAnswers['ybt_dir']).replace(',', '.'));
                if (!isNaN(esq) && !isNaN(dir)) {
                    const diff = Math.abs(esq - dir).toFixed(1);
                    newAnswers['ybt_diff'] = `${diff}%`;
                } else {
                    newAnswers['ybt_diff'] = '';
                }
            }
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
            
            const returnTo = searchParams.get('returnTo');
            
            // Update URL with the new ID and preserve returnTo for the summary screen buttons
            if ((response as any).id && !assessmentId) {
                router.replace(`/dashboard/assessment/${patientId}/${type}?id=${(response as any).id}${returnTo ? `&returnTo=${returnTo}` : ''}`, { scroll: false });
            }
            
            if (returnTo) {
                const score = calculateAssessmentScore((questionnaire as any).structure?.calculationType || (type as CalculationType), answers);
                const scoreValue = score.percentage !== undefined ? `${score.percentage}%` : `${score.score} pts`;
                
                // Save score to localStorage for the parent assessment to pick up
                let scoreKey = 'score';
                if (type === 'ndi' || type === 'oswestry' || type === 'quickdash') {
                    scoreKey = `${type}_score`;
                }
                
                localStorage.setItem(`return_score_${patientId}_${returnTo}_${scoreKey}`, scoreValue);
                // Also set the main key for simpler recovery
                localStorage.setItem(`return_score_${patientId}_${returnTo}`, scoreValue);
                
                // router.push(`/dashboard/assessment/${patientId}/${returnTo}?returnTo=${type}`); // Removed for summary screen review
            }

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
        if (!result) {
            if (returnTo) router.push(`/dashboard/assessment/${patientId}/${returnTo}?returnTo=${type}`);
            return;
        }
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
            router.push(`/dashboard/assessment/${patientId}/${returnTo}?returnTo=${type}`);
        }
    };

    return (
      <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: 'white' }}>

        {renderFullPrintView()}

        {/* COMPARISON CHART FOR AOFAS */}
        {type === 'aofas' && result && (
            <div style={{ maxWidth: '800px', margin: '0 auto 2rem auto', padding: '0 1rem' }}>
                <ComparisonChart 
                    currentValue={result.score}
                    chartTitle="Evolução Clínica - Score AOFAS"
                    unit=" pts"
                    history={patientAssessments.filter(a => a.assessment_type === 'aofas')}
                    assessmentId={assessmentId}
                    currentDate={assessmentDate}
                    useScoreData={true}
                />
            </div>
        )}

        <div className="no-print print:hidden" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
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
                    Concluir e Voltar para Avaliação
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
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #8b0000', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo-kinesis.png" alt="KinesisLab Logo" style={{ width: '200px', height: 'auto', display: 'inline-block', marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '1.8rem', color: '#8b0000', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 900 }}>{questionnaire.title}</h1>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>Paciente: {patientName || patientId}</p>
                    <p style={{ fontSize: '0.85rem', color: '#444', margin: '2px 0 0' }}>Data da Avaliação: {assessmentDate}</p>
                </div>
                {(user || assessmentOwner) && (
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: '700', margin: 0, color: '#333' }}>
                            Avaliador: {(assessmentOwner?.name || user?.name)}
                        </p>
                        {((assessmentOwner?.crefito || user?.crefito)) && (
                            <p style={{ fontSize: '0.8rem', color: '#555', margin: 0 }}>CREFITO: {assessmentOwner?.crefito || user?.crefito}</p>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* RESUMO VISUAL - DESTAQUE DAS PRINCIPAIS IMAGENS */}
        {(() => {
            // New strategy: Search questionnaire definition for fields that might have images
            const visualFields: any[] = [];
            const collectVisualData = (sections: Section[]) => {
                sections.forEach(s => {
                    s.fields?.forEach(f => {
                        if (['bodyschema', 'paintmap', 'angle_measurement', 'image-upload'].includes(f.type)) {
                            const val = answers[f.id];
                            if (val && ((typeof val === 'string' && val.startsWith('data:image')) || Array.isArray(val))) {
                                visualFields.push({ ...f, value: val });
                            }
                        }
                    });
                    if (s.subsections) collectVisualData(s.subsections);
                });
            };
            collectVisualData(questionnaire.sections || []);

            // Identify primary images for the summary
            const areaDorField = visualFields.find(f => f.id.includes('area_dor') || f.type === 'bodyschema' || f.type === 'paintmap');
            const posturalField = visualFields.find(f => (f.id.includes('postura') || f.type === 'angle_measurement' || f.type === 'image-upload') && f.id !== areaDorField?.id);

            const areaDor = areaDorField?.value;
            let posturalImg = posturalField?.value;
            if (Array.isArray(posturalImg)) posturalImg = posturalImg.find(v => typeof v === 'string' && v.startsWith('data:image')) || posturalImg[0];

            if (areaDor || posturalImg) {
                return (
                    <div className="visual-summary-section" style={{ 
                        marginBottom: '3rem', 
                        pageBreakInside: 'avoid', 
                        padding: '1.5rem', 
                        backgroundColor: '#fffafb', 
                        borderRadius: '1.5rem', 
                        border: '2px solid #8b000033' 
                    }}>
                        <h2 style={{ fontSize: '1.4rem', color: '#8b0000', borderBottom: '2px solid #8b0000', paddingBottom: '0.5rem', marginBottom: '1.5rem', fontWeight: 900, textTransform: 'uppercase' }}>
                            Resumo Visual da Avaliação ({questionnaire.title})
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: (areaDor && posturalImg) ? '1fr 1fr' : '1fr', gap: '2rem' }}>
                            {areaDor && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#333' }}>Esquema Corporal / Mapa de Dor</h3>
                                    <div style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #eee', padding: '0.5rem', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <img src={areaDor} style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }} alt="Esquema Corporal" />
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', fontSize: '0.7rem', fontWeight: '800' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff0000' }}/> Dor</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0000ff' }}/> Formigamento</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffff00' }}/> Queimação</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00ff00' }}/> Parestesia</div>
                                    </div>
                                </div>
                            )}
                            {posturalImg && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#333' }}>Análise Postural / Fotográfica</h3>
                                    <div style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #eee', padding: '0.5rem', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <img src={posturalImg} style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '0.5rem' }} alt="Postura" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            return null;
        })()}

        {items.filter(item => {
            if (!isClinical) return true;
            const section = item as Section;
            
            // Mandatory sections to show (titles mostly)
            if (section.id === 'anamnese' || section.id === 'diagnostico_conclusoes') return true;
            
            const hasValue = (val: any) => {
                if (val === undefined || val === null || val === '' || val === 'null') return false;
                if (Array.isArray(val)) return val.length > 0;
                // Allow 0 for range (EVA) as per user feedback
                return true;
            };

            const checkFieldsData = (fields?: any[]) => fields?.some(f => {
                const fid = typeof f === 'string' ? f : f?.id;
                return hasValue(answers[fid]);
            });

            const checkRowsData = (rows?: any[]) => rows?.some((r: any) => r.fields.some((f: any) => {
                const fid = typeof f === 'string' ? f : f.id;
                return hasValue(answers[fid]);
            }));

            const hasTableData = section.type === 'table' && checkRowsData(section.rows);
            // check subsections for multi-table
            const hasSubData = section.subsections?.some(sub => 
                checkFieldsData(sub.fields) || (sub.type === 'table' && checkRowsData(sub.rows))
            );

            return checkFieldsData(section.fields) || hasTableData || hasSubData;
        }).reduce((acc: any[], item, idx, arr) => {
            // Group movimento_cervical and irritabilidade side-by-side in print mode
            if (isClinical) {
                const section = item as Section;
                const nextSection = arr[idx + 1] as Section;
                
                if (section.id === 'movimento_cervical' && nextSection?.id === 'irritabilidade') {
                    acc.push(
                        <div key={`group-${section.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' }}>
                            <FormSection 
                                section={section}
                                isPrint={true}
                                answers={answers}
                                handleInputChange={handleInputChange}
                                isEditing={false}
                                onImageClick={setSelectedImage}
                                onAnalyzeImage={handleAnalyzeImage}
                                patientGender={patientGender}
                                patientAge={patientAge}
                                patientAssessments={patientAssessments}
                                assessmentId={assessmentId}
                                patientId={patientId}
                                type={type}
                                router={router}
                                assessmentDate={assessmentDate}
                                onOpenDynamo={undefined}
                            />
                            <FormSection 
                                section={nextSection}
                                isPrint={true}
                                answers={answers}
                                handleInputChange={handleInputChange}
                                isEditing={false}
                                onImageClick={setSelectedImage}
                                onAnalyzeImage={handleAnalyzeImage}
                                patientGender={patientGender}
                                patientAge={patientAge}
                                patientAssessments={patientAssessments}
                                assessmentId={assessmentId}
                                patientId={patientId}
                                type={type}
                                router={router}
                                assessmentDate={assessmentDate}
                                onOpenDynamo={undefined}
                            />
                        </div>
                    );
                    return acc;
                }
                
                // Skip 'irritabilidade' because it was handled in the 'movimento_cervical' block
                if (section.id === 'irritabilidade' && arr[idx - 1] && (arr[idx - 1] as Section).id === 'movimento_cervical') {
                    return acc;
                }
            }

            acc.push(
                isClinical ? (
                        <FormSection 
                            key={idx}
                            section={item as Section}
                            isPrint={true}
                            answers={answers}
                            handleInputChange={handleInputChange}
                            isEditing={false}
                            onImageClick={setSelectedImage}
                            onAnalyzeImage={handleAnalyzeImage}
                            patientGender={patientGender}
                            patientAge={patientAge}
                            patientAssessments={patientAssessments}
                            assessmentId={assessmentId}
                            patientId={patientId}
                            type={type}
                            router={router}
                            assessmentDate={assessmentDate}
                            onOpenDynamo={undefined}
                        />
                ) : (
                    !(item as any).isInstruction && (
                    <div key={idx} className="print-section" style={{ marginBottom: '1.5rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '1rem', backgroundColor: 'var(--bg-secondary)', pageBreakInside: 'avoid' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--secondary)', marginBottom: '1rem' }}>
                            {(item as any).text}
                        </div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--primary)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontWeight: '800' }}>
                            {answers[idx] !== undefined 
                                ? ((item as any).options?.find((o: any) => o.value === answers[idx])?.label || 'Não respondido')
                                : 'Não respondido'
                            }
                        </div>
                    </div>
                    )
                )
            );
            return acc;
        }, [])}

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

        {/* Functional Charts moved inline to sections */}
        <div style={{ display: 'none' }}>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <div className="background-gradient" />
            <Header />
        
        <PosturalAnalysisModal 
            isOpen={posturalModal.isOpen}
            onClose={() => setPosturalModal(prev => ({ ...prev, isOpen: false }))}
            imageSrc={posturalModal.image}
            onSave={handleSavePosturalAnalysis}
        />

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
                            assessmentDate={assessmentDate}
                            onOpenDynamo={(fieldId, label) => {
                                setDynamoModal({ fieldId, label });
                                setDynamoValues(['', '', '']);
                            }}
                            onOpenYbt={() => setYbtModal(true)}
                            onAnalyzeImage={handleAnalyzeImage}
                        />
                    ) : (
                        <div className="section-container" style={{ marginBottom: '2.5rem' }}>
                            <h3 className="functional-title">
                                {(currentItem as any).text}
                            </h3>
                            {!(currentItem as any).isInstruction && (
                                <div className="options-grid">
                                    {(currentItem as any).options?.map((opt: any) => {
                                        const isSelected = answers[currentIdx] === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleSelect(opt.value)}
                                                className={`option-button ${isSelected ? 'selected' : ''}`}
                                            >
                                                <span className="option-label">{opt.label}</span>
                                                <div className="radio-circle">
                                                    {isSelected && <div className="radio-inner" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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

      <AnimatePresence>
                {dynamoModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="modal-content"
                            style={{ 
                                backgroundColor: 'white', 
                                padding: '2rem', 
                                borderRadius: '1.5rem', 
                                width: '100%', 
                                maxWidth: '400px', 
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calculator size={24} className="text-primary" />
                                    <span>Inserir Medidas</span>
                                </div>
                                <button onClick={() => setDynamoModal(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                Calculando média para: <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{dynamoModal.label}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {dynamoValues.map((val, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--secondary)' }}>Medida {i + 1} (kgF)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={val}
                                            onChange={(e) => {
                                                const newVals: [string, string, string] = [...dynamoValues];
                                                newVals[i] = e.target.value;
                                                setDynamoValues(newVals);
                                            }}
                                            placeholder="0.00"
                                            autoFocus={i === 0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const next = (e.target as HTMLElement).parentElement?.nextElementSibling?.querySelector('input');
                                                    if (next) next.focus();
                                                }
                                            }}
                                            style={{ 
                                                width: '100%', 
                                                padding: '0.85rem', 
                                                borderRadius: '0.75rem', 
                                                border: '2px solid var(--border)',
                                                fontSize: '1.1rem',
                                                fontWeight: '700',
                                                textAlign: 'center',
                                                color: 'var(--secondary)',
                                                outline: 'none',
                                                transition: 'border-color 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button 
                                    onClick={() => {
                                        const values = dynamoValues.filter(v => v !== '' && !isNaN(Number(v))).map(Number);
                                        if (values.length > 0) {
                                            const avg = values.reduce((a, b) => a + b, 0) / values.length;
                                            handleInputChange(dynamoModal.fieldId, avg.toFixed(2));
                                            setDynamoModal(null);
                                            setDynamoValues(['', '', '']);
                                            toast.success("Média calculada e inserida!");
                                        } else {
                                            toast.error("Insira ao menos uma medida válida.");
                                        }
                                    }}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: '800', fontSize: '1rem', boxShadow: 'var(--shadow-md)' }}
                                >
                                    Calcular Média e Inserir
                                </button>
                                <button 
                                    onClick={() => {
                                        setDynamoModal(null);
                                        setDynamoValues(['', '', '']);
                                    }}
                                    className="btn-action-outline"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: '600' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {ybtModal && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '1rem' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="modal-content"
                            style={{ 
                                backgroundColor: 'white', 
                                padding: '2rem', 
                                borderRadius: '1.5rem', 
                                width: '100%', 
                                maxWidth: '500px', 
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                border: '1px solid var(--border)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calculator size={24} className="text-primary" />
                                    <span>Calculadora Y-Balance Test</span>
                                </div>
                                <button onClick={() => setYbtModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.5rem' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '4px', borderRadius: '1rem', marginBottom: '0.5rem' }}>
                                <button 
                                    onClick={() => setYbtValues(prev => ({ ...prev, side: 'esq' }))}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none', backgroundColor: ybtValues.side === 'esq' ? 'white' : 'transparent', color: ybtValues.side === 'esq' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', boxShadow: ybtValues.side === 'esq' ? 'var(--shadow-sm)' : 'none', transition: 'all 0.2s' }}
                                >
                                    Membro Esquerdo
                                </button>
                                <button 
                                    onClick={() => setYbtValues(prev => ({ ...prev, side: 'dir' }))}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none', backgroundColor: ybtValues.side === 'dir' ? 'white' : 'transparent', color: ybtValues.side === 'dir' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '700', boxShadow: ybtValues.side === 'dir' ? 'white' : 'none', transition: 'all 0.2s' }}
                                >
                                    Membro Direito
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', padding: '1rem 0' }}>
                                {/* Y Layout Visualization */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                            <ArrowUp size={16} className="text-primary" />
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--secondary)' }}>Anterior</label>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={ybtValues.anterior}
                                            onChange={(e) => setYbtValues(prev => ({ ...prev, anterior: e.target.value }))}
                                            placeholder="0.0"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid var(--border)', fontSize: '1.1rem', textAlign: 'center', fontWeight: '800' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                    <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                            <ArrowDownLeft size={16} className="text-primary" />
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--secondary)' }}>Post-Lateral</label>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={ybtValues.postLateral}
                                            onChange={(e) => setYbtValues(prev => ({ ...prev, postLateral: e.target.value }))}
                                            placeholder="0.0"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid var(--border)', fontSize: '1.1rem', textAlign: 'center', fontWeight: '800' }}
                                        />
                                    </div>
                                    <div style={{ width: '140px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                            <ArrowDownRight size={16} className="text-primary" />
                                            <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--secondary)' }}>Post-Medial</label>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={ybtValues.postMedial}
                                            onChange={(e) => setYbtValues(prev => ({ ...prev, postMedial: e.target.value }))}
                                            placeholder="0.0"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '2px solid var(--border)', fontSize: '1.1rem', textAlign: 'center', fontWeight: '800' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '1px solid var(--border)' }}>
                                    <Ruler size={20} className="text-muted" />
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Tamanho do Membro (cm)</label>
                                        <input 
                                            type="number" 
                                            value={ybtValues.limbLength}
                                            onChange={(e) => setYbtValues(prev => ({ ...prev, limbLength: e.target.value }))}
                                            placeholder="Ex: 85.0"
                                            style={{ width: '100%', padding: '0.5rem 0', background: 'transparent', border: 'none', borderBottom: '2px solid var(--primary)', fontSize: '1.25rem', fontWeight: '800', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.25rem', backgroundColor: 'var(--primary-light)', borderRadius: '1.5rem', textAlign: 'center', border: '2px solid var(--primary)' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '800' }}>Resultado Final YBT</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>
                                    {(() => {
                                        const { anterior, postMedial, postLateral, limbLength } = ybtValues;
                                        const sum = Number(anterior) + Number(postMedial) + Number(postLateral);
                                        const len = Number(limbLength);
                                        if (sum > 0 && len > 0) {
                                            return ((sum / (3 * len)) * 100).toFixed(1) + '%';
                                        }
                                        return '0.0%';
                                    })()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button 
                                    onClick={() => {
                                        const { anterior, postMedial, postLateral, limbLength, side } = ybtValues;
                                        const sum = Number(anterior) + Number(postMedial) + Number(postLateral);
                                        const len = Number(limbLength);
                                        if (sum > 0 && len > 0) {
                                            const result = ((sum / (3 * len)) * 100).toFixed(1);
                                            handleInputChange(`ybt_${side}`, result);
                                            setYbtModal(false);
                                            toast.success(`Resultado ${side === 'esq' ? 'Esquerdo' : 'Direito'} inserido!`);
                                        } else {
                                            toast.error("Preencha todos os valores para calcular.");
                                        }
                                    }}
                                    className="btn-primary"
                                    style={{ width: '100%', padding: '1.1rem', borderRadius: '1.25rem', fontWeight: '900', fontSize: '1.1rem', boxShadow: '0 10px 20px -5px rgba(var(--primary-rgb), 0.3)' }}
                                >
                                    Confirmar e Salvar
                                </button>
                                <button onClick={() => setYbtModal(false)} className="btn-action-outline" style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', fontWeight: '700' }}>
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

            </AnimatePresence>

      {/* Draft Recovery Modal */}
      <AnimatePresence>
        {showDraftModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="modal-content" 
                    style={{ maxWidth: '450px', width: '90%', padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: 'var(--shadow-lg)' }}
                >
                    <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <HistoryIcon size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>Rascunho Detectado</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Identificamos um rascunho de avaliação que não foi finalizado. Como deseja prosseguir?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button 
                            onClick={handleRecoverDraft}
                            className="btn-primary"
                            style={{ width: '100%', padding: '0.85rem' }}
                        >
                            Recuperar Dados Salvos
                        </button>
                        <button 
                            onClick={handleDiscardDraft}
                            className="btn-action-outline"
                            style={{ width: '100%', padding: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                        >
                            Iniciar Novo Formulário
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

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
            }
            main { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
            table { font-size: 8pt !important; width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
            th, td { border: 1px solid #333 !important; padding: 3px 6px !important; word-wrap: break-word !important; }
            .btn-primary, button, .no-print-element { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            .no-print { display: none !important; }
            img, canvas { max-width: 100% !important; height: auto !important; }
            .print-section { page-break-inside: auto; margin-bottom: 0.75rem; }
            footer, .footer, #footer { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
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
