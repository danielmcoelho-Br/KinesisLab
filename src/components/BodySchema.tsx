"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Paintbrush, Undo2, Eraser } from "lucide-react";

interface BodySchemaProps {
  image: string;
  value?: string;
  onChange: (value: string) => void;
}

const COLORS = [
  { id: "red", color: "#ff0000", label: "Dor" },
  { id: "blue", color: "#0000ff", label: "Formigamento" },
  { id: "yellow", color: "#ffff00", label: "Queimação" },
  { id: "green", color: "#00ff00", label: "Parestesia" },
];

export default function BodySchema({ image, value, onChange }: BodySchemaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeColor, setActiveColor] = useState(COLORS[0].color);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Constants for fixed canvas logical size
  const CANVAS_WIDTH = 700;
  const CANVAS_HEIGHT = 900;

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    contextRef.current = ctx;

    // Load initial value if exists
    if (value && value.startsWith("data:image")) {
      // Avoid re-drawing if the value is what we just saved
      const currentData = canvas.toDataURL();
      if (value === currentData) return;

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0);
        if (history.length <= 1) {
            setHistory([value]);
        }
      };
      img.src = value;
    } else if (!value) {
        // If value is explicitly cleared from parent
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        if (history.length > 0) setHistory([canvas.toDataURL()]);
    } else {
        // Initial empty state for history
        if (history.length === 0) {
            setHistory([canvas.toDataURL()]);
        }
    }
  }, [value]);


  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    // Save current state to history BEFORE starting a new stroke
    const canvas = canvasRef.current;
    if (canvas) {
        const currentState = canvas.toDataURL();
        setHistory(prev => [...prev, currentState].slice(-20)); // Keep last 20 states
    }

    if (isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 30; // Eraser is typically larger
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 1.0; // Solid colors as requested
        ctx.lineWidth = 15;
    }

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    if (!ctx) return;

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current?.closePath();
      setIsDrawing(false);
      save();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    return {
      offsetX: (clientX - rect.left) * scaleX,
      offsetY: (clientY - rect.top) * scaleY,
    };
  };

  const undo = () => {
    if (history.length <= 1) return; // Cannot undo initial state or empty history

    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    const img = new Image();
    img.onload = () => {
        ctx.globalCompositeOperation = "source-over"; // Reset for redraw
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0);
        setHistory(newHistory);
        save();
    };
    img.src = previousState;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    
    // Save current state before clearing if you want undo for clear too
    setHistory(prev => [...prev, canvas.toDataURL()]);

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    save();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL());
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Top Part: Canvas and Color Legend */}
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full max-w-5xl">
        
        {/* Canvas Area */}
        <div className="flex flex-col gap-4 items-center flex-1">
            <div 
                style={{ 
                position: "relative", 
                width: "100%",
                maxWidth: "500px",  
                backgroundColor: "transparent", // Remove gray background
                borderRadius: "1rem",
                overflow: "hidden",
                border: "2px solid var(--border)",
                cursor: isEraser ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"black\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m20 20-7-7 3-3 7 7Z\"/><path d=\"M14 14 6 6l-3 3 8 8Z\"/></svg>') 12 12, auto" : "crosshair",
                touchAction: "none",
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
                }}
            >
                <img 
                src={image} 
                alt="Corpo" 
                style={{ 
                    width: "100%", 
                    height: "auto", 
                    objectFit: "contain", // Keep proportion
                    pointerEvents: "none",
                    opacity: 0.9,
                    display: "block"
                }} 
                />
                <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    width: "100%", 
                    height: "100%",
                    touchAction: "none"
                }}
                />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                <Paintbrush size={14} />
                Arraste sobre a imagem para realizar a marcação
            </div>
        </div>

        {/* Color Legend - Right side on Desktop */}
        <div className="flex flex-col gap-4 p-6 bg-white border border-border rounded-2xl shadow-md min-w-[240px]">
            <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--secondary)", marginBottom: "0.5rem", textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legenda de Cores</h4>
            <div className="flex flex-col gap-2">
                {COLORS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveColor(item.color);
                            setIsEraser(false);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all"
                        style={{ 
                            backgroundColor: (!isEraser && activeColor === item.color) ? "var(--primary-light)" : "transparent",
                            border: (!isEraser && activeColor === item.color) ? `2.5px solid var(--primary)` : "2.5px solid transparent",
                            width: "100%",
                            textAlign: "left",
                            cursor: "pointer"
                        }}
                    >
                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: item.color, border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,0.1)" }} />
                        <span style={{ fontSize: "0.95rem", fontWeight: (!isEraser && activeColor === item.color) ? "700" : "500", color: (!isEraser && activeColor === item.color) ? "var(--primary)" : "var(--text)" }}>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Tools Section - Bottom */}
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl py-6 border-t border-border">
            <button
                type="button"
                onClick={() => setIsEraser(!isEraser)}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl transition-all"
                style={{ 
                    backgroundColor: isEraser ? "#374151" : "white",
                    color: isEraser ? "white" : "#374151",
                    border: "2.5px solid #374151",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "1rem"
                }}
            >
                <Eraser size={20} /> Borracha
            </button>

            <button
                type="button"
                onClick={undo}
                disabled={history.length <= 1}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl transition-all"
                style={{ 
                    backgroundColor: "white",
                    border: "2.5px solid #E5E7EB",
                    cursor: history.length <= 1 ? "not-allowed" : "pointer",
                    opacity: history.length <= 1 ? 0.5 : 1,
                    fontWeight: "600",
                    color: "var(--text)",
                    fontSize: "1rem"
                }}
            >
                <Undo2 size={20} color="var(--text-muted)" /> Desfazer
            </button>

            <button
                type="button"
                onClick={clear}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl transition-all hover:bg-red-50"
                style={{ 
                    backgroundColor: "white",
                    border: "2.5px solid #B91C1C",
                    cursor: "pointer",
                    color: "#B91C1C",
                    fontWeight: "700",
                    fontSize: "1rem"
                }}
            >
                <RotateCcw size={20} color="#B91C1C" /> Apagar Tudo
            </button>
      </div>
    </div>
  );
}
