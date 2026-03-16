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
    ChevronUp,
    Camera,
    Upload,
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
    if (!currentValue && history.length === 0) return null;

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
        ...history.map(h => Number(h.answers?.[fieldId]) || 0)
    ) * 1.2 || 60;

    const Bar = ({ value, label, color, subLabel }: { value: number, label: string, color: string, subLabel?: string }) => (
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
                <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxValue) * 100}%` }}
                    style={{ 
                        width: '100%', 
                        backgroundColor: color,
                        borderRadius: '4px 4px 0 0'
                    }}
                />
                <div style={{ 
                    position: 'absolute', 
                    top: value / maxValue > 0.5 ? '50%' : 'auto',
                    bottom: value / maxValue > 0.5 ? 'auto' : '10px',
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    color: value / maxValue > 0.5 ? '#fff' : 'var(--text)',
                    textShadow: value / maxValue > 0.5 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    zIndex: 1,
                    textAlign: 'center',
                    width: '100%'
                }}>
                    {value}s
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text)' }}>{label}</div>
                {subLabel && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{subLabel}</div>}
            </div>
        </div>
    );

    return (
        <div style={{ 
            marginTop: '1.5rem', 
            marginBottom: '2rem', 
            padding: '1.5rem', 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            border: '1px solid var(--border)',
            boxShadow: isPrint ? 'none' : 'var(--shadow-sm)'
        }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={18} /> {chartTitle}
            </h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', minHeight: '200px' }}>
                {norm && (
                    <Bar 
                        value={norm.mean} 
                        label="Normalidade" 
                        color="#94a3b8" 
                        subLabel={`${gender === 'Feminino' ? 'Mulheres' : 'Homens'} ${norm.ageRange[0]}-${norm.ageRange[1]}a`} 
                    />
                )}
                
                {history.slice().reverse().map((h, i) => (
                    <Bar 
                        key={h.id} 
                        value={Number(h.answers?.[fieldId]) || 0} 
                        label={`Avaliação`} 
                        subLabel={new Date(h.created_at).toLocaleDateString('pt-BR')}
                        color="var(--primary-light)" 
                    />
                ))}

                <Bar 
                    value={Number(currentValue) || 0} 
                    label="Teste Atual" 
                    color="var(--primary)" 
                />
            </div>
        </div>
    );
};

const FunctionalHistoryChart = ({ history = [], currentScore, type, isEmbedded = false }: { history: any[], currentScore: number, type: string, isEmbedded?: boolean }) => {
    if (history.length === 0 && !currentScore) return null;

    const data = [...history.slice().reverse().map(h => ({
        date: new Date(h.created_at).toLocaleDateString('pt-BR'),
        score: h.scoreData?.percentage || 0
    })), {
        date: 'Hoje',
        score: currentScore
    }].filter(d => d.date === 'Hoje' ? d.score > 0 : true);

    if (data.length === 1 && data[0].date === 'Hoje' && data[0].score === 0) return null;

    return (
        <div style={{ 
            marginTop: isEmbedded ? '0.5rem' : '2rem', 
            padding: isEmbedded ? '1rem' : '1.5rem', 
            backgroundColor: isEmbedded ? 'var(--bg)' : 'var(--bg-secondary)', 
            borderRadius: '1rem',
            border: isEmbedded ? '1px solid var(--border)' : 'none'
        }}>
            <h4 style={{ fontSize: isEmbedded ? '0.85rem' : '1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--secondary)' }}>
                Evolução Funcional (% Incapacidade - {type.toUpperCase()})
            </h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '200px' }}>
                {data.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ height: '150px', width: '100%', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '8px', position: 'relative', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${d.score}%` }}
                                style={{ width: '100%', backgroundColor: d.date === 'Hoje' ? 'var(--primary)' : 'var(--primary-light)', borderRadius: '4px 4px 0 0' }}
                            />
                            <div style={{ 
                                position: 'absolute', 
                                top: d.score > 50 ? '50%' : 'auto',
                                bottom: d.score > 50 ? 'auto' : '10px',
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                fontSize: '0.8rem', 
                                fontWeight: '800', 
                                color: d.score > 50 ? '#fff' : 'var(--text)',
                                textShadow: d.score > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                             }}>
                                {d.score}%
                            </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: '600', textAlign: 'center' }}>{d.date}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};


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
                latestQuest = all.find((a: any) => a.assessment_type === questType);
            }
        }

        if (assessmentId) {
            const res = await getAssessment(assessmentId);
            if (res.success && res.data) {
                const data = res.data as any;
                const loadedAnswers = data.questionnaire_answers as Record<string, any>;
                setAnswers(loadedAnswers);
                setOriginalAnswers(loadedAnswers);
                setChangeLogs(data.change_logs as any[] || []);
                setAssessmentOwnerId(data.created_by_id);
                setAssessmentOwner(data.created_by);
                if (data.created_at) {
                    setAssessmentDate(new Date(data.created_at).toLocaleDateString('pt-BR'));
                }
                setIsEditing(false);
            }
        } else {
            // Check for draft in localStorage
            const draftKey = `assessment_draft_${patientId}_${type}`;
            const draft = localStorage.getItem(draftKey);
            let currentAnswers: Record<string, any> = {};
            if (draft) {
                try {
                    currentAnswers = JSON.parse(draft);
                } catch (e) {
                    console.error("Erro ao carregar rascunho:", e);
                }
            }

            // If no draft but we have a latest quest, populate previous fields
            if (Object.keys(currentAnswers).length === 0 && latestQuest) {
                const prefix = type === 'afLombar' ? 'oswestry' : type === 'afCervical' ? 'ndi' : 'quickdash';
                currentAnswers[`${prefix}_score_previo`] = `${(latestQuest as any).score_data?.percentage || 0}%`;
                if (latestQuest.created_at) {
                    currentAnswers[`${prefix}_data_previo`] = new Date(latestQuest.created_at).toISOString().split('T')[0];
                }
            }

            // CHECK FOR RETURN SCORE
            const returnScoreKey = `return_score_${patientId}_${type}`;
            const returnScore = localStorage.getItem(returnScoreKey);
            if (returnScore) {
                let fieldId = 'score'; // fallback default

                if (type === 'afLombar') fieldId = 'oswestry_score';
                else if (type === 'afCervical') fieldId = 'ndi_score';
                else if (type === 'afOmbro') fieldId = 'quickdash_score';
                else if (type === 'afGeriatria') {
                    // For geriatria, the returnToField is encoded in the returnScore key
                    // We check each possible sub-questionnaire
                    const geriatricScoreKeys = ['man_score', 'ves13_score', 'lbpq_score', 'brief_score'];
                    for (const key of geriatricScoreKeys) {
                        const subKey = `return_score_${patientId}_${type}_${key}`;
                        const subScore = localStorage.getItem(subKey);
                        if (subScore) {
                            currentAnswers[key] = subScore;
                            localStorage.removeItem(subKey);
                        }
                    }
                    fieldId = ''; // handled above
                }

                if (fieldId) {
                    currentAnswers[fieldId] = returnScore.includes('%') ? returnScore : `${returnScore}%`;
                    localStorage.removeItem(returnScoreKey);
                    toast.success(`Resultado do questionário importado!`);
                } else if (type !== 'afGeriatria') {
                    localStorage.removeItem(returnScoreKey);
                } else {
                    // For geriatria, still remove the general key if present
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

            setAnswers(currentAnswers);
            if (draft) toast.info("Rascunho detectado e restaurado.");
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

  const handleInputChange = (fieldId: string, value: any) => {
    if (!isEditing) return;
    setAnswers(prev => {
        const newAnswers = { ...prev, [fieldId]: value };
        
        // Auto-calculate RL/RM ratio for Shoulder (Old fields - keeping for compatibility if needed, but primary is now table)
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
        
        return newAnswers;
    });
  };

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

  const renderTable = (section: Section, isPrint: boolean = false) => {
    if (!section.rows || !section.columns) return null;

    return (
        <div style={{ overflowX: 'auto', marginBottom: isPrint ? '1rem' : '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isPrint ? '0.9rem' : '1rem' }}>
                <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        {section.columns.map((col, i) => {
                            const isLabelColumn = i === 0;
                            const colLabel = typeof col === 'string' ? col : col.label;
                            const colAction = typeof col === 'string' ? null : col.action;

                            return (
                                <th key={i} style={{ padding: '0.75rem 1rem', textAlign: isLabelColumn ? 'left' : 'center', borderBottom: '2px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isLabelColumn ? 'flex-start' : 'center', gap: '0.5rem' }}>
                                        <span>{colLabel}</span>
                                        {colAction && isEditing && (
                                            <button 
                                                onClick={() => handleHeaderAction(colAction, i, section)}
                                                style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
                                            >
                                                Todos {colAction.value}
                                            </button>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {section.rows.map((row, rIdx) => {
                        const hasRowData = row.fields.some(f => answers[typeof f === 'string' ? f : f.id]);
                        if (isPrint && !hasRowData) return null;

                        return (
                            <tr key={row.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: rIdx % 2 === 0 ? 'white' : 'var(--bg-secondary)', transition: 'background-color 0.2s' }}>
                            <td style={{ padding: '0.75rem 1rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--secondary)', width: '30%' }}>
                                {row.label}
                            </td>
                            {row.fields.map((field, fIdx) => {
                                const fieldId = typeof field === 'string' ? field : field.id;
                                const fieldType = typeof field === 'string' ? 'text' : field.type;
                                const fieldOptions = typeof field === 'string' ? [] : (field.options || []);
                                
                                return (
                                    <td key={fIdx} style={{ padding: '0.5rem 1rem' }}>
                                        {fieldType === 'checkbox' ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {isPrint ? (
                                                    answers[fieldId] ? (
                                                        <span style={{ color: '#8B0000', fontWeight: '900', fontSize: '1.2rem' }}>X</span>
                                                    ) : (
                                                        <span style={{ color: '#ccc' }}>-</span>
                                                    )
                                                ) : (
                                                    <input 
                                                        type="checkbox" 
                                                        checked={!!answers[fieldId]}
                                                        onChange={(e) => handleInputChange(fieldId, e.target.checked)}
                                                        disabled={!isEditing}
                                                        style={{ width: '18px', height: '18px', cursor: isEditing ? 'pointer' : 'not-allowed' }}
                                                    />
                                                )}
                                            </div>
                                        ) : fieldType === 'select' ? (
                                            isPrint ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontWeight: '600' }}>{answers[fieldId] || "-"}</span>
                                                </div>
                                            ) : (
                                                <select
                                                    value={answers[fieldId] || ""}
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
                                                    {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            )
                                        ) : fieldType === 'image-upload' ? (
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                {renderImageUpload(fieldId, true)}
                                            </div>
                                        ) : (
                                            isPrint ? (
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontWeight: '600' }}>{answers[fieldId] || "-"}</span>
                                                </div>
                                            ) : (
                                                <input 
                                                    type={fieldType === 'number' ? 'number' : 'text'}
                                                    value={answers[fieldId] || ""}
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
                                            )
                                        )}
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
                    left: `${(Number(answers[field.id]) || 0) * 10}%`, 
                    transform: 'translateX(-50%)',
                    top: '0',
                    fontWeight: 'bold', 
                    fontSize: '1.25rem', 
                    color: 'var(--primary)',
                    transition: 'left 0.2s ease-out'
                }}>{answers[field.id] || 0}</span>
            </div>
            <input 
              type="range" 
              min={field.min} 
              max={field.max} 
              step={field.step} 
              value={answers[field.id] || 0} 
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
            {['resist_flexora', 'resist_extensora', 'flexao_60', 'sorensen'].includes(field.id) && (
                <MuscleEnduranceChart 
                    fieldId={field.id}
                    currentValue={Number(answers[field.id]) || 0}
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
                        key={field.id}
                        image={field.image || ""} 
                        value={answers[field.id]} 
                        onChange={(val) => handleInputChange(field.id, val)} 
                    />
                </div>
            </div>
        );
      case 'image-upload':
        return (
          <div key={field.id} className="form-group">
            <label className="form-label">{field.label}</label>
            {renderImageUpload(field.id)}
          </div>
        );
      case 'button':
        const isQuestButton = field.id.endsWith('_novo');
        const questType = field.id.split('_')[0];
        
        // Find history for the related questionnaire (e.g. if we are in afLombar, find 'oswestry' history)
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

                {isQuestButton && (
                    <div style={{ marginTop: '0.5rem' }}>
                        <FunctionalHistoryChart 
                            history={patientAssessments.filter(h => h.assessment_type === questType && h.id !== assessmentId)} 
                            currentScore={0} 
                            type={questType}
                            isEmbedded={true}
                        />
                    </div>
                )}
            </div>
        );
      default:
        return null;
    }
  };

  const renderImageUpload = (fieldId: string, isTable: boolean = false) => {
    const value = answers[fieldId];
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            handleInputChange(fieldId, reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: isTable ? 'center' : 'flex-start' }}>
            {value ? (
                <div 
                    style={{ position: 'relative', width: isTable ? '60px' : '200px', height: isTable ? '60px' : '150px', cursor: 'zoom-in' }}
                    onClick={() => setSelectedImage(value)}
                >
                    <img 
                        src={value} 
                        alt="Upload" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} 
                    />
                    <div style={{ position: 'absolute', bottom: '4px', right: '4px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '4px', padding: '2px' }}>
                        <Maximize2 size={12} />
                    </div>
                    {isEditing && (
                        <button
                            onClick={() => handleInputChange(fieldId, "")}
                            style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            ) : (
                isEditing && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: isTable ? '0.4rem' : '0.6rem 1rem', backgroundColor: 'var(--bg-secondary)', border: '1.5px dashed var(--border)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                            {isTable ? <Camera size={16} /> : <><Camera size={18} /> <span>Foto / Galeria</span></>}
                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                )
            )}
        </div>
    );
  };

  if (isFinished) {
    const result = questionnaire.calculateScore?.(answers);
    const returnTo = searchParams.get("returnTo");

    const handleReturn = () => {
        if (returnTo) {
            // For geriatric sub-questionnaires, save to specific field key
            const geriatricMapping: Record<string, string> = {
                man: 'man_score',
                ves13: 'ves13_score',
                lbpq: 'lbpq_score',
                brief: 'brief_score',
            };
            const fieldKey = geriatricMapping[type];
            if (returnTo === 'afGeriatria' && fieldKey) {
                // Save with the specific score key
                const scoreStr = result.unit === 'média' 
                    ? `${result.interpretation}` 
                    : `${result.score} pts — ${result.interpretation}`;
                localStorage.setItem(`return_score_${patientId}_${returnTo}_${fieldKey}`, scoreStr);
                // Also set the general key without % so the parent code knows to check geriatric-specific keys
                localStorage.setItem(`return_score_${patientId}_${returnTo}`, 'geriatria');
            } else {
                localStorage.setItem(`return_score_${patientId}_${returnTo}`, String(result.percentage));
            }
            router.push(`/dashboard/assessment/${patientId}/${returnTo}`);
        }
    };

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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {returnTo && (
                <button 
                    className="btn-primary"
                    onClick={handleReturn}
                    style={{ backgroundColor: 'var(--secondary)' }}
                >
                    Retornar à Avaliação
                </button>
            )}
            <button 
                className="btn-primary"
                onClick={() => router.push(`/dashboard/patient/${patientId}`)}
            >
                {returnTo ? 'Ir para Histórico do Paciente' : 'Voltar ao Histórico'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderFullPrintView = () => {
    return (
      <div className="print-all-content" style={{ display: 'none' }}>
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

        {items.map((item, idx) => {
          const section = item as Section;
          const isActuallyClinical = !!section.fields || section.type === 'table';
          
          if (isClinical) {
            // Check if section has any answered field
            const hasData = section.fields?.some(f => answers[f.id]) || 
                           (section.type === 'table' && section.rows?.some(r => r.fields.some(f => answers[typeof f === 'string' ? f : f.id])));
            
            if (!hasData) return null;

            return (
              <div key={idx} className="print-section" style={{ marginBottom: '1.5rem', pageBreakInside: 'auto' }}>
                <div style={{ padding: '0.5rem 0' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#8B0000', borderBottom: '1px solid #eee', paddingBottom: '0.3rem' }}>
                      {section.title}
                    </h3>
                    <div style={{ marginBottom: '1.5rem' }}>
                        {section.fields?.map(field => {
                            if (['resist_flexora', 'resist_extensora', 'flexao_60', 'sorensen'].includes(field.id)) {
                                return (
                                    <div key={`print-chart-${field.id}`} className="print-chart-container">
                                        <div style={{ marginBottom: '0.5rem', fontWeight: '700' }}>{field.label}: {answers[field.id]}s</div>
                                        <MuscleEnduranceChart 
                                            fieldId={field.id}
                                            currentValue={Number(answers[field.id]) || 0}
                                            gender={patientGender}
                                            age={patientAge}
                                            history={patientAssessments}
                                            isPrint={true}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {section.type === 'table' && renderTable(section, true)}
                        {section.fields?.map(field => {
                            const isEndurance = ['resist_flexora', 'resist_extensora', 'flexao_60', 'sorensen'].includes(field.id);
                            if (!answers[field.id] && field.type !== 'bodyschema' && !isEndurance) return null;
                            if (isEndurance) return null; // Already rendered above
                            if (field.type === 'button') return null; // Don't print buttons
                            
                            return (
                                <div key={field.id} style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold', marginRight: '0.5rem' }}>{field.label}:</span>
                                    <span>{answers[field.id]}</span>
                                    {field.type === 'bodyschema' && (
                                         <div style={{ marginTop: '0.5rem', maxWidth: '400px' }}>
                                             <img src={answers[field.id]} style={{ width: '100%', border: '1px solid #eee' }} />
                                         </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
              </div>
            );
          } else {
            // Functional questionnaire
            if (answers[idx] === undefined) return null;
            return (
                <div key={idx} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>{idx + 1}. {(item as any).text}</p>
                    <p style={{ paddingLeft: '1rem', color: '#8B0000', fontWeight: '700' }}>
                        {(item as any).options?.find((o:any) => o.value === answers[idx])?.label || "Não respondido"}
                    </p>
                </div>
            );
          }
        })}

        {isFinished && (
            <div style={{ marginTop: '2rem', padding: '1rem', border: '2px solid #8B0000', borderRadius: '0.5rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Resultado da Avaliação:</h4>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#8B0000' }}>
                    {calculateAssessmentScore((questionnaire as any).structure?.calculationType || (type as CalculationType), answers).interpretation}
                </div>
            </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="background-gradient" />
      
      <Header />

      <main className="no-print" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

                {(user || assessmentOwner) && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderLeft: '1px solid var(--border)', paddingLeft: '1rem', marginLeft: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
                            <span style={{ fontWeight: '600' }}>Avaliador:</span>
                            <span style={{ color: 'var(--text)', fontWeight: '700' }}>
                                {(assessmentOwner?.name || user?.name)} 
                                {((assessmentOwner?.crefito || user?.crefito)) ? ` (CREFITO: ${assessmentOwner?.crefito || user?.crefito})` : ""}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: '600' }}>Data:</span>
                            <span style={{ color: 'var(--text)', fontWeight: '700' }}>{assessmentDate}</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)', margin: 0 }}>{questionnaire.title}</h1>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                    onClick={() => window.print()}
                    className="no-print"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: 'white', 
                        color: 'var(--secondary)',
                        border: '1px solid var(--border)', 
                        padding: '0.5rem 1rem',
                        borderRadius: '0.75rem',
                        fontWeight: '600', 
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <Printer size={16} />
                    <span>Imprimir</span>
                </button>

                {assessmentId && !isEditing && (user?.role === 'ADMINISTRADOR' || assessmentOwnerId === user?.id) && (
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
                <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '2.5rem', color: 'var(--primary)' }}>
                  {(currentItem as Section).title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {(currentItem as Section).type === 'table' && renderTable(currentItem as Section)}
                  {(currentItem as Section).fields?.map(field => renderField(field))}
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

                {['ndi', 'oswestry'].includes(type) && (
                    <FunctionalHistoryChart 
                        history={patientAssessments.filter(h => h.assessment_type === type && h.id !== assessmentId)}
                        currentScore={calculateAssessmentScore(type as CalculationType, answers).percentage}
                        type={type}
                    />
                )}
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
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                    </div>
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
      </main>

      {renderFullPrintView()}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
                style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.85)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 2000,
                    padding: '2rem'
                }}
            >
                <div style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'white', cursor: 'pointer' }}>
                    <X size={32} />
                </div>
                <motion.img 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    src={selectedImage} 
                    alt="Zoom" 
                    style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '0.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} 
                    onClick={(e) => e.stopPropagation()}
                />
            </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
            @page { margin: 1cm; }
            .no-print { display: none !important; }
            .print-all-content { display: block !important; width: 100% !important; background: white !important; color: black !important; }
            body { background: white !important; padding: 0 !important; overflow: visible !important; }
            .background-gradient { display: none !important; }
            .form-group { break-inside: avoid; margin-bottom: 1rem !important; }
            div[style*="max-width: 800px"] { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            div[style*="box-shadow"], div[style*="border: 1px solid var(--border)"] { 
                box-shadow: none !important; 
                border: none !important; 
                padding: 0 !important; 
                margin: 0 !important; 
                background: none !important;
            }
            main { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
            table { font-size: 9pt !important; width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; }
            th, td { border: 1px solid #333 !important; padding: 4px !important; word-wrap: break-word !important; }
            .btn-primary, button, .no-print-element { display: none !important; }
            img, canvas { max-width: 100% !important; height: auto !important; }
            .print-section { page-break-inside: auto; margin-bottom: 1.5rem; }
            /* Hide browser footers */
            footer, .footer, #footer { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
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
