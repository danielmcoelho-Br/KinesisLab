"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Home, 
  Shield, 
  Layout, 
  User, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
    showBackButton?: boolean;
}

export default function Header({ showBackButton = false }: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    toast.info("Até logo!");
    localStorage.removeItem("user");
    window.location.href = '/login';
  };

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      backgroundColor: 'rgba(255, 255, 255, 0.85)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.5rem',
      width: '100%'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
              onClick={() => router.push('/dashboard')}
              style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  color: 'var(--text)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-sm)'
              }}
          >
              <ChevronLeft size={18} />
              <span>Dashboard</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {user?.role === 'ADMINISTRADOR' && (
              <>
                <button 
                  onClick={() => router.push('/dashboard/admin/users')}
                  className="no-print"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Shield size={18} />
                  <span className="hidden-mobile">Usuários</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/admin/assessments')}
                  className="no-print"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
                >
                  <Layout size={18} />
                  <span className="hidden-mobile">Modelos</span>
                </button>
                <div className="no-print" style={{ width: '1px', height: '1.25rem', backgroundColor: 'var(--border)', margin: '0 0.5rem' }} />
              </>
            )}

            {user && (
              <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1rem', borderRight: '1px solid var(--border)', marginRight: '0.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>{user.role}</div>
                </div>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1rem' }}>
                  <User size={20} />
                </div>
              </div>
            )}

            <button 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }} 
              onClick={handleLogout}
              className="no-print"
            >
              <LogOut size={18} />
              <span className="hidden-mobile">Sair</span>
            </button>
          </nav>

          <div 
            onClick={() => router.push('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}
          >
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
              Kinesis<span style={{ color: 'var(--primary)' }}>Lab</span>
            </h1>
            <div style={{ position: 'relative', width: '112px', height: '92px' }}>
                <Image 
                    src="/logo-kinesis.jpg" 
                    alt="KinesisLab Logo" 
                    fill
                    style={{ objectFit: 'contain' }}
                />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hidden-mobile {
            display: none;
          }
        }
        @media print {
          .no-print {
            display: none !important;
          }
          header {
            position: relative !important;
            padding: 0 !important;
            border: none !important;
          }
        }
      `}</style>
    </header>
  );
}
