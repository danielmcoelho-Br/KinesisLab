"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Paintbrush, Undo2, Eraser } from "lucide-react";

interface FreeCanvasProps {
  value?: string;
  onChange: (value: string) => void;
  isEditing?: boolean;
}

export default function FreeCanvas({ value, onChange, isEditing = true }: FreeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    contextRef.current = ctx;

    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0);
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditing) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    
    setHistory(prev => [...prev, canvasRef.current!.toDataURL()].slice(-20));

    if (isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 20;
    } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
    }

    const { x, y } = getCoord(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    const { x, y } = getCoord(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      onChange(canvasRef.current!.toDataURL());
    }
  };

  const getCoord = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (CANVAS_WIDTH / rect.width),
      y: (clientY - rect.top) * (CANVAS_HEIGHT / rect.height)
    };
  };

  return (
    <div className="flex flex-col gap-4 w-full items-center">
      {isEditing && (
        <div className="flex gap-4 mb-4">
          {["#000000", "#FF0000", "#0000FF", "#008000"].map(c => (
            <button 
              key={c}
              onClick={() => { setColor(c); setIsEraser(false); }}
              style={{ 
                  width: 32, height: 32, borderRadius: "50%", backgroundColor: c, 
                  border: color === c && !isEraser ? "3px solid var(--primary)" : "1px solid #ccc" 
              }}
            />
          ))}
          <button onClick={() => setIsEraser(!isEraser)} className={`p-2 rounded ${isEraser ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
            <Eraser size={20} />
          </button>
          <button onClick={() => {
              const last = history.pop();
              if (last) {
                  const img = new Image();
                  img.onload = () => {
                      contextRef.current!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                      contextRef.current!.drawImage(img, 0, 0);
                      onChange(canvasRef.current!.toDataURL());
                  };
                  img.src = last;
                  setHistory([...history]);
              }
          }} className="p-2 bg-gray-100 rounded">
            <Undo2 size={20} />
          </button>
          <button onClick={() => {
              contextRef.current!.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
              onChange("");
          }} className="p-2 bg-red-100 text-red-600 rounded">
            <RotateCcw size={20} />
          </button>
        </div>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner" style={{ width: '100%', maxWidth: '800px', height: 'auto', aspectRatio: '4/3' }}>
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-full ${isEditing ? 'cursor-crosshair' : 'cursor-default'} touch-none`}
        />
      </div>
    </div>
  );
}
