"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    X, 
    Undo, 
    Trash2, 
    Copy, 
    Download,
    Grid, 
    MousePointer2, 
    Paintbrush, 
    Type, 
    Move, 
    Square, 
    Minus,
    Maximize2,
    RotateCcw,
    Palette,
    Check,
    Eraser
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import './PosturalAnalysisModal.css';

interface Point {
    x: number;
    y: number;
}

interface Line {
    start: Point;
    end: Point;
    color: string;
}

interface AnglePoint {
    points: Point[]; // 3 points for an angle
    color: string;
    angle: number | null;
}

type Tool = 'select' | 'brush' | 'line' | 'angle_points' | 'angle_lines' | 'eraser';

interface PosturalAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    onSave: (processedImage: string) => void;
}

export default function PosturalAnalysisModal({ isOpen, onClose, imageSrc, onSave }: PosturalAnalysisModalProps) {
    const [activeTool, setActiveTool] = useState<Tool>('brush');
    const [color, setColor] = useState('#ff0000');
    const [showGrid, setShowGrid] = useState(true);
    const [gridSize, setGridSize] = useState(40);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc);
    
    // States for shapes
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
    const [currentLine, setCurrentLine] = useState<Line | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mainCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'];

    useEffect(() => {
        setCurrentImageSrc(imageSrc);
    }, [imageSrc]);

    // Initialize Canvas
    useEffect(() => {
        if (!isOpen || !currentImageSrc) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        mainCtxRef.current = ctx;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = currentImageSrc;
        img.onload = () => {
            imageRef.current = img;
            const containerWidth = window.innerWidth * 0.85;
            const containerHeight = window.innerHeight * 0.55;
            
            let width = img.width;
            let height = img.height;
            const ratio = width / height;
            
            if (width > containerWidth) {
                width = containerWidth;
                height = width / ratio;
            }
            if (height > containerHeight) {
                height = containerHeight;
                width = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            setHistory([canvas.toDataURL()]);
        };
    }, [isOpen, currentImageSrc]);

    const saveToHistory = useCallback(() => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL();
        setHistory(prev => [...prev, dataUrl].slice(-20));
    }, []);

    const handleUndo = () => {
        if (history.length <= 1) return;
        const newHistory = history.slice(0, -1);
        const lastState = newHistory[newHistory.length - 1];
        const img = new Image();
        img.src = lastState;
        img.onload = () => {
            const ctx = mainCtxRef.current;
            if (ctx && canvasRef.current) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, 0, 0);
                setHistory(newHistory);
            }
        };
    };

    const getCoord = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!currentImageSrc) return;
        const coord = getCoord(e);
        const ctx = mainCtxRef.current;
        if (!ctx) return;

        saveToHistory();

        if (activeTool === 'brush' || activeTool === 'eraser') {
            setIsDrawing(true);
            ctx.beginPath();
            ctx.moveTo(coord.x, coord.y);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = activeTool === 'eraser' ? 24 : 4;
            ctx.strokeStyle = activeTool === 'eraser' ? 'transparent' : color;
            
            if (activeTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }
        } else if (activeTool === 'line') {
            setIsDrawing(true);
            setCurrentLine({ start: coord, end: coord, color: color });
        } else if (activeTool === 'angle_points') {
            const newPoints = [...currentPoints, coord];
            if (newPoints.length === 3) {
                drawPointsAndAngle(ctx, newPoints, color);
                setCurrentPoints([]);
                saveToHistory();
            } else {
                setCurrentPoints(newPoints);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(coord.x, coord.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const coord = getCoord(e);
        const ctx = mainCtxRef.current;
        if (!ctx) return;

        if (activeTool === 'brush' || activeTool === 'eraser') {
            ctx.lineTo(coord.x, coord.y);
            ctx.stroke();
        }
    };

    const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const coord = getCoord(e);
        const ctx = mainCtxRef.current;
        
        if (activeTool === 'line' && ctx && currentLine) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.moveTo(currentLine.start.x, currentLine.start.y);
            ctx.lineTo(coord.x, coord.y);
            ctx.stroke();
            setCurrentLine(null);
            saveToHistory();
        }
        
        setIsDrawing(false);
        if (ctx) ctx.globalCompositeOperation = 'source-over';
    };

    const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * (180 / Math.PI);
        return Math.round(angle * 10) / 10;
    };

    const drawPointsAndAngle = (ctx: CanvasRenderingContext2D, pts: Point[], color: string) => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        pts.forEach((p, idx) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
            if (idx > 0) {
                ctx.beginPath();
                ctx.moveTo(pts[idx-1].x, pts[idx-1].y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        });
        if (pts.length === 3) {
            const angle = calculateAngle(pts[0], pts[1], pts[2]);
            const vertex = pts[1];
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.strokeText(`${angle}°`, vertex.x + 15, vertex.y - 15);
            ctx.fillText(`${angle}°`, vertex.x + 15, vertex.y - 15);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setCurrentImageSrc(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!canvasRef.current || !currentImageSrc) return;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasRef.current.width;
        tempCanvas.height = canvasRef.current.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            if (imageRef.current) tempCtx.drawImage(imageRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvasRef.current, 0, 0);
            if (showGrid) {
                tempCtx.strokeStyle = 'rgba(0, 162, 255, 0.4)';
                tempCtx.lineWidth = 1;
                for (let x = gridSize; x < tempCanvas.width; x += gridSize) {
                    tempCtx.beginPath(); tempCtx.moveTo(x, 0); tempCtx.lineTo(x, tempCanvas.height); tempCtx.stroke();
                }
                for (let y = gridSize; y < tempCanvas.height; y += gridSize) {
                    tempCtx.beginPath(); tempCtx.moveTo(0, y); tempCtx.lineTo(tempCanvas.width, y); tempCtx.stroke();
                }
                tempCtx.strokeStyle = 'rgba(0, 162, 255, 0.8)';
                tempCtx.lineWidth = 2;
                tempCtx.beginPath(); tempCtx.moveTo(tempCanvas.width / 2, 0); tempCtx.lineTo(tempCanvas.width / 2, tempCanvas.height); tempCtx.stroke();
                tempCtx.beginPath(); tempCtx.moveTo(0, tempCanvas.height / 2); tempCtx.lineTo(tempCanvas.width, tempCanvas.height / 2); tempCtx.stroke();
            }
            onSave(tempCanvas.toDataURL('image/png'));
            onClose();
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = `analise-postural-${Date.now()}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
    };

    const handleCopy = async () => {
        if (!canvasRef.current) return;
        try {
            canvasRef.current.toBlob(async (blob) => {
                if (blob) {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    toast.success("Imagem copiada!");
                }
            });
        } catch (err) { toast.error("Erro ao copiar"); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="postural-modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 30 }}
                        className="postural-modal-container"
                    >
                        {/* Header Section */}
                        <header className="postural-modal-header">
                            <div className="header-content-stack">
                                {/* Row 1: Superior (Functions & Tools) */}
                                <div className="header-row-title">
                                    <div className="header-row-tools">
                                        <div className="header-title-group">
                                            <div className="header-accent-bar" />
                                            <h2 className="header-title-text">
                                                Estúdio Profissional
                                            </h2>
                                        </div>
                                        
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="studio-btn-primary"
                                        >
                                            <Maximize2 size={16} /> Novo
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />

                                        <div className="studio-group-container">
                                            <ToolButton active={activeTool === 'brush'} onClick={() => setActiveTool('brush')} icon={<Paintbrush size={18} />} label="Pincel" />
                                            <ToolButton active={activeTool === 'eraser'} onClick={() => setActiveTool('eraser')} icon={<Eraser size={18} />} label="Borracha" />
                                            <ToolButton active={activeTool === 'line'} onClick={() => setActiveTool('line')} icon={<Minus size={18} />} label="Reta" />
                                            <ToolButton active={activeTool === 'angle_points'} onClick={() => setActiveTool('angle_points')} icon={<RotateCcw size={18} style={{ transform: 'rotate(90deg)' }} />} label="Ângulo" />
                                        </div>

                                        <div className="grid-control-container">
                                            <button 
                                                onClick={() => setShowGrid(!showGrid)}
                                                className={`btn-grid-toggle ${showGrid ? 'active' : ''}`}
                                            >
                                                <Grid size={16} /> {showGrid ? 'Gradil' : 'Sem Grade'}
                                            </button>
                                            {showGrid && (
                                                <input 
                                                    type="range" min="20" max="100" value={gridSize} 
                                                    onChange={(e) => setGridSize(parseInt(e.target.value))} 
                                                    className="grid-slider" 
                                                />
                                            )}
                                        </div>

                                        <div className="color-palette">
                                            {COLORS.map(c => (
                                                <button 
                                                    key={c} onClick={() => setColor(c)}
                                                    className={`color-dot ${color === c ? 'active' : ''}`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={onClose}
                                        className="btn-close-modal"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Row 2: Inferior (Actions Row) */}
                                <div className="header-row-actions">
                                    <div className="action-btns-group">
                                        <ActionButton 
                                            onClick={handleUndo} 
                                            disabled={history.length <= 1}
                                            icon={<Undo size={16} />} 
                                            label="Desfazer" 
                                        />
                                        <ActionButton 
                                            onClick={() => {
                                                const ctx = mainCtxRef.current;
                                                if (ctx && canvasRef.current && imageRef.current) {
                                                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                                    ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                                                    setHistory([canvasRef.current.toDataURL()]);
                                                    toast.info("Desenhos limpos");
                                                }
                                            }}
                                            icon={<RotateCcw size={16} />} 
                                            label="Limpar" 
                                        />
                                        <ActionButton 
                                            onClick={() => { if(confirm("Deseja realmente remover a foto e todos os desenhos?")) { setCurrentImageSrc(''); setHistory([]); } }}
                                            danger
                                            icon={<Trash2 size={16} />} 
                                            label="Apagar" 
                                        />
                                        
                                        <div className="v-divider" />
                                        
                                        <ActionButton onClick={handleCopy} icon={<Copy size={16} />} label="Copiar" />
                                        <ActionButton onClick={handleDownload} icon={<Download size={16} />} label="Baixar" />
                                    </div>

                                    <div className="footer-actions">
                                        <button 
                                            onClick={onClose} 
                                            className="btn-footer-cancel"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleSave} 
                                            disabled={!currentImageSrc}
                                            className="btn-footer-save"
                                        >
                                            Salvar e Inserir no Formulário
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Workspace Area */}
                        <div className="workspace-area">
                            {!currentImageSrc ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="empty-state-card"
                                >
                                    <div className="empty-state-icon-box">
                                        <Maximize2 size={56} style={{ color: 'var(--primary)', opacity: 0.2 }} />
                                    </div>
                                    <div>
                                        <h3 className="empty-state-title">Workspace Vazio</h3>
                                        <p className="empty-state-desc">Comece agora fazendo o upload de uma imagem do seu computador ou dispositivo.</p>
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn-upload-large"
                                    >
                                        <Maximize2 size={24} />
                                        <span>Selecionar Imagem do Computador</span>
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="canvas-wrapper">
                                    <canvas 
                                        ref={canvasRef}
                                        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
                                        onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
                                        className="studio-canvas"
                                    />
                                    {showGrid && canvasRef.current && (
                                        <div 
                                            className="grid-overlay"
                                            style={{
                                                backgroundImage: `
                                                    linear-gradient(to right, rgba(0, 162, 255, 0.4) 1px, transparent 1px),
                                                    linear-gradient(to bottom, rgba(0, 162, 255, 0.4) 1px, transparent 1px)
                                                `,
                                                backgroundSize: `${gridSize}px ${gridSize}px`
                                            }}
                                        >
                                            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2.5px', backgroundColor: 'rgba(163, 22, 33, 0.3)' }} />
                                            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2.5px', backgroundColor: 'rgba(163, 22, 33, 0.3)' }} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Status Bar */}
                        <footer className="status-bar">
                            <div className="status-log">
                                <span>KinesisLab Studio v2.0</span>
                                <div className="status-indicator" />
                            </div>
                            <div className="status-log">
                                <span>Ferramenta: {activeTool}</span>
                                <span>Histórico: {history.length} estados</span>
                            </div>
                        </footer>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function ToolButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick} title={label}
            className={`studio-tool-btn ${active ? 'active' : ''}`}
        >
            {icon}
            <span className="studio-tool-btn-label">{label}</span>
        </button>
    );
}

function ActionButton({ onClick, icon, label, disabled = false, danger = false }: { onClick: () => void, icon: React.ReactNode, label: string, disabled?: boolean, danger?: boolean }) {
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`studio-action-btn ${danger ? 'danger' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
