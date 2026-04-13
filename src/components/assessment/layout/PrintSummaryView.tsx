import { Section } from "@/data/questionnaires";
import FormSection from "../FormSection";
import FormField from "../FormField";
import { calculateAssessmentScore, CalculationType } from "@/lib/calculations";

interface PrintSummaryViewProps {
    forScreen?: boolean;
    questionnaire: any;
    items: any[];
    isClinical: boolean;
}

import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function PrintSummaryView({
    forScreen = false,
    questionnaire,
    items,
    isClinical
}: PrintSummaryViewProps) {
    const params = useParams();
    const searchParams = useSearchParams();
    const state = useAssessmentContext();
    
    const patientId = params.patientId as string;
    const hasValue = (val: any) => val !== undefined && val !== null && val !== "" && val !== "null" && val !== false && (Array.isArray(val) ? val.length > 0 : true);
    const type = (params.type as string) || state.type;
    const assessmentId = searchParams.get('id');
    
    const { 
        patientName, 
        patientAge,
        patientGender,
        assessmentDate, 
        user, 
        assessmentOwner, 
        answers, 
        patientAssessments, 
        isFinished 
    } = state;

    return (
      <div className={forScreen ? "continuous-screen-view" : "print-all-content"}>
        {/* HEADER REDESIGN */}
        <div style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo-kinesis.png" alt="KinesisLab Logo" style={{ width: '130px', height: 'auto', marginBottom: '0.1rem' }} />
            <div style={{ textAlign: 'center', width: '100%', borderBottom: '2.5px solid #8b0000', paddingBottom: '0.4rem', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '1.3rem', color: '#8b0000', margin: 0, textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}>
                    {questionnaire.title}
                </h1>
            </div>

            {/* PATIENT INFO CARD */}
            <div style={{ 
                width: '100%', 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem', 
                backgroundColor: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '0.75rem', 
                border: '1px solid #e2e8f0',
                fontSize: '0.95rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Paciente</span>
                        {patientName || patientId}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <p style={{ margin: 0, fontWeight: '700' }}>
                           <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Idade</span>
                           {patientAge || '--'} anos
                        </p>
                        <p style={{ margin: 0, fontWeight: '700' }}>
                           <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Sexo</span>
                           {patientGender || '--'}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>
                        <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Avaliador</span>
                        {(assessmentOwner?.name || user?.name)}
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'flex-end' }}>
                        <p style={{ margin: 0, fontWeight: '700' }}>
                           <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>CREFITO</span>
                           {assessmentOwner?.crefito || user?.crefito || '--'}
                        </p>
                        <p style={{ margin: 0, fontWeight: '700' }}>
                           <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Data</span>
                           {assessmentDate || '--'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* CONTENT RENDERER */}
        {items.filter(item => {
            if (!isClinical) return true;
            const section = item as Section;
            
            // Core sections should usually be shown
            if (['anamnese', 'diagnostico_conclusoes', 'resultados_diagnostico', 'sugestoes'].includes(section.id)) return true;
            
            const hasValue = (val: any) => {
                if (val === undefined || val === null || val === '' || val === 'null' || val === false) return false;
                if (Array.isArray(val)) return val.length > 0;
                if (typeof val === 'number') return true; // Keep 0
                return true;
            };

            const checkFieldsData = (fields?: any[]) => fields?.some(f => {
                const fid = typeof f === 'string' ? f : f?.id;
                if (!fid) return false;
                if (f && typeof f !== 'string' && f.type === 'button' && fid.endsWith('_novo')) {
                    const questPrefix = fid.split('_')[0];
                    return (patientAssessments || []).some(a => a.assessment_type === questPrefix);
                }
                return hasValue(answers[fid]);
            });

            const checkRowsData = (rows?: any[]) => rows?.some((r: any) => r.fields.some((f: any) => {
                const fid = typeof f === 'string' ? f : f.id;
                return hasValue(answers[fid]);
            }));

            const hasTableData = section.type === 'table' && checkRowsData(section.rows);
            const hasSubData = section.subsections?.some(sub => 
                checkFieldsData(sub.fields) || (sub.type === 'table' && checkRowsData(sub.rows))
            );

            // Also check if any field in the section has history data (even if current answer is empty) to show charts
            const hasHistoryData = section.fields?.some(f => {
                const fid = typeof f === 'string' ? f : f?.id;
                return (patientAssessments || []).some(a => a.answers?.[fid]);
            });

            const hasTableHistoryData = section.type === 'table' && section.rows?.some(r => r.fields.some(f => {
                const fid = typeof f === 'string' ? f : f.id;
                return (patientAssessments || []).some(a => a.answers?.[fid]);
            }));

            return checkFieldsData(section.fields) || hasTableData || hasSubData || hasHistoryData || hasTableHistoryData;
        }).reduce((acc: any[], item, idx, arr) => {
            const isClinicalAssessment = ['afOmbro', 'afCervical', 'afLombar', 'afGeriatria'].includes(type);
            const section = item as Section;

            if (isClinicalAssessment) {
                const isMultiTable = section.type === 'multi-table';
                const FULL_WIDTH_SECTIONS = [
                    'anamnese', 
                    'testes_resistencia', 
                    'resistencia_tronco', 
                    'testes_especiais_resistidos',
                    'conclusoes',
                    'diagnostico_conclusoes',
                    'resultados_diagnostico',
                    'sugestoes',
                    'oswestry_integracao',
                    'ndi_integracao',
                    'quickdash_integracao'
                ];

                // Dashboard logic is now handled during section rendering
                acc.push(section);
                return acc;

                const mustBeFullWidth = FULL_WIDTH_SECTIONS.includes(section.id) || isMultiTable;

                // PAIR PAIRING (Subsequent rows)
                // NEVER pair multi-tables. ONLY pair simple 'table' sections.
                if (!mustBeFullWidth && idx > (isDashboardSecondary ? 1 : 0)) {
                    const prevWasGrouped = acc.some(a => a.isPairGroup && a.secondarySection === section);
                    if (prevWasGrouped) return acc;

                    const nextSection = arr[idx + 1] as Section;
                    const canPairNext = nextSection && !FULL_WIDTH_SECTIONS.includes(nextSection.id) && nextSection.type === 'table';
                    
                    if (canPairNext && section.type === 'table') {
                        acc.push({
                            ...section,
                            isPairGroup: true,
                            secondarySection: nextSection
                        });
                        return acc;
                    }
                }

                // If it reached here, it's either full-width or a solo simple section
                acc.push(section);
                return acc;
            }

            acc.push(item);
            return acc;
        }, []).map((item, idx) => {
            if (isClinical) {
                const section = item as any;

                // 1. ANAMNESE DASHBOARD (Multiple Texts + Side-by-Side EVA/Map)
                if (section.id === 'anamnese') {
                    const evaField = section.fields?.find((f: any) => typeof f !== 'string' && f.id === 'intensidade_dor');
                    const mapField = section.fields?.find((f: any) => typeof f !== 'string' && f.id === 'area_dor');
                    
                    // Fields to render as full-width boxes (textareas excluding special ones)
                    const textFields = section.fields?.filter((f: any) => 
                        typeof f !== 'string' && 
                        f.type === 'textarea' && 
                        f.id !== 'area_dor' && 
                        f.id !== 'intensidade_dor' &&
                        hasValue(answers[f.id])
                    );
                    
                    return (
                        <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginBottom: '1.5rem' }}>
                            {/* Full Width Text Boxes */}
                            {(textFields as any[])?.map((f: any) => (
                                <div key={f.id} style={{ padding: '0.85rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', width: '100%' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: '900', marginBottom: '0.5rem', color: '#8b0000', textTransform: 'uppercase' }}>{f.label}</h4>
                                    <FormField field={f} isPrint={true} />
                                </div>
                            ))}

                            {/* Grid Row (48% / 48%) for EVA and Map */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', width: '100%', pageBreakInside: 'avoid' }}>
                                {/* Left Column: EVA */}
                                <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase' }}>INTENSIDADE DA DOR (EVA)</h4>
                                    {evaField && <FormField field={{ ...evaField, hideLabel: true }} isPrint={true} />}
                                    {!evaField && <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#cbd5e1', textAlign: 'center' }}>---</div>}
                                </div>

                                {/* Right Column: Body Map */}
                                <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '220px' }}>
                                    <h4 style={{ width: '100%', fontSize: '0.8rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem', textTransform: 'uppercase' }}>MAPA DE DOR</h4>
                                    {mapField && (
                                        <div style={{ transform: 'scale(1)', transformOrigin: 'top center' }}>
                                            <FormField field={{ ...mapField, hideLabel: true }} isPrint={true} />
                                        </div>
                                    )}
                                    {!mapField && <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', marginTop: '2rem' }}>Mapa não preenchido</div>}
                                </div>
                            </div>
                        </div>
                    );
                }

                // 2. PAIR GROUP RENDERER (Clean 2-column layout for subsequent tables)
                if (section.isPairGroup) {
                    return (
                        <div key={section.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
                            <FormSection section={section} isPrint={true} />
                            <FormSection section={section.secondarySection} isPrint={true} />
                        </div>
                    );
                }

                return (
                    <div key={(item as Section).id} style={{ marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
                        <FormSection section={item as Section} isPrint={true} />
                    </div>
                );
            } else {
                return (
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
                );
            }
        })}


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

        {/* Signature Section */}
        {(assessmentOwner?.signature || user?.signature) && (
            <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', breakInside: 'avoid' }}>
                <img 
                    src={assessmentOwner?.signature || user?.signature} 
                    alt="Assinatura" 
                    style={{ maxHeight: '80px', maxWidth: '250px', marginBottom: '0.5rem' }} 
                />
                <div style={{ width: '300px', borderTop: '1px solid #333', textAlign: 'center', paddingTop: '0.5rem' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1rem' }}>{assessmentOwner?.name || user?.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#444', fontWeight: 'bold' }}>FISIOTERAPEUTA - CREFITO: {assessmentOwner?.crefito || user?.crefito}</p>
                </div>
            </div>
        )}

        {/* Functional Charts moved inline to sections */}
        <div style={{ display: 'none' }}>
        </div>
      </div>
    );
}
