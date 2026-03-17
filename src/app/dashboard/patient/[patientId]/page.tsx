"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  ClipboardList, 
  Activity, 
  ChevronRight,
  User,
  History,
  TrendingUp,
  Trash2
} from "lucide-react";

import { motion } from "framer-motion";
import { getPatientAssessments, deleteAssessment } from "../../actions";
import { questionnairesData } from "@/data/questionnaires";
import Header from "@/components/Header";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [assessments, setAssessments] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Deletion State
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const result = await getPatientAssessments(patientId);
    if (result.success && result.data) {
      setAssessments(result.data.assessments || []);
      setPatient(result.data.patient);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const handleDeleteAssessment = (e: React.MouseEvent, assessment: any) => {
    e.stopPropagation();
    setAssessmentToDelete(assessment);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteAssessment = async () => {
    if (!assessmentToDelete) return;
    
    const id = assessmentToDelete.id;
    const result = await deleteAssessment(id);
    
    if (result.success) {
      setAssessments(prev => prev.filter(p => p.id !== id));
      toast.success("Avaliação excluída com sucesso!");
    } else {
      toast.error(result.error);
    }
    setAssessmentToDelete(null);
  };

  const typeCounts = assessments.reduce((acc: any, curr: any) => {
    acc[curr.assessment_type] = (acc[curr.assessment_type] || 0) + 1;
    return acc;
  }, {});

  const hasEvolution = Object.values(typeCounts).some((count: any) => count > 1);

  return (
    <div className="patient-history-page">
      <div className="background-gradient" />
      
      <Header showBackButton />

      <header className="container patient-header-section">
        {patient && (
          <div className="header-content stack-on-mobile">
            <div className="patient-main-info">
              <div className="avatar-wrapper">
                <User size={40} />
              </div>
              <div className="text-info text-center-mobile">
                <h1>{patient.name}</h1>
                <p>{patient.age} anos | {patient.gender} | ID: {patient.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <div className="header-actions">
              {hasEvolution && (
                <button 
                  className="btn-primary secondary-btn"
                  onClick={() => router.push(`/dashboard/patient/${patientId}/evolution`)}
                >
                  <TrendingUp size={20} />
                  <span>Evolução</span>
                </button>
              )}
              <button 
                className="btn-primary"
                onClick={() => router.push(`/dashboard/assessment/select-segment/${patientId}`)}
              >
                <Plus size={20} />
                <span>Nova Avaliação</span>
              </button>
            </div>
          </div>
        )}
      </header>


      <main className="container main-content">
        <div className="history-container">
          <h3 className="history-title">
            <History size={24} style={{ color: 'var(--primary)' }} />
            Histórico de Avaliações
          </h3>

          <div className="assessment-list">
            {loading ? (
              <div className="status-message">Carregando histórico...</div>
            ) : assessments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <ClipboardList size={48} />
                </div>
                <p>Este paciente ainda não possui avaliações registradas.</p>
                <button 
                  className="btn-primary secondary-btn flex-none" 
                  onClick={() => router.push(`/dashboard/assessment/select-segment/${patientId}`)}
                >
                  Iniciar Primeira Avaliação
                </button>
              </div>
            ) : (
              assessments.map((item, index) => {
                const qInfo = questionnairesData[item.assessment_type];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/dashboard/assessment/${patientId}/${item.assessment_type}?id=${item.id}`)}
                    className="assessment-item-wrapper"
                    whileHover={{ borderColor: 'var(--primary)', x: 5, boxShadow: 'var(--shadow-md)' }}
                  >
                    <div className="assessment-info">
                      <div className="assessment-icon">
                        <Activity size={24} />
                      </div>
                      <div className="assessment-text">
                        <h4>{qInfo?.title || item.assessment_type}</h4>
                        <div className="assessment-meta">
                          <span>
                            <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="hide-on-mobile">
                            <User size={14} /> {item.created_by?.name || "N/A"}
                          </span>

                          <span className="score-badge">
                            Score: {item.clinical_data?.percentage || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="assessment-actions">
                      <div className="interpretation hide-on-mobile">
                        {item.clinical_data?.interpretation || "N/A"}
                      </div>
                      <button 
                        onClick={(e) => handleDeleteAssessment(e, item)}
                        className="delete-btn"
                      >
                        <Trash2 size={20} />
                      </button>
                      <ChevronRight size={20} className="chevron hide-on-mobile" />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .patient-history-page {
          min-height: 100vh;
          background-color: var(--bg);
        }
        .patient-header-section {
          padding: 2rem 1.5rem;
          margin-bottom: 1rem;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .patient-main-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .avatar-wrapper {
          width: 72px;
          height: 72px;
          background-color: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-md);
          flex-shrink: 0;
        }
        .text-info h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0;
          color: var(--text);
        }
        .text-info p {
          color: var(--text-muted);
          font-size: 1.125rem;
          margin: 0;
        }
        .header-actions {
          display: flex;
          gap: 1rem;
        }
        .secondary-btn {
          width: auto;
          background-color: white;
          color: var(--primary);
          border: 1px solid var(--primary);
        }
        .main-content {
          padding-bottom: 3rem;
        }
        .history-container {
          background-color: white;
          padding: 2.5rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .history-title {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .assessment-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .status-message {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }
        .empty-state {
          text-align: center;
          padding: 4rem;
          background-color: #f9fafb;
          border-radius: var(--radius-lg);
          border: 1px dashed var(--border);
        }
        .empty-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          color: var(--border);
        }
        .empty-state p {
          color: var(--text-muted);
          font-size: 1.125rem;
        }
        .flex-none { width: auto !important; }

        .assessment-item-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          transition: all 0.2s;
          cursor: pointer;
        }
        .assessment-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex: 1;
        }
        .assessment-icon {
          width: 48px;
          height: 48px;
          background-color: var(--bg);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }
        .assessment-text h4 {
          font-size: 1.125rem;
          font-weight: bold;
          margin: 0 0 0.25rem 0;
        }
        .assessment-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: var(--text-muted);
          font-size: 0.875rem;
          flex-wrap: wrap;
        }
        .assessment-meta span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .score-badge {
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
        .assessment-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .interpretation {
          font-weight: bold;
          color: var(--text);
          text-align: right;
        }
        .delete-btn {
          padding: 0.5rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #EF4444;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chevron { color: var(--border); }

        @media (max-width: 768px) {
          .patient-header-section {
            padding: 1.5rem 1rem;
          }
          .patient-main-info {
            flex-direction: column;
            width: 100%;
            gap: 1rem;
          }
          .header-actions {
            width: 100%;
          }
          .header-actions button {
            flex: 1;
            justify-content: center;
          }
          .history-container {
            padding: 1.5rem;
          }
          .assessment-item-wrapper {
            padding: 1rem;
          }
          .assessment-info {
            gap: 1rem;
          }
          .assessment-icon {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteAssessment}
        title="Excluir Avaliação"
        message="Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita e os dados serão removidos permanentemente."
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
