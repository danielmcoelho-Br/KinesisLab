"use client";

import { useEffect, useRef, useState } from "react";
import { Undo, Trash2, Copy, ImagePlus, RotateCcw, Target, Download } from "lucide-react";
import { toast } from "sonner";

interface Point {
    x: number;
    y: number;
}

interface Measurement {
    id: string;
    points: Point[];
    angle: number | null;
    color: string;
}

interface AngleMeasurementProps {
    value?: string;
    onChange: (value: string) => void;
}

export default function AngleMeasurement({ value, onChange }: AngleMeasurementProps) {
    const [image, setImage] = useState<string | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load - only set if we don't have an image loaded already
    useEffect(() => {
        if (value && value.startsWith("data:image") && !image) {
            setImage(value);
        }
    }, [value, image]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
            setMeasurements([]);
            setCurrentPoints([]);
            setTimeout(() => {
                if (canvasRef.current) {
                    onChange(canvasRef.current.toDataURL());
                }
            }, 100);
        };
        reader.readAsDataURL(file);
        
        // Reset the input value so the same file can be uploaded again if needed
        e.target.value = '';
    };

    const calculateAngleValue = (pts: Point[]): number => {
        const [p1, p2, p3] = pts;
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

        const dotProduct = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        const cosTheta = dotProduct / (mag1 * mag2);
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
        const angleDeg = (angleRad * 180) / Math.PI;

        return Math.round(angleDeg * 10) / 10;
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!image) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newPoints = [...currentPoints, { x, y }];
        setCurrentPoints(newPoints);

        if (newPoints.length === 3) {
            const angle = calculateAngleValue(newPoints);
            const isRed = measurements.length % 2 === 0;
            setMeasurements(prev => [...prev, {
                id: Date.now().toString(),
                points: newPoints,
                angle: angle,
                color: isRed ? "#ff0000" : "#ff8c00" // Red or dark orange
            }]);
            setCurrentPoints([]);
        }
    };

    const handleUndo = () => {
        if (currentPoints.length > 0) {
            // Remove last point from current unfinished angle
            setCurrentPoints(prev => prev.slice(0, -1));
        } else if (measurements.length > 0) {
            // Open up the last finished angle and remove its third point
            const lastMeasurement = measurements[measurements.length - 1];
            setMeasurements(prev => prev.slice(0, -1));
            // Keep the first two points
            setCurrentPoints([lastMeasurement.points[0], lastMeasurement.points[1]]);
        }
    };

    const handleClearMeasurements = () => {
        if (measurements.length === 0 && currentPoints.length === 0) return;
        if (window.confirm("Limpar apenas as medidas e manter a imagem?")) {
            setMeasurements([]);
            setCurrentPoints([]);
        }
    };

    const handleClearImage = () => {
        if (window.confirm("Deseja realmente limpar a imagem e todas as medidas?")) {
            setImage(null);
            setMeasurements([]);
            setCurrentPoints([]);
            onChange("");
        }
    };

    const handleCopy = async () => {
        if (!canvasRef.current) return;
        try {
            canvasRef.current.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    toast.success("Imagem copiada para a área de transferência!");
                }
            }, 'image/png');
        } catch (error) {
            toast.error("Erro ao copiar imagem. Verifique as permissões do navegador.");
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `analise_angular_${new Date().getTime()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download iniciado!");
    };

    useEffect(() => {
        if (!canvasRef.current || !image) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const scaleX = img.width / canvas.clientWidth;
            const scaleY = img.height / canvas.clientHeight;
            const avgScale = (scaleX + scaleY) / 2;

            const drawMeasurement = (mPts: Point[], mAngle: number | null, color: string, isActive: boolean) => {
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = Math.max(3, 4 * avgScale);

                mPts.forEach((p, i) => {
                    ctx.beginPath();
                    ctx.arc(p.x * scaleX, p.y * scaleY, 6 * avgScale, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.lineWidth = Math.max(3, 4 * avgScale);
                    ctx.strokeStyle = color;
                });

                if (mPts.length >= 2) {
                    ctx.beginPath();
                    ctx.moveTo(mPts[0].x * scaleX, mPts[0].y * scaleY);
                    ctx.lineTo(mPts[1].x * scaleX, mPts[1].y * scaleY);
                    ctx.stroke();
                }

                if (mPts.length === 3) {
                    ctx.beginPath();
                    ctx.moveTo(mPts[1].x * scaleX, mPts[1].y * scaleY);
                    ctx.lineTo(mPts[2].x * scaleX, mPts[2].y * scaleY);
                    ctx.stroke();

                    if (mAngle !== null) {
                        const vertex = { x: mPts[1].x * scaleX, y: mPts[1].y * scaleY };

                        const v1 = { x: (mPts[0].x * scaleX) - vertex.x, y: (mPts[0].y * scaleY) - vertex.y };
                        const v2 = { x: (mPts[2].x * scaleX) - vertex.x, y: (mPts[2].y * scaleY) - vertex.y };

                        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y) || 1;
                        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y) || 1;

                        const norm1 = { x: v1.x / mag1, y: v1.y / mag1 };
                        const norm2 = { x: v2.x / mag2, y: v2.y / mag2 };

                        let bx = -(norm1.x + norm2.x);
                        let by = -(norm1.y + norm2.y);

                        const bmag = Math.sqrt(bx * bx + by * by);
                        if (bmag > 0) {
                            bx /= bmag;
                            by /= bmag;
                        } else {
                            bx = -norm1.y;
                            by = norm1.x;
                        }

                        const dist = Math.max(50, 60 * avgScale);
                        const textX = vertex.x + bx * dist;
                        const textY = vertex.y + by * dist;

                        const text = `${mAngle}°`;
                        ctx.font = `bold ${Math.max(10, 16 * avgScale)}px Arial`;
                        
                        const textMetrics = ctx.measureText(text);
                        const textWidth = textMetrics.width;
                        const textHeight = Math.max(10, 16 * avgScale);
                        
                        const paddingX = 8 * avgScale;
                        const paddingY = 6 * avgScale;

                        ctx.fillStyle = "rgba(0,0,0,0.75)";
                        ctx.beginPath();
                        ctx.roundRect(
                            textX - (textWidth / 2) - paddingX, 
                            textY - (textHeight / 2) - paddingY, 
                            textWidth + (paddingX * 2), 
                            textHeight + (paddingY * 2), 
                            8 * avgScale
                        );
                        ctx.fill();

                        ctx.fillStyle = "#ffffff";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(text, textX, textY);
                    }
                }
            };

            measurements.forEach((m) => drawMeasurement(m.points, m.angle, m.color, false));

            if (currentPoints.length > 0) {
                drawMeasurement(currentPoints, null, "#3b82f6", true);
            }

            if (currentPoints.length === 0) {
                setTimeout(() => {
                    onChange(canvas.toDataURL());
                }, 0);
            }
        };
        img.src = image;
    }, [image, measurements, currentPoints, onChange]);

    return (
        <div className="am-container" ref={containerRef}>
            {/* Toolbar Area */}
            <div className="am-toolbar">
                <div className="am-toolbar-left">
                    <label className="am-btn am-btn-primary" title="Carregar Nova Imagem">
                        <ImagePlus size={20} />
                        <span className="am-btn-text">Novo</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>

                    <button
                        onClick={handleUndo}
                        className="am-btn am-btn-outline"
                        title="Desfazer último ponto ou medição"
                        disabled={currentPoints.length === 0 && measurements.length === 0}
                    >
                        <Undo size={20} />
                        <span className="am-btn-text">Desfazer</span>
                    </button>

                    <button
                        onClick={handleClearMeasurements}
                        className="am-btn am-btn-outline"
                        title="Limpar apenas as medidas"
                        disabled={currentPoints.length === 0 && measurements.length === 0}
                    >
                        <RotateCcw size={20} />
                        <span className="am-btn-text">Limpar</span>
                    </button>

                    <button
                        onClick={handleClearImage}
                        className="am-btn am-btn-danger"
                        title="Remover imagem e medidas"
                        disabled={!image}
                    >
                        <Trash2 size={20} />
                        <span className="am-btn-text">Apagar</span>
                    </button>
                </div>

                <div className="am-toolbar-right">
                    <button
                        onClick={handleCopy}
                        className="am-btn am-btn-primary"
                        title="Copiar imagem"
                        disabled={!image}
                    >
                        <Copy size={20} />
                        <span className="am-btn-text">Copiar</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        className="am-btn am-btn-primary"
                        title="Baixar imagem"
                        disabled={!image}
                    >
                        <Download size={20} />
                        <span className="am-btn-text">Baixar</span>
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            {!image ? (
                <div className="am-empty-state">
                    <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Comece fazendo o upload de uma imagem</p>
                    <label className="am-btn am-btn-primary" style={{ marginTop: '1rem' }}>
                        <ImagePlus size={20} />
                        <span>Ver Imagens do Computador</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </label>
                </div>
            ) : (
                <div className="am-canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        onClick={handleClick}
                        className="am-canvas"
                    />
                </div>
            )}
            
            <style jsx>{`
                .am-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    width: 100%;
                    font-family: inherit;
                }
                
                .am-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    background-color: var(--bg-secondary, #f8fafc);
                    padding: 1rem;
                    border-radius: 1rem;
                    border: 1px solid var(--border, #e2e8f0);
                    gap: 1rem;
                }
                
                .am-toolbar-left, .am-toolbar-right {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .am-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                    white-space: nowrap;
                }

                .am-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                /* Match the "btn-finish" style completely */
                .am-btn-primary {
                    background-color: var(--primary, #2563eb);
                    color: white;
                    border: 2px solid var(--primary, #2563eb);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                
                .am-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    filter: brightness(1.1);
                }
                
                .am-btn-outline {
                    background-color: white;
                    color: var(--secondary, #334155);
                    border: 2px solid var(--border, #e2e8f0);
                }
                
                .am-btn-outline:hover:not(:disabled) {
                    background-color: var(--bg-secondary, #f8fafc);
                    border-color: #cbd5e1;
                }
                
                .am-btn-danger {
                    background-color: white;
                    color: #dc2626;
                    border: 2px solid #fecaca;
                }
                
                .am-btn-danger:hover:not(:disabled) {
                    background-color: #fef2f2;
                    border-color: #f87171;
                }

                .am-empty-state {
                    border: 2px dashed var(--border, #e2e8f0);
                    border-radius: 1.5rem;
                    height: 18rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--bg-secondary, #f8fafc);
                }

                .am-canvas-wrapper {
                    position: relative;
                    border-radius: 1.5rem;
                    overflow: hidden;
                    border: 2px solid var(--border, #e2e8f0);
                    background-color: #e2e8f0;
                    display: flex;
                    justify-content: center;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    cursor: crosshair;
                }

                .am-canvas {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    max-height: 75vh;
                    object-fit: contain;
                }

                @media (max-width: 768px) {
                    .am-btn-text {
                        display: none;
                    }
                    .am-btn {
                        padding: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
}
