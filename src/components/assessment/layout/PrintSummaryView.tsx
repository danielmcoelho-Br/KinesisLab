import { Section } from "@/data/questionnaires";
import FormSection from "../FormSection";
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
        assessmentDate, 
        user, 
        assessmentOwner, 
        answers, 
        patientAssessments, 
        isFinished 
    } = state;
    return (
      <div className={forScreen ? "continuous-screen-view" : "print-all-content"}>
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

        {/* A renderização das imagens visuais ocorrerá naturalmente dentro das seções correspondentes usando o FormField */}
        {items.filter(item => {
            if (!isClinical) return true;
            const section = item as Section;
            
            // Mandatory sections to show (titles mostly)
            if (section.id === 'anamnese' || section.id === 'diagnostico_conclusoes') return true;
            
            const hasValue = (val: any) => {
                if (val === undefined || val === null || val === '' || val === 'null' || val === false) return false;
                if (Array.isArray(val)) return val.length > 0;
                return true;
            };

            const checkFieldsData = (fields?: any[]) => fields?.some(f => {
                const fid = typeof f === 'string' ? f : f?.id;
                if (f && typeof f !== 'string' && f.type === 'button' && fid.endsWith('_novo')) {
                    const questPrefix = fid.split('_')[0];
                    return patientAssessments.some(a => a.assessment_type === questPrefix);
                }
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
                
                const SYMMETRICAL_PAIRS: Record<string, string> = {
                    'movimento_cervical': 'irritabilidade',
                    'adm_ombro_esq': 'adm_ombro_dir',
                    'adm_mmii_esq': 'adm_mmii_dir',
                    'adm_tornozelo_at': 'adm_tornozelo_ps',
                    'adm_punho_at': 'adm_punho_ps',
                    'adm_mao_at': 'adm_mao_ps'
                };

                if (SYMMETRICAL_PAIRS[section.id] && nextSection?.id === SYMMETRICAL_PAIRS[section.id]) {
                    acc.push(
                        <div key={`group-${section.id}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%' }}>
                            <FormSection 
                                section={section}
                                isPrint={true}
                            />
                            <FormSection 
                                section={nextSection}
                                isPrint={true}
                            />
                        </div>
                    );
                    return acc;
                }
                
                // Skip the second section of a pair because it was handled in the first block
                const isSecondInPair = Object.values(SYMMETRICAL_PAIRS).includes(section.id) && 
                                     arr[idx - 1] && 
                                     SYMMETRICAL_PAIRS[(arr[idx - 1] as Section).id] === section.id;
                
                if (isSecondInPair) {
                    return acc;
                }
            }

            acc.push(
                isClinical ? (
                        <FormSection 
                            key={idx}
                            section={item as Section}
                            isPrint={true}
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
