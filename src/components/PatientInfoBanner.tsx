"use client";

import { useEffect, useState } from "react";
import { User, Calendar, Info } from "lucide-react";
import { motion } from "framer-motion";
import { getPatient } from "@/app/dashboard/actions";

interface PatientInfoBannerProps {
  patientId: string;
}

export default function PatientInfoBanner({ patientId }: PatientInfoBannerProps) {
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await getPatient(patientId);
      if (res.success) {
        setPatient(res.data);
      }
    }
    load();
  }, [patientId]);

  if (!patient) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ 
        backgroundColor: 'white', 
        padding: '1rem 1.5rem', 
        borderRadius: '1rem', 
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        marginBottom: '2rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <User size={18} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paciente</p>
          <p style={{ fontWeight: '700', margin: 0 }}>{patient.name}</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--secondary-light)', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <Calendar size={18} style={{ color: 'var(--secondary)' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Idade</p>
          <p style={{ fontWeight: '700', margin: 0 }}>{patient.age} anos</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ backgroundColor: '#fef3f2', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <Info size={18} style={{ color: '#b42318' }} />
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sexo</p>
          <p style={{ fontWeight: '700', margin: 0 }}>{patient.gender}</p>
        </div>
      </div>
    </motion.div>
  );
}
