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
  User,
  Share2,
  ExternalLink,
  AlertTriangle
} from "lucide-react";


import { motion, AnimatePresence } from "framer-motion";
import { getPatients, createPatient, updatePatient, deletePatient, findPatientByName } from "./actions";
import { toast } from "sonner";
import Header from "@/components/Header";
import ConfirmModal from "@/components/ConfirmModal";
import { questionnairesData } from "@/data/questionnaires";

// Filter functional questionnaires (those with direct questions for patients)
const functionalQuestionnaires = Object.values(questionnairesData).filter(q => q.questions && q.questions.length > 0);

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState<any[]>([]);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // WhatsApp Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPatientForShare, setSelectedPatientForShare] = useState<any>(null);

  // Deletion State
  const [patientToDelete, setPatientToDelete] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Duplicate Check State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicatePatient, setDuplicatePatient] = useState<any>(null);

  // Form state
  const [newName, setNewName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newGender, setNewGender] = useState("Masculino");
  const [newDominance, setNewDominance] = useState("Destro");
  const [newActivityLevel, setNewActivityLevel] = useState("Ativo");

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length >= 5) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setBirthDate(val);
  };

  const parseFormattedDate = (dateString: string) => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`);
  };

  const calculateAgeDetails = (dateString: string) => {
    const birthDate = parseFormattedDate(dateString);
    if (!birthDate) return null;
    const today = new Date();
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
    
    // 1. Check for duplicates before creating
    setLoading(true);
    const dupCheck = await findPatientByName(newName);
    setLoading(false);

    if (dupCheck.success && dupCheck.data) {
      setDuplicatePatient(dupCheck.data);
      setShowDuplicateModal(true);
      return;
    }

    await executeCreatePatient();
  };

  const executeCreatePatient = async () => {
    const ageDetails = calculateAgeDetails(birthDate);
    const result = await createPatient({
      name: newName,
      birth_date: parseFormattedDate(birthDate) || new Date(),
      age: ageDetails ? ageDetails.years : 0,
      gender: newGender,
      dominance: newDominance,
      activity_level: newActivityLevel,
      created_by_id: user?.id
    });

    if (result.success) {
      setShowNewPatientModal(false);
      setShowDuplicateModal(false);
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
      birth_date: parseFormattedDate(birthDate) || new Date(),
      age: ageDetails ? ageDetails.years : 0,
      gender: newGender,
      dominance: newDominance,
      activity_level: newActivityLevel
    }, user?.id, user?.name);

    if (result.success) {
      setEditingPatient(null);
      fetchPatients(search);
      toast.success("Cadastro atualizado com sucesso!");
    } else {
      toast.error(result.error);
    }
  };

  const handleDeletePatient = (patient: any) => {
    setPatientToDelete(patient);
    setIsConfirmModalOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;
    
    const id = patientToDelete.id;
    const result = await deletePatient(id);
    
    if (result.success) {
      // Optimistic update
      setPatients(prev => prev.filter(p => p.id !== id));
      toast.success("Paciente excluído com sucesso!");
      setShowNewPatientModal(false);
      setEditingPatient(null);
    } else {
      toast.error(result.error);
    }
    setPatientToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const openEditModal = (patient: any) => {
    setEditingPatient(patient);
    setNewName(patient.name);
    
    let formattedDate = "";
    if (patient.birth_date) {
        const d = new Date(patient.birth_date);
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        formattedDate = `${day}/${month}/${year}`;
    }
    setBirthDate(formattedDate);
    
    setNewGender(patient.gender || "Masculino");
    setNewDominance(patient.dominance || "Destro");
    setNewActivityLevel(patient.activity_level || "Ativo");
    setShowNewPatientModal(true);
  };

  const handleOpenShareModal = (patient: any) => {
    setSelectedPatientForShare(patient);
    setShowShareModal(true);
  };

  const executeShare = (qId: string) => {
    if (!selectedPatientForShare) return;
    
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/assessment/public/${selectedPatientForShare.id}/${qId}`;
    const qName = questionnairesData[qId]?.title || qId;
    
    const message = encodeURIComponent(`Olá ${selectedPatientForShare.name}, por favor responda ao formulário de avaliação (${qName}) da KinesisLab: ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    
    setShowShareModal(false);
    toast.success("Link gerado e WhatsApp aberto!");
  };

  return (
    <div className="dashboard-page">
      <div className="background-gradient" />
      
      <Header />

      <main className="container main-content">
        <header className="page-header">
          <h2>Selecione o Paciente</h2>
          <p>Gerencie seus pacientes e envie avaliações remotas.</p>
        </header>

        {/* Actions Bar */}
        <div className="actions-bar">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Buscar paciente por nome..."
              className="form-input search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-primary secondary-btn" 
              onClick={() => {
                setEditingPatient(null);
                setNewName("");
                setBirthDate("");
                setNewGender("Masculino");
                setNewDominance("Destro");
                setNewActivityLevel("Ativo");
                setShowNewPatientModal(true);
              }}
            >
              <UserPlus size={20} />
              <span>Novo Paciente</span>
            </button>

            {(user?.role === 'ADMINISTRADOR' || user?.role === 'admin' || user?.role === 'administrator') && (
              <button
                className="btn-primary admin-btn"
                onClick={() => router.push('/dashboard/admin')}
              >
                <Shield size={20} />
                <span>Painel Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Patient List Container */}
        <div className="list-container">
          <h3 className="list-title">
            <HistoryIcon size={20} style={{ color: 'var(--primary)' }} />
            Lista de Pacientes
          </h3>

          <div className="patient-list">
            {loading ? (
              <div className="status-message">Carregando pacientes...</div>
            ) : patients.length === 0 ? (
              <div className="status-message">Nenhum paciente encontrado.</div>
            ) : (
              patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="patient-item-wrapper"
                  whileHover={{ borderColor: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  style={{ alignItems: 'center' }}
                >
                  <div className="patient-info" onClick={() => {
                      if (user?.role === 'Secretaria') {
                        toast.info("Acesso restrito a uso clínico.");
                      } else {
                        router.push(`/dashboard/patient/${patient.id}`);
                      }
                  }}>
                    <div className="patient-header" style={{ width: '100%', flexWrap: 'nowrap' }}>
                      <h4 className="patient-name">{patient.name}</h4>
                      <div className="patient-status">
                        {patient.hasOswestry ? (
                          <span className="status-badge success">
                            <CheckCircle2 size={12} /> ODI Concluído
                          </span>
                        ) : (
                          <span className="status-badge warning">
                            <Clock size={12} /> ODI Pendente
                          </span>
                        )}
                      </div>

                      <div className="patient-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenShareModal(patient); }}
                          className="btn-action share-btn"
                          title="Compartilhar"
                        >
                          <MessageCircle size={18} />
                        </button>

                        <button 
                          onClick={(e) => { e.stopPropagation(); openEditModal(patient); }}
                          className="btn-action edit-btn"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>

                        {user?.role !== 'Secretaria' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/assessment/select-segment/${patient.id}`); }}
                            className="btn-action new-btn"
                            title="Nova Avaliação"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="patient-meta" style={{ marginTop: '0.25rem' }}>
                      {patient.age} anos | {patient.gender} | Cadastrado em {new Date(patient.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* WhatsApp Selection Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => setShowShareModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ position: 'relative', backgroundColor: '#ffffff', zIndex: 10, padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div className="modal-header">
                <h3>Compartilhar Questionário</h3>
                <button onClick={() => setShowShareModal(false)} className="close-btn">
                  <X size={20} />
                </button>
              </div>

              <p className="modal-description">
                Selecione o questionário funcional abaixo para enviar a <strong>{selectedPatientForShare?.name}</strong> via WhatsApp.
              </p>

              <div className="modal-list scrollbar">
                {functionalQuestionnaires.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => executeShare(q.id)}
                    className="modal-list-item"
                  >
                    <div className="item-info">
                      <div className="item-title">{q.title}</div>
                      <div className="item-subtitle">{q.segment.charAt(0).toUpperCase() + q.segment.slice(1)}</div>
                    </div>
                    <Share2 size={16} style={{ color: 'var(--primary)' }} />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Modal (Add/Edit) */}
      <AnimatePresence>
        {showNewPatientModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => { setShowNewPatientModal(false); setEditingPatient(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', backgroundColor: '#ffffff', zIndex: 10, padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '700px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflowY: 'auto', maxHeight: '90vh' }}
            >
              <button 
                className="close-btn absolute"
                onClick={() => { setShowNewPatientModal(false); setEditingPatient(null); }}
              >
                <X size={24} />
              </button>

              <div className="modal-header compact">
                <h3>{editingPatient ? 'Editar Paciente' : 'Novo Cadastro'}</h3>
                {editingPatient && (
                  <button 
                    onClick={() => handleDeletePatient(editingPatient)}
                    className="delete-inline-btn"
                  >
                    <Trash2 size={16} /> <span className="hide-on-mobile">Excluir</span>
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

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Data de Nascimento</label>
                    <input
                      type="text"
                      className="form-input"
                      value={birthDate}
                      onChange={handleDateChange}
                      placeholder="DD/MM/AAAA"
                      maxLength={10}
                      required
                    />
                    {birthDate && (
                      <div className="age-badge">
                        {(() => {
                          const details = calculateAgeDetails(birthDate);
                          return details ? `${details.years} anos e ${details.months} meses` : '';
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sexo</label>
                    <div className="gender-toggle">
                      <button
                        type="button"
                        onClick={() => setNewGender("Masculino")}
                        className={`gender-btn male ${newGender === "Masculino" ? "active" : ""}`}
                      >
                        <Mars size={24} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewGender("Feminino")}
                        className={`gender-btn female ${newGender === "Feminino" ? "active" : ""}`}
                      >
                        <Venus size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Dominância</label>
                    <select 
                      className="form-input" 
                      value={newDominance} 
                      onChange={(e) => setNewDominance(e.target.value)}
                    >
                      <option value="Destro">Destro</option>
                      <option value="Canhoto">Canhoto</option>
                      <option value="Ambidestro">Ambidestro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nível de Atividade</label>
                    <select 
                      className="form-input" 
                      value={newActivityLevel} 
                      onChange={(e) => setNewActivityLevel(e.target.value)}
                    >
                      <option value="Ativo">Ativo / Pratica Exercícios</option>
                      <option value="Sedentário">Sedentário</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button"
                    className="btn-primary secondary-btn flex-1"
                    onClick={() => { setShowNewPatientModal(false); setEditingPatient(null); }}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1"
                  >
                    {editingPatient ? 'Salvar Alterações' : 'Salvar Paciente'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Duplicate Patient Warning Modal */}
      <AnimatePresence>
        {showDuplicateModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
              onClick={() => setShowDuplicateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ 
                position: 'relative', 
                backgroundColor: '#ffffff', 
                zIndex: 10001, 
                padding: '2rem', 
                borderRadius: '1.5rem', 
                width: '100%', 
                maxWidth: '450px', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                textAlign: 'center'
              }}
            >
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px', 
                backgroundColor: '#FEF3C7', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                color: '#D97706'
              }}>
                <AlertTriangle size={32} />
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text)' }}>
                Paciente já existe!
              </h3>
              
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                Já existe um paciente cadastrado com o nome <strong>{newName}</strong>.<br/>
                O que você deseja fazer?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={() => router.push(`/dashboard/patient/${duplicatePatient?.id}`)} 
                  className="btn-primary"
                  style={{ backgroundColor: 'var(--secondary)', border: 'none' }}
                >
                  Ir para a ficha do paciente
                </button>
                
                <button 
                  onClick={executeCreatePatient} 
                  className="btn-primary secondary-btn"
                  style={{ border: '1px solid var(--border)' }}
                >
                  Criar mesmo assim
                </button>

                <button 
                  onClick={() => setShowDuplicateModal(false)} 
                  style={{ 
                    padding: '0.75rem', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background-color: var(--bg);
        }
        .main-content {
          padding: 2rem 1.5rem;
        }
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
          margin-top: 2rem;
        }
        .page-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          letter-spacing: -0.025em;
        }
        .actions-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .search-container {
          flex: 1;
          min-width: 300px;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-input {
          padding-left: 3rem;
        }
        .action-buttons {
          display: flex;
          gap: 1rem;
        }
        .secondary-btn {
          width: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: white;
          color: var(--text);
          border: 1px solid var(--border);
          margin-top: 0;
        }
        .admin-btn {
          width: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #FEF2F2;
          color: var(--primary);
          border: 1px solid #FECACA;
          margin-top: 0;
        }
        .list-container {
          background: white;
          padding: 2rem;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border);
        }
        .list-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .patient-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .status-message {
          text-align: center;
          padding: 3rem 0;
          color: var(--text-muted);
        }
        .patient-item-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          background-color: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .patient-info {
          flex: 1;
          cursor: pointer;
        }
        .patient-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.25rem;
          flex-wrap: wrap;
        }
        .patient-name {
          font-size: 1.125rem;
          font-weight: bold;
          margin: 0;
        }
        .status-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .status-badge.success {
          background-color: #DCFCE7;
          color: #166534;
        }
        .status-badge.warning {
          background-color: #FEF3C7;
          color: #92400E;
        }
        .patient-meta {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
        }
        .patient-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .btn-action {
          padding: 0.6rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }
        .share-btn { border-color: #25D366; background-color: #25D36610; color: #25D366; }
        .edit-btn { color: var(--text-muted); }
        .new-btn { border-color: var(--primary); background-color: var(--primary-light); color: var(--primary); }
        .delete-btn { border-color: #FEE2E2; background-color: #FEF2F2; color: #EF4444; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        :global(.modal-backdrop) {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.75) !important;
          backdrop-filter: blur(8px) !important;
          -webkit-backdrop-filter: blur(8px) !important;
          z-index: -1;
        }
        :global(.modal-content) {
          position: relative;
          background-color: #ffffff !important;
          z-index: 10000 !important;
          padding: 2rem;
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
        }
        :global(.large-modal) {
          max-width: 700px !important;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-description {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }
        .close-btn.absolute {
          position: absolute;
          right: 1.5rem;
          top: 1.5rem;
        }
        .modal-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 40vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }
        .modal-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          margin-bottom: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }
        .modal-list-item:hover {
          border-color: var(--primary);
          background-color: var(--primary-light);
        }
        .item-title { font-weight: bold; color: var(--text); }
        .item-subtitle { font-size: 0.75rem; color: var(--text-muted); }

        /* Large Modal Specifics */
        .large-modal {
          padding: 2.5rem;
        }
        .modal-header.compact {
          margin-bottom: 1.5rem;
        }
        .delete-inline-btn {
          color: #EF4444;
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          fontSize: 0.875rem;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .age-badge {
          fontSize: 0.75rem;
          color: var(--primary);
          marginTop: 0.4rem;
          fontWeight: bold;
        }
        .gender-toggle {
          display: flex;
          gap: 0.5rem;
          height: 45px;
        }
        .gender-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          border: 2px solid #f3f4f6;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gender-btn.male { color: #3B82F6; }
        .gender-btn.male.active { border-color: #3B82F6; background-color: #EFF6FF; }
        .gender-btn.female { color: #EC4899; }
        .gender-btn.female.active { border-color: #EC4899; background-color: #FDF2F8; }
        .modal-footer {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .flex-1 { flex: 1; }

        @media (max-width: 1024px) {
          .page-header h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }
          .page-header {
            margin-bottom: 2rem;
          }
          .search-container {
            min-width: 100%;
          }
          .action-buttons {
            width: 100%;
          }
          .action-buttons button {
            flex: 1;
            justify-content: center;
          }
          .list-container {
            padding: 1.5rem;
          }
          .patient-item-wrapper {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .patient-actions {
            width: 100%;
            justify-content: space-between;
          }
          .btn-action {
            flex: 1;
            display: flex;
            justify-content: center;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .modal-content {
            padding: 1.5rem !important;
          }
          .modal-footer {
            flex-direction: column-reverse;
          }
        }
      `}</style>
      <ConfirmModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeletePatient}
        title="Excluir Paciente"
        message={`Tem certeza que deseja excluir o cadastro de ${patientToDelete?.name}? Todos os dados e avaliações relacionados serão perdidos permanentemente.`}
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
      />

    </div>
  );
}
