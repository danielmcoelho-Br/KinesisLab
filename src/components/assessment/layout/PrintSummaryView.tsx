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
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const patientId = params.patientId as string;
    const type = params.type as string;
    const assessmentId = searchParams.get('id');

    const state = useAssessmentContext();
    
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
            const isCervicalOrLumbar = type === 'afCervical' || type === 'afLombar';
            
            if (isClinical) {
                const section = item as Section;
                const nextSection = arr[idx + 1] as Section;
                
                // Optimized Anamnese + Clinical Data (Neuro/ADM) Grouping for Cervical/Lumbar
                const nextIsClinicalData = nextSection?.id === 'exame_neurologico' || nextSection?.id === 'adm';
                
                if (section.id === 'anamnese' && isCervicalOrLumbar && nextIsClinicalData) {
                    const areaDorField = section.fields?.find((f: any) => typeof f !== 'string' && f.id === 'area_dor');
                    const intensidadeDorField = section.fields?.find((f: any) => typeof f !== 'string' && f.id === 'intensidade_dor');
                    
                    acc.push(
                        <div key={`group-top-${section.id}`} style={{ width: '100%', marginBottom: '1rem' }}>
                            {/* Main Subjective Block (Anamnese) */}
                            <div style={{ 
                                padding: '0.85rem 1rem', 
                                backgroundColor: 'white', 
                                borderRadius: '0.75rem', 
                                border: '1px solid #e2e8f0',
                                marginBottom: '0.75rem',
                                width: '100%'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '0.5rem', color: '#8b0000', textTransform: 'uppercase' }}>Características da Disfunção</h3>
                                <div style={{ width: '100%' }}>
                                    <FormSection 
                                        section={{ ...section, fields: section.fields?.map((f: any) => ({ ...f, hideLabel: (f.id === 'anamnese_texto' || f.id === 'anamnese_obs') })) }}
                                        isPrint={true}
                                        hideTitle={true}
                                        excludeFields={['area_dor', 'intensidade_dor']}
                                    />
                                </div>
                            </div>
                            
                            {/* STRICT 2-COLUMN LAYOUT TO FILL PAGE 1 */}
                            <div style={{ width: '100%', clear: 'both', overflow: 'hidden' }}>
                                {/* Left Column (48%): EVA + Miótomos (Priority) */}
                                <div style={{ float: 'left', width: '48%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {/* Intensidade de Dor (EVA) */}
                                    <div style={{ padding: '0.65rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--secondary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>INTESIDADE DA DOR (EVA)</h4>
                                        {intensidadeDorField && (
                                            <div style={{ marginTop: '0.25rem' }}>
                                                <FormField 
                                                    field={{ ...intensidadeDorField, hideLabel: true }} 
                                                    isPrint={true} 
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Miótomos Table (Specifically requested below EVA) */}
                                    {nextSection?.subsections?.find((s: any) => s.id === 'miotomos') && (
                                        <div style={{ width: '100%', marginTop: '0.25rem' }}>
                                            <FormSection 
                                                section={{ 
                                                    ...nextSection, 
                                                    title: 'Miótomos (Força 0-5)',
                                                    subsections: [nextSection.subsections.find((s: any) => s.id === 'miotomos')]
                                                }}
                                                isPrint={true}
                                                hideTitle={false}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Right Column (48%): Mapa de Dor */}
                                <div style={{ float: 'right', width: '48%', padding: '0.65rem 0.75rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--secondary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>MAPA DE DOR</h4>
                                    {areaDorField && (
                                        <div style={{ display: 'flex', justifyContent: 'center', transform: 'scale(0.82)', transformOrigin: 'top center', marginTop: '0.25rem' }}>
                                            <FormField 
                                                field={{ ...areaDorField, hideLabel: true }} 
                                                isPrint={true}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={{ clear: 'both' }}></div>
                            </div>

                            {/* REMAINING NEURO EXAM (Reflexos, Testes Especiais, etc.) */}
                            {nextSection?.subsections?.filter((s: any) => s.id !== 'miotomos').length > 0 && (
                                <div style={{ width: '100%', marginTop: '0.75rem' }}>
                                    <FormSection 
                                        section={{ 
                                            ...nextSection, 
                                            title: 'Outros Testes Neurológicos',
                                            subsections: nextSection.subsections.filter((s: any) => s.id !== 'miotomos')
                                        }}
                                        isPrint={true}
                                        hideTitle={false}
                                        excludeFields={['neuro_cervical_obs', 'neuro_lombar_obs']}
                                    />
                                </div>
                            )}
                        </div>
                    );
                    return acc;
                }

                // General grouping logic for other forms (e.g. Cervical/Lumbar Step 1)
                if (section.id === 'anamnese' && !isCervicalOrLumbar && nextIsClinicalData) {
                    const areaDorField = section.fields?.find((f: any) => typeof f !== 'string' && f.id === 'area_dor');
                    acc.push(
                        <div key={`group-top-${section.id}`} style={{ width: '100%', marginBottom: '1rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '900', marginBottom: '0.5rem', color: '#8b0000', textTransform: 'uppercase' }}>Características da Disfunção</h3>
                                <FormSection section={{ ...section, fields: section.fields?.map((f: any) => ({ ...f, hideLabel: (f.id === 'anamnese_texto' || f.id === 'anamnese_obs' || f.id === 'anamnese' || f.type === 'textarea') })) }} isPrint={true} hideTitle={true} excludeFields={['area_dor']} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', marginTop: '0.5rem' }}>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', backgroundColor: '#fff' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '800', marginBottom: '0.25rem', color: 'var(--secondary)' }}>MAPA DE DOR</h4>
                                    {areaDorField && <FormField field={{ ...areaDorField, hideLabel: true }} isPrint={true} />}
                                </div>
                                <FormSection section={nextSection} isPrint={true} />
                            </div>
                        </div>
                    );
                    return acc;
                }

                // Skip clinical data already grouped
                const isGrouped = (section.id === 'exame_neurologico' || section.id === 'adm') && arr[idx - 1] && (arr[idx - 1] as Section).id === 'anamnese';
                if (isGrouped) return acc;

                const SYMMETRICAL_PAIRS: Record<string, string> = {
                    'movimento_cervical': 'irritabilidade',
                    'avaliacao_do_movimento': 'irritabilidade',
                    'adm_ombro_esq': 'adm_ombro_dir',
                    'adm_mmii_esq': 'adm_mmii_dir',
                    'adm_tornozelo_at': 'adm_tornozelo_ps',
                    'adm_punho_at': 'adm_punho_ps',
                    'adm_mao_at': 'adm_mao_ps',
                    'testes_equilibrio': 'equilibrio_funcional',
                    'testes_mobilidade': 'teste_forca'
                };

                if (SYMMETRICAL_PAIRS[section.id] && nextSection?.id === SYMMETRICAL_PAIRS[section.id]) {
                    acc.push(
                        <div key={`group-${section.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' }}>
                            <FormSection section={section} isPrint={true} />
                            <FormSection section={nextSection} isPrint={true} />
                        </div>
                    );
                    return acc;
                }
                
                if (Object.values(SYMMETRICAL_PAIRS).includes(section.id) && arr[idx - 1] && SYMMETRICAL_PAIRS[(arr[idx - 1] as Section).id] === section.id) {
                    return acc;
                }
            }

            acc.push(
                isClinical ? (
                    (isCervicalOrLumbar && (item as Section).id === 'diagnostico_conclusoes') ? (
                        <div key={`conclusions-${(item as Section).id}`} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            {(item as Section).fields?.map((f: any) => (
                                <div key={f.id} style={{ 
                                    padding: '1rem', 
                                    backgroundColor: 'white', 
                                    borderRadius: '0.75rem', 
                                    border: '1px solid #e2e8f0',
                                    pageBreakInside: 'avoid'
                                }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '0.75rem', color: '#8b0000', textTransform: 'uppercase' }}>{f.label}</h3>
                                    <FormField 
                                        field={{ ...f, hideLabel: true }}
                                        isPrint={true}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <FormSection 
                            key={idx}
                            section={item as Section}
                            isPrint={true}
                        />
                    )
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
