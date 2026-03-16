"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { questionnairesData } from "@/data/questionnaires";
import { segments } from "@/data/segments";
import PatientInfoBanner from "@/components/PatientInfoBanner";
import Header from "@/components/Header";

export default function SelectTypePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const segmentId = params.segment as string;

  const segment = segments.find(s => s.id === segmentId);

  // Filter questionnaires by segment
  const availableQuestionnaires = Object.entries(questionnairesData)
    .filter(([_, q]) => q.segment === segmentId)
    .map(([qId, q]) => ({ qId, ...q }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="background-gradient" />
      
      <Header showBackButton />

      <header style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)', margin: 0 }}>Protocolos: {segment?.title}</h1>
            </div>
        </div>

        <PatientInfoBanner patientId={patientId} />

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Selecione a Avaliação
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
            Escolha o questionário a ser preenchido pelo paciente ou profissional.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {availableQuestionnaires.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Nenhum questionário disponível para este segmento ainda.</p>
            </div>
          ) : (
            availableQuestionnaires.map((q, index) => (
              <motion.div
                key={q.qId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/dashboard/assessment/${patientId}/${q.qId}`)}
                style={{ 
                  backgroundColor: 'white', 
                  padding: '1.5rem 2rem', 
                  borderRadius: '1.25rem', 
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                  scale: 1.01,
                  borderColor: 'var(--primary)',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: '#fdfdfd'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: 'var(--primary-light)', 
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    {q.icon ? (
                       <div dangerouslySetInnerHTML={{ __html: q.icon }} style={{ width: '24px', height: '24px' }} />
                    ) : (
                       <ChevronRight size={24} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--text)', margin: 0 }}>{q.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>{q.description}</p>
                  </div>
                </div>
                <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
