"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";
import FormField from "./FormField";
import DataTable from "./DataTable";
import AssessmentHistoryChart from "./AssessmentHistoryChart";
import AssessmentComparisonChart from "./AssessmentComparisonChart";
import AngleMeasurement from "@/components/AngleMeasurement";
import { Section, SectionField, TableRow } from "@/types/clinical";
import { useAssessmentContext } from "@/contexts/AssessmentContext";
import { useParams, useRouter, useSearchParams } from "next/navigation";

interface FormSectionProps {
    section: Section; 
    isPrint?: boolean;
}

const FormSection = memo(({ section, isPrint: overrideIsPrint }: FormSectionProps) => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const patientId = params.patientId as string;
    const type = params.type as string;
    const assessmentId = searchParams.get('id');

    const state = useAssessmentContext();
    
    const answers = state.answers;
    const isEditing = state.isEditing;
    const handleInputChange = state.handleInputChange;
    const onImageClick = state.setSelectedImage;
    const onAnalyzeImage = state.handleAnalyzeImage;
    const patientGender = state.patientGender;
    const patientAge = state.patientAge;
    const patientAssessments = state.patientAssessments;
    const assessmentDate = state.assessmentDate;
    
    const isPrint = overrideIsPrint !== undefined ? overrideIsPrint : state.isPrint;

    const onOpenDynamo = (fieldId: string, label: string) => state.setDynamoModal({ fieldId, label });
    const onOpenYbt = () => state.setYbtModal(true);
    // Helpers for visibility
    const hasVal = (val: unknown) => val !== undefined && val !== null && val !== "" && val !== "null" && val !== false && (Array.isArray(val) ? val.length > 0 : true);
    
    // Check if section as a whole has any data
    const sectionHasData = () => {
        if (isEditing) return true;
        if (["anamnese", "diagnostico_conclusoes"].includes(section.id)) return true;
        
        const checkFields = (fs?: (SectionField | string)[]) => fs?.some(f => {
            const fid = typeof f === "string" ? f : f.id;
            if (f && typeof f !== "string" && f.type === 'button' && fid.endsWith('_novo')) {
                const questPrefix = fid.split('_')[0];
                return patientAssessments.some(a => a.assessment_type === questPrefix);
            }
            return hasVal(answers[fid]);
        });
        const checkRows = (rs?: TableRow[]) => rs?.some(r => r.fields.some((f) => hasVal(answers[typeof f === "string" ? f : (f as any).id])));
        
        if (section.type === "table") return checkRows(section.rows);
        if (section.type === "multi-table") return section.subsections?.some(sub => 
            checkFields(sub.fields) || (sub.type === "table" && checkRows(sub.rows))
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
                            type="button"
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <DataTable 
                        section={section} 
                        isPrint={isPrint}
                    />
                    {['perimetria', 'forca', 'dinamometria', 'ndi_integracao', 'oswestry_integracao', 'quickdash_integracao', 'testes_especiais_resistidos'].includes(section.id) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem' }}>
                    {section.rows?.map((row: TableRow) => row.fields.map((f, fidx: number) => {
                                const fid = typeof f === "string" ? f : (f as any).id;
                                const col = section.columns?.[fidx + 1];
                                const colLabel = typeof col === "string" ? col : (col?.label || "");
                                if (colLabel.includes("Esquerdo") || colLabel.includes("Direito") || fid.endsWith("_score")) {
                                    return (
                                        <AssessmentHistoryChart 
                                            key={`hist-${fid}`}
                                            fieldId={fid}
                                            currentValue={Number(String(answers[fid] || "0").replace("%", "").replace(",", ".")) || 0}
                                            chartTitle={`Evolução: ${row.label} (${colLabel})`}
                                            unit={fid.endsWith("_score") ? "%" : (section.id.includes("forca") ? "kgF" : "cm")}
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
                        {section.fields?.filter((f: any) => {
                            if (isEditing) return true;
                            if (f.type === 'button') return f.id?.endsWith('_novo');
                            return hasVal(answers[f.id]);
                        }).map((field: any) => (
                            <FormField 
                                key={field.id}
                                field={field}
                                isPrint={isPrint}
                            />
                        ))}
                    </div>
                </div>
            ) : section.type === 'multi-table' ? (
                <div style={{ 
                    display: (isPrint || !isEditing) && ['exame_neurologico', 'avaliacao_do_movimento', 'miofascial_neural', 'irritabilidade', 'adm', 'palpacao', 'perimetria', 'forca', 'amplitude_movimento', 'inspecao_testes_func', 'inspecao'].some(id => section.id.includes(id)) ? 'grid' : 'flex', 
                    gridTemplateColumns: (isPrint || !isEditing) && ['exame_neurologico', 'avaliacao_do_movimento', 'miofascial_neural', 'irritabilidade', 'adm', 'palpacao', 'perimetria', 'forca', 'amplitude_movimento', 'inspecao_testes_func', 'inspecao'].some(id => section.id.includes(id)) ? '1fr 1fr' : 'none',
                    flexDirection: 'column', 
                    gap: isPrint ? '0.75rem' : '1.5rem' 
                }}>
                    {section.subsections?.filter((sub: Section) => {
                        if (isEditing) return true;
                        const checkFields = (fs?: (SectionField | string)[]) => fs?.some(f => hasVal(answers[typeof f === "string" ? f : f.id]));
                        const checkRows = (rs?: TableRow[]) => rs?.some(r => r.fields.some((f) => hasVal(answers[typeof f === "string" ? f : (f as any).id])));
                        return checkFields(sub.fields) || (sub.type === "table" && checkRows(sub.rows));
                    }).map((sub: Section, sidx: number) => (
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
                                        isPrint={isPrint}
                                    />
                                    {sub.fields && sub.fields.length > 0 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: (sub.type === 'table' && sub.fields.some((f:any) => f.type === 'textarea')) ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                            {sub.fields.filter((f: SectionField) => isEditing || hasVal(answers[f.id])).map((field: SectionField) => (
                                                <FormField 
                                                    key={field.id}
                                                    field={field}
                                                    isPrint={isPrint}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: sub.fields?.some((f: SectionField) => f.type === "image-upload") ? "1fr 1fr" : "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                                    {sub.fields?.map((field: SectionField) => (
                                        <FormField 
                                            key={field.id}
                                            field={field}
                                            isPrint={isPrint}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Subsection Comparison Charts */}
                            {['forca', 'dinamometria'].includes(sub.id) && sub.type === 'table' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                                    {sub.rows?.map((row: TableRow) => {
                                        const esq = row.fields.find((f: any) => (typeof f === "string" ? f : f.id).toLowerCase().includes("esq"));
                                        const dir = row.fields.find((f: any) => (typeof f === "string" ? f : f.id).toLowerCase().includes("dir"));
                                        if (esq && dir) {
                                            const vE = Number(String(answers[typeof esq === "string" ? esq : esq.id] || "0").replace(",", ".")) || 0;
                                            const vD = Number(String(answers[typeof dir === "string" ? dir : dir.id] || "0").replace(",", ".")) || 0;
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
                        {section.fields?.filter((f: any) => {
                            if (isEditing) return true;
                            if (f.type === 'button') return f.id?.endsWith('_novo');
                            return hasVal(answers[f.id]);
                        }).map((field: any) => (
                            <FormField 
                                key={field.id}
                                field={field}
                                isPrint={isPrint}
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
                    {section.fields?.filter((f: any) => {
                        if (isEditing) return true;
                        if (f.type === 'button') return f.id?.endsWith('_novo');
                        return hasVal(answers[f.id]);
                    }).map((field: any) => (
                        <FormField 
                            key={field.id}
                            field={field}
                            isPrint={isPrint}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
});

export default FormSection;
