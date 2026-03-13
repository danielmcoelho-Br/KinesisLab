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
  TrendingUp
} from "lucide-react";

import { motion } from "framer-motion";
import { getPatientAssessments } from "../../actions";
import { questionnairesData } from "@/data/questionnaires";

export default function PatientHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [assessments, setAssessments] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getPatientAssessments(patientId);
      if (result.success && result.data) {
        setAssessments(result.data.assessments || []);
        setPatient(result.data.patient);
      }
      setLoading(false);
    };

    fetchData();
  }, [patientId]);

  const typeCounts = assessments.reduce((acc: any, curr: any) => {
    acc[curr.assessment_type] = (acc[curr.assessment_type] || 0) + 1;
    return acc;
  }, {});

  const hasEvolution = Object.values(typeCounts).some((count: any) => count > 1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '2rem 1.5rem' }}>
      <div className="background-gradient" />
      
      <header style={{ maxWidth: '1000px', margin: '0 auto', marginBottom: '3rem' }}>
        <button 
          onClick={() => router.push("/dashboard")}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: 'transparent', 
            border: 'none', 
            color: 'var(--text-muted)', 
            fontWeight: '600', 
            cursor: 'pointer',
            marginBottom: '2rem'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar ao Dashboard</span>
        </button>
        
        {patient && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '72px', 
                height: '72px', 
                backgroundColor: 'var(--primary)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}>
                <User size={40} />
              </div>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text)' }}>
                  {patient.name}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                  {patient.age} anos | {patient.gender} | ID: {patient.id.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              {hasEvolution && (
                <button 
                  className="btn-primary"
                  style={{ 
                    width: 'auto', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    backgroundColor: 'white',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)'
                  }}
                  onClick={() => router.push(`/dashboard/patient/${patientId}/evolution`)}
                >
                  <TrendingUp size={20} />
                  Evolução
                </button>
              )}
              <button 
                className="btn-primary"
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => router.push(`/dashboard/assessment/select-segment/${patientId}`)}
              >
                <Plus size={20} />
                Nova Avaliação
              </button>
            </div>
          </div>
        )}
      </header>


      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <History size={24} style={{ color: 'var(--primary)' }} />
            Histórico de Avaliações
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Carregando histórico...</div>
            ) : assessments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--border)' }}>
                  <ClipboardList size={48} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Este paciente ainda não possui avaliações registradas.</p>
                <button 
                  className="btn-primary" 
                  style={{ width: 'auto', marginTop: '1.5rem', backgroundColor: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}
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
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '1.5rem', 
                      backgroundColor: 'white', 
                      borderRadius: 'var(--radius-lg)', 
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    whileHover={{ borderColor: 'var(--primary)', x: 5, boxShadow: 'var(--shadow-md)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'var(--bg)', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)'
                      }}>
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>
                          {qInfo?.title || item.assessment_type}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={14} /> {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            Score: {item.clinical_data?.percentage || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right', marginRight: '1rem' }}>
                         <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>
                           {item.clinical_data?.interpretation || "N/A"}
                         </div>
                      </div>
                      <ChevronRight size={20} style={{ color: 'var(--border)' }} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
