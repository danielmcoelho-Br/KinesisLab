"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Paintbrush, Undo2, Eraser } from "lucide-react";

interface BodySchemaProps {
  image: string;
  value?: string;
  onChange: (value: string) => void;
  colors?: { hex: string, label: string }[];
  mode?: "draw" | "stamp";
  readOnly?: boolean;
}

const COLORS = [
  { id: "red", hex: "#ff0000", label: "Dor" },
  { id: "blue", hex: "#0000ff", label: "Formigamento" },
  { id: "yellow", hex: "#ffff00", label: "Queimação" },
  { id: "green", hex: "#00ff00", label: "Parestesia" },
];

export default function BodySchema({ image, value, onChange, colors: customColors, mode = "draw", readOnly = false }: BodySchemaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = customColors || COLORS;
  const [activeColor, setActiveColor] = useState(colors[0].hex);
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
    if (!ctx || readOnly) return;

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
        ctx.lineWidth = mode === "stamp" ? 28 : 15;
    }

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    // Draw point exactly where clicked, allowing dots instead of just lines
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    if (mode === "stamp" && !isEraser) return; // Prevent continuous dragging in stamp mode

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

    // Create an offscreen canvas to merge the background image + drawing
    const offscreen = document.createElement('canvas');
    offscreen.width = CANVAS_WIDTH;
    offscreen.height = CANVAS_HEIGHT;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
        onChange(canvas.toDataURL());
        return;
    }

    const bgImg = new Image();
    bgImg.onload = () => {
        // Draw base image filling exactly the canvas dimensions
        offCtx.drawImage(bgImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Draw the user strokes on top
        offCtx.drawImage(canvas, 0, 0);
        onChange(offscreen.toDataURL());
    };
    bgImg.onerror = () => {
        // Fallback: just save the strokes
        onChange(canvas.toDataURL());
    };
    bgImg.src = image;
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Drawing Area */}
      <div className="flex flex-col gap-6 items-center w-full max-w-[1000px]">
        <div 
            style={{ 
            position: "relative", 
            width: "100%",
            backgroundColor: "white", 
            borderRadius: "2rem",
            overflow: "hidden",
            border: "2px solid var(--border)",
            cursor: readOnly ? "default" : (isEraser ? "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"black\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m20 20-7-7 3-3 7 7Z\"/><path d=\"M14 14 6 6l-3 3 8 8Z\"/></svg>') 12 12, auto" : "crosshair"),
            touchAction: readOnly ? "auto" : "none",
            boxShadow: "var(--shadow-xl)",
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
                objectFit: "contain", 
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



        {/* Horizontal Legend - Expanded to full width */}
        {!readOnly && (
        <div className="w-full flex flex-col items-center gap-6 py-8 border-t border-border mt-4">
            <div className="flex w-full justify-between items-center px-2">
                {colors.map((item: any, idx: number) => {
                    const hex = item.hex;
                    const label = item.label;
                    const isActive = !isEraser && activeColor === hex;

                    return (
                        <button
                            key={idx}
                            onClick={() => {
                                setActiveColor(hex);
                                setIsEraser(false);
                            }}
                            className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all"
                            style={{ 
                                backgroundColor: isActive ? "var(--primary-light)" : "white",
                                border: isActive ? `2px solid var(--primary)` : "2px solid var(--border)",
                                cursor: "pointer",
                                boxShadow: isActive ? "var(--shadow-md)" : "none"
                            }}
                        >
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: hex, border: "2px solid white", boxShadow: "0 0 0 1px rgba(0,0,0,0.1)" }} />
                            <span style={{ fontSize: "1rem", fontWeight: "700", color: isActive ? "var(--primary)" : "var(--text)" }}>{label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
        )}
      </div>

      {/* Tools Section - Expanded spacing and matching Próxima button */}
      {!readOnly && (
      <div className="flex flex-wrap justify-center gap-8 w-full max-w-4xl pt-16 border-t-2 border-border">
            <button
                type="button"
                onClick={() => setIsEraser(!isEraser)}
                className="flex items-center gap-3 px-8 py-3 rounded-[0.75rem] transition-all"
                style={{ 
                    backgroundColor: isEraser ? "var(--primary)" : "var(--primary-light)",
                    color: isEraser ? "white" : "var(--primary)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "1rem",
                    boxShadow: isEraser ? "var(--shadow-lg)" : "none"
                }}
            >
                <Eraser size={20} /> Borracha
            </button>

            <button
                type="button"
                onClick={undo}
                disabled={history.length <= 1}
                className="flex items-center gap-3 px-8 py-3 rounded-[0.75rem] transition-all"
                style={{ 
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                    border: "none",
                    cursor: history.length <= 1 ? "not-allowed" : "pointer",
                    opacity: history.length <= 1 ? 0.3 : 1,
                    fontWeight: "700",
                    fontSize: "1rem",
                }}
            >
                <Undo2 size={20} /> Desfazer
            </button>

            <button
                type="button"
                onClick={clear}
                className="flex items-center gap-3 px-8 py-3 rounded-[0.75rem] transition-all hover:opacity-90 active:scale-95"
                style={{ 
                    backgroundColor: "#ef4444",
                    border: "none",
                    cursor: "pointer",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "1rem",
                    boxShadow: "var(--shadow-md)"
                }}
            >
                <RotateCcw size={20} /> Apagar Tudo
            </button>
      </div>
      )}
    </div>
  );
}
