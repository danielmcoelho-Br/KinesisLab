"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Users, 
    UserPlus, 
    Search, 
    Edit, 
    Trash2, 
    Shield, 
    Check, 
    X, 
    Key, 
    RefreshCw,
    ArrowLeft,
    Mail,
    Calendar,
    Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUsers, createUser, updateUser } from "./actions";
import { toast } from "sonner";

export default function UsersAdminPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "ASSISTENTE",
        birth_date: "",
        password: "",
        crefito: "",
        avatar_url: "",
        is_active: true,
        force_password_change: false
    });

    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await getUsers();
        if (res.success) setUsers(res.data || []);
        setLoading(false);
    };

    const handleOpenModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : "",
                password: "", // Don't show password
                crefito: user.crefito || "",
                avatar_url: user.avatar_url || "",
                is_active: user.is_active,
                force_password_change: user.force_password_change
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: "",
                email: "",
                role: "ASSISTENTE",
                birth_date: "",
                password: "",
                crefito: "",
                avatar_url: "",
                is_active: true,
                force_password_change: false
            });
        }
        setShowModal(true);
    };

    const generatePassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let retVal = "";
        for (let i = 0, n = charset.length; i < 10; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setFormData({ ...formData, password: retVal, force_password_change: true });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            const res = await updateUser(editingUser.id, formData, "Administrador");
            if (res.success) {
                toast.success("Usuário atualizado!");
                setShowModal(false);
                fetchUsers();
            } else {
                toast.error(res.error);
            }
        } else {
            if (!formData.password) {
                toast.error("Senha obrigatória para novo usuário");
                return;
            }
            const res = await createUser(formData);
            if (res.success) {
                toast.success("Usuário criado!");
                setShowModal(false);
                fetchUsers();
            } else {
                toast.error(res.error);
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '2rem' }}>
            <header style={{ maxWidth: '1100px', margin: '0 auto', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button onClick={() => router.push('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <ArrowLeft size={20} /> Voltar ao Dashboard
                    </button>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hidden-mobile">
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{user.name}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Administrador</span>
                            </div>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>A</div>}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gerenciamento de Usuários</h1>
                    <button className="btn-primary" style={{ width: 'auto' }} onClick={() => handleOpenModal()}>
                        <UserPlus size={20} style={{ marginRight: '0.5rem' }} /> Novo Usuário
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou email..." 
                        className="form-input" 
                        style={{ paddingLeft: '3rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {loading ? (
                        <p>Carregando...</p>
                    ) : filteredUsers.map(user => (
                        <motion.div 
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ 
                                backgroundColor: 'white', 
                                padding: '1.5rem', 
                                borderRadius: '1rem', 
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'var(--primary-light)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    overflow: 'hidden'
                                }}>
                                    {user.avatar_url ? <img src={user.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.name[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontWeight: 'bold' }}>{user.name}</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
                                    {user.crefito && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>CREFITO: {user.crefito}</p>}
                                </div>
                                <div style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '0.5rem', 
                                    fontSize: '0.7rem', 
                                    fontWeight: 'bold',
                                    backgroundColor: user.role === 'ADMINISTRADOR' ? '#FEE2E2' : user.role === 'FISIOTERAPEUTA' ? '#DBEAFE' : '#F3F4F6',
                                    color: user.role === 'ADMINISTRADOR' ? '#991B1B' : user.role === 'FISIOTERAPEUTA' ? '#1E40AF' : '#374151'
                                }}>
                                    {user.role}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {user.is_active ? <Check size={16} color="green" /> : <X size={16} color="red" />} {user.is_active ? 'Ativo' : 'Inativo'}
                                </div>
                                {user.force_password_change && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#B45309' }}>
                                        <Key size={16} /> Troca de senha pendente
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-primary" style={{ flex: 1, backgroundColor: 'white', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '0.85rem' }} onClick={() => handleOpenModal(user)}>
                                    <Edit size={16} style={{ marginRight: '0.25rem' }} /> Editar
                                </button>
                                <button className="btn-primary" style={{ flex: 1, backgroundColor: 'white', color: '#EF4444', border: '1px solid #FEE2E2', fontSize: '0.85rem' }}>
                                    <Trash2 size={16} style={{ marginRight: '0.25rem' }} /> Remover
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            <AnimatePresence>
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Nome Completo</label>
                                    <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">E-mail</label>
                                    <input type="email" className="form-input" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Função</label>
                                        <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                            <option value="ADMINISTRADOR">Administrador</option>
                                            <option value="FISIOTERAPEUTA">Fisioterapeuta</option>
                                            <option value="ASSISTENTE">Assistente</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Data Nasc. (Opcional)</label>
                                        <input type="date" className="form-input" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                    </div>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">CREFITO</label>
                                        <input type="text" className="form-input" value={formData.crefito} onChange={e => setFormData({...formData, crefito: e.target.value})} placeholder="Ex: 12345-F" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Senha {editingUser ? '(vazio p/ manter)' : ''}</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input type="text" className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                            <button type="button" onClick={generatePassword} style={{ padding: '0 0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                                <RefreshCw size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Usuário Ativo
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={formData.force_password_change} onChange={e => setFormData({...formData, force_password_change: e.target.checked})} /> Forçar troca de senha
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-primary" style={{ backgroundColor: '#F3F4F6', color: 'var(--text)', border: 'none' }} onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary">Salvar</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
