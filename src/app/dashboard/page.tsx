"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { 
  Search, 
  UserPlus, 
  History as HistoryIcon, 
  ChevronRight, 
  LogOut,
  Home,
  X,
  Mars,
  Venus,
  Edit,
  Trash2,
  MessageCircle,
  FileText,
  CheckCircle2,
  Clock,
  Shield,
  Layout,
  User
} from "lucide-react";


import { motion, AnimatePresence } from "framer-motion";
import { getPatients, createPatient, updatePatient, deletePatient } from "./actions";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState<any[]>([]);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newName, setNewName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newGender, setNewGender] = useState("Masculino");

  const calculateAgeDetails = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months = (months + 12) % 12;
      if (today.getDate() < birthDate.getDate()) {
        months--;
        if (months < 0) months = 11;
      }
    } else if (today.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months = 11;
      }
    }
    return { years, months };
  };

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchPatients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = async (query: string = "") => {
    const result = await getPatients(query);
    if (result.success) {
      setPatients(result.data || []);
    }
    setLoading(false);
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageDetails = calculateAgeDetails(birthDate);
    const result = await createPatient({
      name: newName,
      birth_date: new Date(birthDate),
      age: ageDetails ? ageDetails.years : 0,
      gender: newGender,
      created_by_id: user?.id
    });

    if (result.success) {
      setShowNewPatientModal(false);
      setNewName("");
      setBirthDate("");
      fetchPatients(search);
      toast.success("Paciente cadastrado com sucesso!");
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageDetails = calculateAgeDetails(birthDate);
    const result = await updatePatient(editingPatient.id, {
      name: newName,
      birth_date: birthDate,
      age: ageDetails ? ageDetails.years : 0,
      gender: newGender
    }, user?.id, user?.name);

    if (result.success) {
      setEditingPatient(null);
      fetchPatients(search);
      toast.success("Cadastro atualizado com sucesso!");
    } else {
      toast.error(result.error);
    }
  };

  const handleDeletePatient = async (id: string) => {
    toast.warning("Tem certeza que deseja excluir este paciente?", {
      action: {
        label: "Sim, excluir",
        onClick: async () => {
          const result = await deletePatient(id);
          if (result.success) {
            setEditingPatient(null);
            fetchPatients(search);
            toast.success("Paciente excluído com sucesso!");
          } else {
            toast.error(result.error);
          }
        }
      }
    });
  };

  const openEditModal = (patient: any) => {
    setEditingPatient(patient);
    setNewName(patient.name);
    setBirthDate(patient.birth_date ? new Date(patient.birth_date).toISOString().split('T')[0] : "");
    setNewGender(patient.gender || "Masculino");
  };

  const shareWhatsApp = (patient: any) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/assessment/public/${patient.id}/oswestry`;
    const message = encodeURIComponent(`Olá ${patient.name}, por favor responda ao formulário de avaliação da KinesisLab: ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    toast.info("WhatsApp aberto para compartilhamento.");
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <div className="background-gradient" />
      
      {/* Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>K</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
              Kinesis<span style={{ color: 'var(--primary)' }}>Lab</span>
            </h1>
          </div>
          
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
              <Home size={18} />
              <span className="hidden-mobile">Início</span>
            </button>

            {user?.role === 'ADMINISTRADOR' && (
              <>
                <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--border)', margin: '0 0.5rem' }} />
                <button 
                  onClick={() => router.push('/dashboard/admin/users')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Shield size={18} />
                  <span className="hidden-mobile">Usuários</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/admin/assessments')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Layout size={18} />
                  <span className="hidden-mobile">Modelos</span>
                </button>
              </>
            )}

            <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--border)', margin: '0 0.5rem' }} />

            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hidden-mobile">
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text)' }}>{user.name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</span>
                </div>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '10px', 
                  backgroundColor: 'var(--primary-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '2px solid white',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} style={{ color: 'var(--primary)' }} />
                  )}
                </div>
              </div>
            )}

            <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'var(--border)', margin: '0 0.5rem' }} />


            <button 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }} 
              onClick={() => { toast.info("Até logo!"); window.location.href='/login'; }}
            >
              <LogOut size={18} />
              <span className="hidden-mobile">Sair</span>
            </button>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Selecione o Paciente</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie seus pacientes e envie avaliações remotas.</p>
        </div>

        {/* Actions Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Buscar paciente por nome..."
              className="form-input"
              style={{ paddingLeft: '3rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button 
            className="btn-primary" 
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', color: 'var(--text)', border: '1px solid var(--border)', marginTop: 0 }}
            onClick={() => setShowNewPatientModal(true)}
          >
            <UserPlus size={20} />
            Novo Paciente
          </button>
        </div>

        {/* Patient List Container */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HistoryIcon size={20} style={{ color: 'var(--primary)' }} />
            Lista de Pacientes
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Carregando pacientes...</div>
            ) : patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Nenhum paciente encontrado.</div>
            ) : (
              patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1.25rem', 
                    backgroundColor: 'white', 
                    borderRadius: 'var(--radius-lg)', 
                    border: '1px solid var(--border)', 
                    transition: 'all 0.2s'
                  }}
                  whileHover={{ borderColor: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                >
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => router.push(`/dashboard/patient/${patient.id}`)}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>{patient.name}</h4>
                      {patient.hasOswestry ? (
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> ODI Concluído
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> ODI Pendente
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                      {patient.age} anos | {patient.gender} | Cadastrado em {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(user?.role === 'ADMINISTRADOR' || patient.created_by_id === user?.id) && (
                      <button 
                        onClick={() => openEditModal(patient)}
                        style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'white', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                        title="Editar cadastro"
                      >
                        <Edit size={18} />
                      </button>
                    )}

                    <button 
                      onClick={() => shareWhatsApp(patient)}
                      style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid #25D366', backgroundColor: '#25D36610', color: '#25D366', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Enviar ODI por WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/assessment/select-segment/${patient.id}`)}
                      style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Nova Avaliação"
                    >

                      <FileText size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Patient Modal (Add/Edit) */}
      <AnimatePresence>
        {(showNewPatientModal || editingPatient) && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
              onClick={() => { setShowNewPatientModal(false); setEditingPatient(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '500px', 
                backgroundColor: 'white', 
                padding: '2.5rem', 
                borderRadius: 'var(--radius-xl)', 
                boxShadow: 'var(--shadow-lg)',
                margin: '0 auto'
              }}
            >
              <button 
                style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => { setShowNewPatientModal(false); setEditingPatient(null); }}
              >
                <X size={24} />
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  {editingPatient ? 'Editar Paciente' : 'Novo Cadastro'}
                </h3>
                {editingPatient && (
                  <button 
                    onClick={() => handleDeletePatient(editingPatient.id)}
                    style={{ color: '#EF4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}
                  >
                    <Trash2 size={16} /> Excluir
                  </button>
                )}
              </div>

              <form onSubmit={editingPatient ? handleUpdatePatient : handleCreatePatient}>
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Maria da Silva"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Data de Nascimento</label>
                    <input
                      type="date"
                      className="form-input"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                    {birthDate && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.4rem', fontWeight: 'bold' }}>
                        {(() => {
                          const details = calculateAgeDetails(birthDate);
                          return details ? `${details.years} anos e ${details.months} meses` : '';
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Sexo</label>
                    <div style={{ display: 'flex', gap: '0.5rem', height: '45px' }}>
                      <button
                        type="button"
                        onClick={() => setNewGender("Masculino")}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-lg)',
                          border: '2px solid',
                          borderColor: newGender === "Masculino" ? '#3B82F6' : '#f3f4f6',
                          backgroundColor: newGender === "Masculino" ? '#EFF6FF' : 'white',
                          color: '#3B82F6',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Mars size={24} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewGender("Feminino")}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-lg)',
                          border: '2px solid',
                          borderColor: newGender === "Feminino" ? '#EC4899' : '#f3f4f6',
                          backgroundColor: newGender === "Feminino" ? '#FDF2F8' : 'white',
                          color: '#EC4899',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Venus size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button 
                    type="button"
                    className="btn-primary"
                    style={{ backgroundColor: '#F3F4F6', color: 'var(--text)', border: 'none', flex: 1 }}
                    onClick={() => { setShowNewPatientModal(false); setEditingPatient(null); }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    {editingPatient ? 'Salvar Alterações' : 'Salvar Paciente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 640px) {
          .hidden-mobile {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
