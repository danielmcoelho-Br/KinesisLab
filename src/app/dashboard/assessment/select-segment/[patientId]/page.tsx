"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { segments } from "@/data/segments";
import PatientInfoBanner from "@/components/PatientInfoBanner";

export default function SelectSegmentPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '2rem 1.5rem' }}>
      <div className="background-gradient" />
      
      <header style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <button 
                onClick={() => router.back()}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    backgroundColor: 'white', 
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
                <span>Voltar</span>
            </button>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)', margin: 0 }}>Nova Avaliação</h1>
            </div>
            <div style={{ width: '80px' }} />
        </div>

        <PatientInfoBanner patientId={patientId} />
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text)' }}>
            Onde está o foco da avaliação?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
            Selecione a região do corpo para ver os protocolos recomendados.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {segments.map((segment, index) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => router.push(`/dashboard/assessment/select-type/${patientId}/${segment.id}`)}
              style={{ 
                backgroundColor: 'white', 
                padding: '2rem', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '1.25rem'
              }}
              whileHover={{ 
                y: -5, 
                borderColor: 'var(--primary)', 
                boxShadow: 'var(--shadow-lg)' 
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px'
              }}>
                <img 
                  src={segment.icon} 
                  alt={segment.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>
                  {segment.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.5' }}>
                  {segment.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
