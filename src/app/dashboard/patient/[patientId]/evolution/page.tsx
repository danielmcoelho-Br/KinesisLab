"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  TrendingUp, 
  ArrowLeft, 
  ChevronRight, 
  Calendar,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPatientAssessments } from "@/app/dashboard/actions";
import { questionnairesData } from "@/data/questionnaires";
import PatientInfoBanner from "@/components/PatientInfoBanner";

// Simple custom line chart using SVG
function SimpleChart({ data, label, color = "var(--primary)" }: { data: { date: string, value: number }[], label: string, color?: string }) {
  if (data.length < 2) return null;

  const width = 600;
  const height = 200;
  const padding = 40;
  
  const values = data.map(d => d.value);
  const min = 0; // Usually start from 0 for health data
  const max = Math.max(...values, 10) * 1.2; // Add some headroom

  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding) / (data.length - 1));
    const y = height - padding - ((d.value - min) * (height - 2 * padding) / (max - min));
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, 
  "");

  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
      <h4 style={{ fontWeight: 'bold', marginBottom: '1rem', color: 'var(--secondary)' }}>{label}</h4>
      <div style={{ overflowX: 'auto' }}>
        <svg width={width} height={height} style={{ display: 'block' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => {
             const y = padding + p * (height - 2 * padding);
             const val = Math.round(max - (p * (max - min)));
             return (
               <g key={p}>
                 <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" />
                 <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{val}</text>
               </g>
             );
          })}
          
          {/* Line */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2" />
              <text x={p.x} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#9ca3af" transform={`rotate(0, ${p.x}, ${height - padding + 20})`}>
                {new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </text>
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill={color}>{Math.round(p.value)}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default function EvolutionPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await getPatientAssessments(patientId);
      if (res.success && res.data) {
        setAssessments(res.data.assessments);
      }
      setLoading(false);
    }
    load();
  }, [patientId]);

  const typeGroups = assessments.reduce((acc: any, curr: any) => {
    if (!acc[curr.assessment_type]) acc[curr.assessment_type] = [];
    acc[curr.assessment_type].push(curr);
    return acc;
  }, {});

  const evolutionTypes = Object.keys(typeGroups).filter(type => typeGroups[type].length > 1);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Carregando dados de evolução...</div>;

  const getTypeData = (type: string) => {
    const list = [...typeGroups[type]].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const qInfo = questionnairesData[type];
    
    const charts: any[] = [];
    
    // Global Percentage Chart (for NDI, Oswestry, etc)
    if (list.every(a => a.clinical_data?.percentage !== undefined)) {
        charts.push({
            label: `Score Geral (% ) - ${qInfo?.title || type}`,
            data: list.map(a => ({ date: a.created_at, value: a.clinical_data.percentage }))
        });
    }

    // Individual Numeric Fields
    if (qInfo?.sections) {
        const numericFields: any[] = [];
        qInfo.sections.forEach(s => {
            s.fields.forEach(f => {
                if (f.type === 'number' || f.type === 'range') {
                    numericFields.push(f);
                } else if (f.type === 'select' && f.options && f.options.every(o => !isNaN(Number(o)))) {
                     numericFields.push(f);
                }
            });
        });

        numericFields.forEach(field => {
            const fieldData = list.map(a => ({ 
                date: a.created_at, 
                value: Number(a.questionnaire_answers?.[field.id]) || 0 
            }));
            
            // Only add if there's actual variation or non-zero values
            if (fieldData.some(d => d.value > 0)) {
                charts.push({ label: field.label, data: fieldData });
            }
        });
    }

    // Body Schema Comparison (last 2)
    const bodySchemaField = qInfo?.sections?.flatMap(s => s.fields).find(f => f.type === 'bodyschema');
    let lastTwoBodySchemas: any[] = [];
    if (bodySchemaField) {
        lastTwoBodySchemas = list
            .filter(a => a.questionnaire_answers?.[bodySchemaField.id])
            .slice(-2)
            .map(a => ({ date: a.created_at, image: a.questionnaire_answers[bodySchemaField.id] }));
    }

    return { charts, lastTwoBodySchemas };
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '2rem 1.5rem' }}>
      <div className="background-gradient" />
      
      <header style={{ maxWidth: '1000px', margin: '0 auto', marginBottom: '3rem' }}>
        <button 
          onClick={() => router.back()}
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
          <span>Voltar</span>
        </button>
        
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--secondary)' }}>
            Evolução Clínica
        </h1>
        <PatientInfoBanner patientId={patientId} />
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {!selectedType ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {evolutionTypes.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Não há avaliações suficientes para gerar gráficos de evolução.</p>
                    </div>
                ) : (
                    evolutionTypes.map(type => {
                        const qInfo = questionnairesData[type];
                        return (
                            <motion.div 
                                key={type}
                                whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
                                onClick={() => setSelectedType(type)}
                                style={{ 
                                    backgroundColor: 'white', 
                                    padding: '2rem', 
                                    borderRadius: '1.5rem', 
                                    border: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ backgroundColor: 'var(--primary-light)', padding: '0.75rem', borderRadius: '1rem', color: 'var(--primary)' }}>
                                        <TrendingUp size={24} />
                                    </div>
                                    <h3 style={{ fontWeight: 'bold', margin: 0 }}>{qInfo?.title || type}</h3>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {typeGroups[type].length} avaliações realizadas
                                </p>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.875rem' }}>
                                    Ver Gráficos <ChevronRight size={16} />
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <button 
                    onClick={() => setSelectedType(null)}
                    style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', width: 'fit-content', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Mudar Avaliação
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                    {getTypeData(selectedType).charts.map((chart, idx) => (
                        <SimpleChart key={idx} data={chart.data} label={chart.label} />
                    ))}
                </div>

                {getTypeData(selectedType).lastTwoBodySchemas.length === 2 && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Activity size={20} style={{ color: 'var(--primary)' }} />
                            Comparativo Visual (Últimas 2 Pinturas)
                        </h4>
                        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {getTypeData(selectedType).lastTwoBodySchemas.map((schema, idx) => (
                                <div key={idx} style={{ textAlign: 'center' }}>
                                    <p style={{ fontWeight: '600', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                        {new Date(schema.date).toLocaleDateString('pt-BR')}
                                    </p>
                                    <div style={{ position: 'relative', width: '250px', height: '320px', backgroundColor: '#f9fafb', borderRadius: '1rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                        <img 
                                            src="/img/esquema_corpo_inteiro.png" 
                                            alt="Base" 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.3 }} 
                                        />
                                        <img 
                                            src={schema.image} 
                                            alt="Pintura" 
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}
