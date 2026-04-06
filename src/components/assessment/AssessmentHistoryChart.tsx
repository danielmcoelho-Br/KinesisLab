"use client";

import { Image as ImageIcon } from "lucide-react";
import Bar from "./Bar";

interface AssessmentHistoryChartProps {
    currentValue: number;
    fieldId?: string;
    chartTitle: string;
    unit?: string;
    history?: any[];
    isPrint?: boolean;
    referenceValue?: number;
    referenceLabel?: string;
    assessmentId?: string | null;
    currentDate?: string;
    isEndurance?: boolean;
    useScoreData?: boolean;
}

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
}: AssessmentHistoryChartProps) => {
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
                            bottom: `calc(${(referenceValue / (maxValue || 1)) * 150}px + 30px)`, 
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
            `}</style>
        </div>
    );
};

export default AssessmentHistoryChart;
