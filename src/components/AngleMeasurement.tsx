"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Target, Maximize2 } from "lucide-react";

interface Point {
    x: number;
    y: number;
}

interface AngleMeasurementProps {
    value?: string; // This will store the base64 of the image WITH drawing or just points? 
    // Usually better to store points and base image, but let's go with the "screenshot" approach for simplicity in this app's architecture.
    onChange: (value: string) => void;
}

export default function AngleMeasurement({ value, onChange }: AngleMeasurementProps) {
    const [image, setImage] = useState<string | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [angle, setAngle] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        if (value && value.startsWith("data:image")) {
            setImage(value);
        }
    }, [value]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result as string);
            setPoints([]);
            setAngle(null);
        };
        reader.readAsDataURL(file);
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!image || points.length >= 3) return;

        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newPoints = [...points, { x, y }];
        setPoints(newPoints);

        if (newPoints.length === 3) {
            calculateAngle(newPoints);
        }
    };

    const calculateAngle = (pts: Point[]) => {
        const [p1, p2, p3] = pts;
        
        // Vector p2 -> p1
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        // Vector p2 -> p3
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

        const dotProduct = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

        const cosTheta = dotProduct / (mag1 * mag2);
        // Clamp to avoid NaN
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
        const angleDeg = (angleRad * 180) / Math.PI;
        
        setAngle(Math.round(angleDeg * 10) / 10);
        
        // After a small delay to allow state update/render, we could "save" the result
        // But for now let's just draw on canvas
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

            // Draw points and lines
            ctx.strokeStyle = "#ff0000";
            ctx.fillStyle = "#ff0000";
            ctx.lineWidth = 4;

            points.forEach((p, i) => {
                ctx.beginPath();
                ctx.arc(p.x * (img.width / canvas.clientWidth), p.y * (img.height / canvas.clientHeight), 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.font = "bold 24px Arial";
                ctx.fillText(`P${i+1}`, p.x * (img.width / canvas.clientWidth) + 10, p.y * (img.height / canvas.clientHeight) - 10);
            });

            if (points.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(points[0].x * (img.width / canvas.clientWidth), points[0].y * (img.height / canvas.clientHeight));
                ctx.lineTo(points[1].x * (img.width / canvas.clientWidth), points[1].y * (img.height / canvas.clientHeight));
                ctx.stroke();
            }

            if (points.length === 3) {
                ctx.beginPath();
                ctx.moveTo(points[1].x * (img.width / canvas.clientWidth), points[1].y * (img.height / canvas.clientHeight));
                ctx.lineTo(points[2].x * (img.width / canvas.clientWidth), points[2].y * (img.height / canvas.clientHeight));
                ctx.stroke();

                // Draw result text
                if (angle !== null) {
                    ctx.fillStyle = "rgba(0,0,0,0.7)";
                    ctx.fillRect(10, 10, 200, 50);
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 32px Arial";
                    ctx.fillText(`Ângulo: ${angle}°`, 20, 45);
                    
                    // Final save
                    onChange(canvas.toDataURL());
                }
            }
        };
        img.src = image;
    }, [image, points, angle]);

    return (
        <div className="flex flex-col gap-4 w-full" ref={containerRef}>
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors font-semibold">
                        <Camera size={20} />
                        Carregar Foto
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button onClick={() => { setPoints([]); setAngle(null); }} className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors" title="Reiniciar Pontos">
                        <RotateCcw size={20} />
                    </button>
                </div>
                {angle !== null && (
                    <div className="text-xl font-bold text-primary">
                        Ângulo: {angle}°
                    </div>
                )}
            </div>

            {!image ? (
                <div className="border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center text-gray-400 gap-4 bg-gray-50/50">
                    <Target size={48} className="opacity-20" />
                    <p>Faça o upload de uma imagem para começar a medição</p>
                </div>
            ) : (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-lg cursor-crosshair">
                    <canvas 
                        ref={canvasRef} 
                        onClick={handleClick}
                        className="w-full h-auto block"
                        style={{ maxHeight: '80vh', objectFit: 'contain' }}
                    />
                    {points.length < 3 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md">
                            {points.length === 0 ? "Clique no primeiro ponto (P1)" : 
                             points.length === 1 ? "Clique no vértice (P2)" : 
                             "Clique no terceiro ponto (P3)"}
                        </div>
                    )}
                </div>
            )}
            
            <div className="text-xs text-gray-500 italic mt-2">
                * Dica: P2 deve ser o vértice do ângulo que você deseja medir.
            </div>
        </div>
    );
}
