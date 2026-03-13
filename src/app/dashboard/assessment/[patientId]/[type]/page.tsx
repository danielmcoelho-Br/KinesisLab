"use client";

import { useState, useEffect, Suspense } from "react";
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
    ChevronUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { questionnairesData, Section, SectionField } from "@/data/questionnaires";
import { saveAssessment, getAssessment, updateAssessment } from "@/app/dashboard/assessment/actions";
import { toast } from "sonner";
import BodySchema from "@/components/BodySchema";
import PatientInfoBanner from "@/components/PatientInfoBanner";

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

  useEffect(() => {
    async function load() {
        if (!assessmentId) return;
        const res = await getAssessment(assessmentId);
        if (res.success && res.data) {
            const loadedAnswers = res.data.questionnaire_answers as Record<string, any>;
            setAnswers(loadedAnswers);
            setOriginalAnswers(loadedAnswers);
            setChangeLogs(res.data.change_logs as any[] || []);
            setIsEditing(false);
        }
    }
    load();
  }, [assessmentId]);

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

  const handleInputChange = (fieldId: string, value: any) => {
    if (!isEditing) return;
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    const result = questionnaire.calculateScore?.(answers);
    
    if (assessmentId) {
        const logEntries: string[] = [];
        const timestamp = new Date().toLocaleString('pt-BR');
        
        if (isClinical) {
            questionnaire.sections?.forEach(section => {
                section.fields.forEach(field => {
                    const oldVal = originalAnswers[field.id];
                    const newVal = answers[field.id];
                    
                    // Simple comparison (ignoring strict type if possible, or converting to string)
                    if (String(oldVal || "") !== String(newVal || "")) {
                        if (field.type === 'bodyschema') {
                            logEntries.push(`${timestamp} - Administrador alterou o mapa corporal.`);
                        } else {
                            logEntries.push(`${timestamp} - Administrador alterou o campo '${field.label}' de '${oldVal || 'vazio'}' para '${newVal || 'vazio'}'`);
                        }
                    }
                });
            });
        } else {
            questionnaire.questions?.forEach((q, idx) => {
                const oldVal = originalAnswers[idx];
                const newVal = answers[idx];
                if (oldVal !== newVal) {
                    const oldLabel = q.options?.find(o => o.value === oldVal)?.label || 'vazio';
                    const newLabel = q.options?.find(o => o.value === newVal)?.label || 'vazio';
                    logEntries.push(`${timestamp} - Administrador alterou a questão '${q.text}' de '${oldLabel}' para '${newLabel}'`);
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
            scoreData: result
        });

        if (response.success) {
            setIsFinished(true);
            toast.success("Avaliação salva com sucesso!");
        } else {
            toast.error("Erro ao salvar avaliação.");
        }
    }
    setSaving(false);
  };

  const renderField = (field: SectionField) => {
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
              value={answers[field.id] || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="Descreva aqui..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
          </div>
        );
      case 'range':
        return (
          <div key={field.id} className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label">{field.label}</label>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary)' }}>{answers[field.id] || 0}</span>
            </div>
            <input 
              type="range" 
              min={field.min} 
              max={field.max} 
              step={field.step} 
              value={answers[field.id] || 0} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              disabled={!isEditing}
              style={{ width: '100%', cursor: isEditing ? 'pointer' : 'not-allowed' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{field.min}</span>
                <span>{field.max}</span>
            </div>
          </div>
        );
      case 'number':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <input 
              type="number" 
              {...commonProps}
              value={answers[field.id] || ""} 
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder="0"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            <select 
              {...commonProps}
              value={answers[field.id] || ""} 
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
                        image={field.image || ""} 
                        value={answers[field.id]} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                    />
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  if (isFinished) {
    const result = questionnaire.calculateScore?.(answers);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: 'var(--bg)' }}>
        <div className="background-gradient" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ 
            maxWidth: '560px', 
            width: '100%', 
            backgroundColor: 'white', 
            padding: '3rem', 
            textAlign: 'center', 
            borderRadius: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <CheckCircle size={80} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Avaliação Finalizada!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>O resultado foi calculado com base nas informações fornecidas.</p>
          
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {result.percentage}{result.unit}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {result.interpretation}
            </div>
          </div>

          <button 
            className="btn-primary"
            onClick={() => router.push(`/dashboard/patient/${patientId}`)}
          >
            Voltar ao Histórico
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '1.5rem' }}>
      <div className="background-gradient" />

      <header style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button 
                onClick={() => router.back()}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    backgroundColor: 'rgba(255,255,255,0.8)', 
                    border: '1px solid var(--border)', 
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    color: 'var(--text-muted)', 
                    fontWeight: '600', 
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <ArrowLeft size={18} />
                <span>Sair</span>
            </button>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{questionnaire.title}</h1>
            </div>
            
            <div style={{ width: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                {assessmentId && !isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            backgroundColor: 'var(--primary)', 
                            color: 'white',
                            border: 'none', 
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontWeight: '600', 
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <Edit2 size={16} />
                        <span>Editar</span>
                    </button>
                )}
            </div>
        </div>

        <PatientInfoBanner patientId={patientId} />
      </header>

      <div style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '5rem' }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginBottom: '3rem', overflow: 'hidden' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            style={{ height: '100%', backgroundColor: 'var(--primary)' }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={{ 
              backgroundColor: 'white', 
              padding: '2.5rem', 
              borderRadius: '2rem', 
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)'
            }}
          >
            {isClinical ? (
              <>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2.5rem', color: 'var(--secondary)' }}>
                  {(currentItem as Section).title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {(currentItem as Section).fields.map(field => renderField(field))}
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2.5rem', lineHeight: '1.3', color: 'var(--secondary)' }}>
                  {(currentItem as any).text}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(currentItem as any).options?.map((option: any) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      disabled={!isEditing}
                      style={{ 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '1.5rem', 
                        borderRadius: '1.25rem', 
                        border: '2px solid', 
                        borderColor: answers[currentIdx] === option.value ? 'var(--primary)' : '#f3f4f6',
                        backgroundColor: answers[currentIdx] === option.value ? 'var(--primary-light)' : 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: isEditing ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        opacity: !isEditing && answers[currentIdx] !== option.value ? 0.5 : 1
                      }}
                    >
                      <span style={{ fontSize: '1.125rem', fontWeight: '600', color: answers[currentIdx] === option.value ? 'var(--primary)' : 'var(--text)' }}>
                        {option.label}
                      </span>
                      <div style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        border: '2px solid', 
                        borderColor: answers[currentIdx] === option.value ? 'var(--primary)' : '#d1d5db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {answers[currentIdx] === option.value && (
                          <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--primary)', borderRadius: '50%' }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  fontWeight: '700', 
                  fontSize: '1rem',
                  cursor: 'pointer',
                  opacity: currentIdx === 0 ? 0.3 : 1
                }}
              >
                <ChevronLeft size={20} />
                Anterior
              </button>

              <div style={{ display: 'flex', gap: '1rem' }}>
                {isEditing && (
                    <button
                        disabled={saving}
                        onClick={handleFinish}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '1rem 2.5rem', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {saving ? "Salvando..." : (assessmentId ? "Salvar Alterações" : "Finalizar Avaliação")}
                        {assessmentId && <Save size={20} />}
                    </button>
                )}
                
                {currentIdx < items.length - 1 && (
                    <button
                        onClick={() => setCurrentIdx(currentIdx + 1)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            backgroundColor: 'var(--primary-light)', 
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            color: 'var(--primary)', 
                            fontWeight: '700', 
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Próxima
                        <ChevronRight size={20} />
                    </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Audit Log Timeline */}
        {assessmentId && changeLogs.length > 0 && (
            <div style={{ marginTop: '3rem' }}>
                <button 
                    onClick={() => setShowLogs(!showLogs)}
                    style={{ 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        backgroundColor: 'white',
                        border: '1px solid var(--border)',
                        borderRadius: '1rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        color: 'var(--secondary)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <HistoryIcon size={20} style={{ color: 'var(--primary)' }} />
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
                            style={{ 
                                backgroundColor: 'white', 
                                border: '1px solid var(--border)', 
                                borderTop: 'none',
                                borderBottomLeftRadius: '1rem', 
                                borderBottomRightRadius: '1rem',
                                padding: '1.5rem',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    left: '7px', 
                                top: 0, 
                                bottom: 0, 
                                width: '2px', 
                                backgroundColor: '#e5e7eb' 
                            }} />
                            
                            {changeLogs.map((log, idx) => (
                                <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: '-28px', 
                                        top: '4px', 
                                        width: '12px', 
                                        height: '12px', 
                                        borderRadius: '50%', 
                                        backgroundColor: 'var(--primary)',
                                        border: '3px solid white'
                                    }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text)', fontWeight: '500' }}>
                                        {log.entry}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        )}
      </div>
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
