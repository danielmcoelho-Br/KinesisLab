"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Paintbrush } from "lucide-react";

interface BodySchemaProps {
  image: string;
  value?: string;
  onChange: (value: string) => void;
}

export default function BodySchema({ image, value, onChange }: BodySchemaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Default highlighter style
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ff0000";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 10;
    
    contextRef.current = ctx;

    // Clear and Redraw if value changes (e.g. loaded from DB)
    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 1; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      };
      img.src = value;
    }
  }, [value]); // Depend on value to update when data arrives


  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset properties to ensure highlighter effect
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#ff0000";
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 8;

    const { offsetX, offsetY } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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

    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    save();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL());
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        style={{ 
          position: "relative", 
          width: "350px", 
          height: "450px", 
          margin: "0 auto",
          backgroundColor: "#f8f9fa",
          borderRadius: "1rem",
          overflow: "hidden",
          border: "1px solid var(--border)",
          cursor: "crosshair",
          touchAction: "none"
        }}
      >
        <img 
          src={image} 
          alt="Corpo" 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            objectFit: "contain",
            pointerEvents: "none"
          }} 
        />
        <canvas
          ref={canvasRef}
          width={350}
          height={450}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <button
          type="button"
          onClick={clear}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border)",
            backgroundColor: "white",
            cursor: "pointer"
          }}
        >
          <RotateCcw size={16} /> Corrigir
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
            <Paintbrush size={16} />
            Arraste para pintar áreas de dor
        </div>
      </div>
    </div>
  );
}
