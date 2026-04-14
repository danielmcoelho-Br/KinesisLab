"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PrintSummaryView from "@/components/assessment/layout/PrintSummaryView";
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
    Printer,
    X,
    Calculator,
    ArrowUp,
    ArrowDownLeft,
    ArrowDownRight,
    Ruler,
    AlertTriangle,
    Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { questionnairesData, Section } from "@/data/questionnaires";
import { getPatient } from "@/app/dashboard/actions";
import { toast } from "sonner";
import ClinicalFlagAlert from "@/components/assessment/ClinicalFlagAlert";
import Header from "@/components/Header";
import PatientInfoBanner from "@/components/PatientInfoBanner";
import PosturalAnalysisModal from "@/components/PosturalAnalysisModal";
import { calculateAssessmentScore, CalculationType } from "@/lib/calculations";
import { useAssessmentState } from "@/hooks/useAssessmentState";
import Bar from "@/components/assessment/Bar";
import AssessmentHistoryChart from "@/components/assessment/AssessmentHistoryChart";
import FormSection from "@/components/assessment/FormSection";
import SectionNav from "@/components/assessment/SectionNav";
import { AssessmentProvider } from "@/contexts/AssessmentContext";

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

function AssessmentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const type = params.type as string;
  const assessmentId = searchParams.get("id");

  const questionnaire = questionnairesData[type];
  
  const state = useAssessmentState({
    patientId,
    type,
    assessmentId,
    questionnaire,
    router,
    searchParams
  });

  const {
    currentIdx, setCurrentIdx,
    answers,
    isFinished,
    saving,
    isEditing, setIsEditing,
    showLogs, setShowLogs,
    changeLogs,
    user,
    assessmentOwner,
    assessmentOwnerId,
    assessmentDate,
    patientName,
    patientGender,
    patientAge,
    patientAssessments,
    selectedImage, setSelectedImage,
    showDraftModal, setShowDraftModal,
    pendingDraft,
    dynamoModal, setDynamoModal,
    dynamoValues, setDynamoValues,
    ybtModal, setYbtModal,
    ybtValues, setYbtValues,
    posturalModal, setPosturalModal,
    isDirty,
    activeFlags,
    handleRecoverDraft,
    handleDiscardDraft,
    handleSelect,
    handleAnalyzeImage,
    handleSavePosturalAnalysis,
    handleInputChange,
    handleFinish,
    handleExit,
    confirmExitDiscard,
    confirmExitSave,
    showExitModal
  } = state;

  const [showMyelopathyModal, setShowMyelopathyModal] = useState(false);

  if (!patientId || !isValidUUID(patientId)) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '2rem', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '2rem', borderRadius: '1.5rem', maxWidth: '500px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <CheckCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem', rotate: '45deg' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Sessão de Avaliação Inválida</h2>
                <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                    Identificamos um problema com o identificador do paciente (ID malformado). Isso pode acontecer devido a rascunhos antigos salvos no navegador.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/dashboard';
                        }}
                        className="btn-primary" 
                        style={{ width: '100%', padding: '1rem', backgroundColor: '#dc2626' }}
                    >
                        Limpar Dados e Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
  }

  if (!questionnaire) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Questionário não encontrado.</div>;
  }

  const isClinical = !!questionnaire.sections;
  const items = isClinical ? questionnaire.sections! : questionnaire.questions!;
  const currentItem = items[currentIdx];
  const progress = ((currentIdx + 1) / items.length) * 100;
  
  if (isFinished) {
    const calculationType = (questionnaire as any).structure?.calculationType || (type as CalculationType);
    const result = calculateAssessmentScore(calculationType as CalculationType, answers);
    const returnTo = searchParams.get("returnTo");

    const handleReturn = () => {
        if (returnTo && result) {
            router.push(`/dashboard/assessment/${patientId}/${returnTo}?returnTo=${type}`);
        }
    };

    return (
      <AssessmentProvider state={state}>
      <div style={{ minHeight: '100vh', padding: '2rem', backgroundColor: 'white' }}>
        <PrintSummaryView 
            forScreen={true}
            questionnaire={questionnaire}
            items={items}
            isClinical={isClinical}
        />

        {type === 'aofas' && result && (
            <div style={{ maxWidth: '800px', margin: '0 auto 2rem auto', padding: '0 1rem' }}>
                <AssessmentHistoryChart 
                    currentValue={Number(result.score)}
                    chartTitle="Evolução Clínica - Score AOFAS"
                    unit=" pts"
                    history={patientAssessments.filter(a => a.assessment_type === 'aofas')}
                    assessmentId={assessmentId}
                />
            </div>
        )}

        <div className="no-print hide-on-print" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <button
                className="btn-action-outline no-print"
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
      </AssessmentProvider>
    );
  }

  return (
    <AssessmentProvider state={state}>
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
                        onClick={handleExit}
                        className="btn-exit"
                        style={{ position: 'relative' }}
                    >
                        <ArrowLeft size={18} />
                        <span>Sair</span>
                        {isDirty && isEditing && (
                            <span title="Alterações não salvas" style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#f59e0b',
                                border: '2px solid white',
                                animation: 'pulse 1.5s ease-in-out infinite'
                            }} />
                        )}
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

                    {assessmentId && (
                        <button 
                            onClick={() => {
                                const baseUrl = window.location.origin;
                                const shareUrl = `${baseUrl}/assessment/public/summary/${assessmentId}`;
                                const message = encodeURIComponent(`Olá ${patientName}, segue o resumo da sua avaliação (${questionnaire.title}) realizada na KinesisLab: ${shareUrl}`);
                                window.open(`https://wa.me/?text=${message}`, '_blank');
                                toast.success("Link gerado e WhatsApp aberto!");
                            }}
                            className="btn-action-outline"
                            style={{ color: '#10B981', borderColor: '#6EE7B7' }}
                        >
                            <Share2 size={16} />
                            <span>Compartilhar</span>
                        </button>
                    )}

                    {assessmentId && !isEditing && (user?.role === 'ADMINISTRADOR' || assessmentOwnerId === user?.id) && (
                        <button 
                            onClick={() => {
                                setIsEditing(true);
                                setCurrentIdx(0);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-action-primary"
                        >
                            <Edit2 size={16} />
                            <span>Editar</span>
                        </button>
                    )}
                </div>
            </div>

            <PatientInfoBanner patientId={patientId} patientName={patientName} patientGender={patientGender} patientAge={patientAge} />
        </header>

        {!isEditing ? (
            <div style={{ paddingBottom: '4rem' }}>
                <PrintSummaryView 
                    forScreen={true}
                    questionnaire={questionnaire}
                    items={items}
                    isClinical={isClinical}
                />
            </div>
        ) : (
        <div className="assessment-layout">
            <SectionNav 
                items={items}
                isClinical={isClinical}
            />

            <div className="continuous-screen-view">
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
                    <ClinicalFlagAlert flags={activeFlags} />
                    {isClinical ? (
                        <FormSection 
                            section={currentItem as Section}
                            isPrint={false}
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
                            {currentItem.id !== 'finish' && currentIdx < items.length - 1 && (
                                <button
                                    onClick={() => {
                                        if ((type === 'afCervical' || type === 'afLombar') && items[currentIdx]?.id === 'exame_neurologico') {
                                            const reflexFields = type === 'afCervical' 
                                                ? ['ref_bic_esq', 'ref_bic_dir', 'ref_est_esq', 'ref_est_dir', 'ref_tri_esq', 'ref_tri_dir']
                                                : ['ref_pat_esq', 'ref_pat_dir', 'ref_aqui_esq', 'ref_aqui_dir'];
                                            
                                            const hasHyperreflexia = reflexFields.some(f => answers[f] === 'Hiperreflexia');
                                            
                                            if (hasHyperreflexia) {
                                                const specialFields = type === 'afCervical'
                                                    ? ['hoffmann_esq', 'hoffmann_dir', 'babinski_esq', 'babinski_dir', 'clonus_esq', 'clonus_dir', 'claudicacao_esq', 'claudicacao_dir']
                                                    : ['hoffmann_esq_l', 'hoffmann_dir_l', 'babinski_esq_l', 'babinski_dir_l', 'clonus_esq_l', 'clonus_dir_l', 'claudicacao_esq_l', 'claudicacao_dir_l'];
                                                
                                                const hasSpecialFilled = specialFields.some(f => answers[f] === true);
                                                
                                                if (!hasSpecialFilled) {
                                                    setShowMyelopathyModal(true);
                                                    return;
                                                }
                                            }
                                        }

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
        </div>
        </div>
        )}

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
      </main>
      <div className="print-restricted-wrapper">
         <PrintSummaryView 
            forScreen={false}
            questionnaire={questionnaire}
            items={items}
            isClinical={isClinical}
        />
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
                                            }}
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
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: '800', fontSize: '1rem' }}
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
                                    style={{ width: '100%', padding: '1.1rem', borderRadius: '1.25rem', fontWeight: '900', fontSize: '1.1rem' }}
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

      <AnimatePresence>
        {showExitModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="modal-content" 
                    style={{ maxWidth: '450px', width: '90%', padding: '2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1.5rem', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}
                >
                    <div style={{ backgroundColor: '#fef3c7', color: '#d97706', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <X size={30} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>Sair da Avaliação?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.25rem', lineHeight: '1.6' }}>
                        Você possui alterações que ainda não foram salvas permanentemente. Deseja salvar um rascunho para continuar depois?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                            onClick={confirmExitSave}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Save size={18} /> Sim, Salvar Rascunho
                        </button>
                        <button 
                            onClick={confirmExitDiscard}
                            className="btn-action-outline"
                            style={{ width: '100%', padding: '1rem', borderRadius: '1rem', fontWeight: '700', color: '#ef4444', borderColor: '#ef4444' }}
                        >
                            Não, Descartar e Sair
                        </button>
                        <button 
                            onClick={() => state.setShowExitModal(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem', padding: '0.5rem' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}

        {showMyelopathyModal && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, backdropFilter: 'blur(8px)' }}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="modal-content" 
                    style={{ maxWidth: '500px', width: '90%', padding: '2.5rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid var(--border)' }}
                >
                    <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <AlertTriangle size={36} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem', color: 'var(--secondary)', lineHeight: '1.2' }}>Atenção: Possível Mielopatia</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                        Campo <strong style={{color: 'var(--primary)'}}>HIPERREFLEXIA</strong> selecionado. Sugerido investigar reflexos patológicos para investigação de mielopatia.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button 
                            onClick={() => {
                                setShowMyelopathyModal(false);
                                setCurrentIdx(currentIdx + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-primary"
                            style={{ width: '100%', padding: '1.1rem', borderRadius: '1.25rem', fontWeight: '800', fontSize: '1.1rem' }}
                        >
                            Avaliado e Negativo
                        </button>
                        <button 
                            onClick={() => setShowMyelopathyModal(false)}
                            className="btn-action-outline"
                            style={{ width: '100%', padding: '1rem', borderRadius: '1.25rem', fontWeight: '700', fontSize: '1rem' }}
                        >
                            Avaliar
                        </button>
                    </div>
                </motion.div>
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
        
        .assessment-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: flex-start;
        }
        
        .continuous-screen-view {
          width: 100%;
          max-width: 850px;
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
        @media (max-width: 1024px) {
          .assessment-layout {
            grid-template-columns: 1fr;
          }
          .continuous-screen-view {
            max-width: 100%;
          }
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
          .functional-title {
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
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @media print {
            @page { margin: 0.8cm; }
            .no-print { display: none !important; }
            body { background: white !important; padding: 0 !important; overflow: visible !important; }
            .background-gradient { display: none !important; }
            .form-group { break-inside: avoid; margin-bottom: 0.5rem !important; }
            main { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
            table { font-size: 8pt !important; width: 100% !important; border-collapse: collapse !important; }
            th, td { border: 1px solid #333 !important; padding: 3px 6px !important; word-wrap: break-word !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            img, canvas { max-width: 100% !important; height: auto !important; }
            .print-section { page-break-inside: auto; margin-bottom: 0.75rem; }
            .chart-container { margin-top: 0.5rem !important; margin-bottom: 0.5rem !important; padding: 0.75rem !important; }
            tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
    </AssessmentProvider>
  );
}

export default function AssessmentPage() {
    return (
        <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center' }}>Carregando...</div>}>
            <AssessmentContent />
        </Suspense>
    );
}
