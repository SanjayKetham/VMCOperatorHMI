"use client";

import React, { useEffect, useRef } from "react";
import { RequiredTool } from "@/lib/types";

interface DigitalTwinCanvasProps {
  isRunning: boolean;
  isPaused: boolean;
  spindleRpm: number;
  activeTool: RequiredTool | null;
  progressPercent: number;
  coords: { x: number; y: number; z: number };
}

export default function DigitalTwinCanvas({
  isRunning,
  isPaused,
  spindleRpm,
  activeTool,
  progressPercent,
  coords,
}: DigitalTwinCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const particles = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rotationAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear background
      ctx.fillStyle = "#070d19";
      ctx.fillRect(0, 0, width, height);

      // 2. Draw grid floor
      ctx.strokeStyle = "rgba(30, 41, 59, 0.6)";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center reference
      const cx = width / 2;
      const cy = height / 2 + 50;

      // 3. Machine Table / Vise Base
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.fillRect(cx - 160, cy + 40, 320, 40);
      ctx.strokeRect(cx - 160, cy + 40, 320, 40);

      // T-Slots
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(cx - 140, cy + 50, 20, 20);
      ctx.fillRect(cx + 120, cy + 50, 20, 20);

      // Vise Jaws (4-Jaw Chuck)
      ctx.fillStyle = "#475569";
      ctx.fillRect(cx - 100, cy + 10, 30, 30); // Left jaw
      ctx.fillRect(cx + 70, cy + 10, 30, 30);  // Right jaw

      // 4. Billet Workpiece (Aluminium 6061-T6 block)
      const stockWidth = 140;
      const stockHeight = 50;
      const stockX = cx - stockWidth / 2;
      const stockY = cy + 40 - stockHeight;

      // Uncut Stock Billet Body
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(stockX, stockY, stockWidth, stockHeight);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.strokeRect(stockX, stockY, stockWidth, stockHeight);

      // Machined Pocket Cavity (grows with progressPercent)
      const pocketWidth = (stockWidth - 30) * (progressPercent / 100);
      if (pocketWidth > 0) {
        ctx.fillStyle = "#334155";
        ctx.fillRect(cx - pocketWidth / 2, stockY, pocketWidth, stockHeight * 0.6);
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - pocketWidth / 2, stockY, pocketWidth, stockHeight * 0.6);
      }

      // 5. Spindle & Tool Bit Motion
      // Map X/Y/Z coords to canvas space
      const toolX = cx + (coords.x / 100) * 120;
      const toolY = stockY - 40 - (coords.z / 100) * 60;

      // Spindle Motor Housing
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.fillRect(toolX - 35, toolY - 120, 70, 80);
      ctx.strokeRect(toolX - 35, toolY - 120, 70, 80);

      // Spindle Collar & Tool Holder
      ctx.fillStyle = "#475569";
      ctx.fillRect(toolX - 20, toolY - 40, 40, 30);

      // Active Tool Bit
      const toolWidth = activeTool?.tool_type.includes("Face") ? 36 : 14;
      const toolHeight = 40;
      ctx.fillStyle = isRunning && !isPaused ? "#f59e0b" : "#e2e8f0";
      ctx.fillRect(toolX - toolWidth / 2, toolY - 10, toolWidth, toolHeight);
      ctx.strokeStyle = "#cbd5e1";
      ctx.strokeRect(toolX - toolWidth / 2, toolY - 10, toolWidth, toolHeight);

      // Spinning Flutes Animation
      if (isRunning && !isPaused && spindleRpm > 0) {
        rotationAngle += (spindleRpm / 12000) * 0.4;
        ctx.save();
        ctx.translate(toolX, toolY + toolHeight / 2 - 10);
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rotationAngle) * (toolWidth / 2), -5);
        ctx.lineTo(-Math.cos(rotationAngle) * (toolWidth / 2), 15);
        ctx.stroke();
        ctx.restore();

        // 6. Particle Effects (Swarf Metal Chips & Cyan Coolant Mist)
        if (Math.random() < 0.6) {
          // Metal chip
          particles.current.push({
            x: toolX + (Math.random() - 0.5) * toolWidth,
            y: toolY + toolHeight,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 4 - 2,
            life: 1.0,
            color: "#fef08a",
          });
          // Coolant spray
          particles.current.push({
            x: toolX + (Math.random() - 0.5) * 10,
            y: toolY + toolHeight - 5,
            vx: (Math.random() - 0.5) * 8,
            vy: Math.random() * 4 + 2,
            life: 1.0,
            color: "#00f0ff",
          });
        }
      }

      // Update & render particles
      particles.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.life -= 0.04;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, p.color === "#00f0ff" ? 3 : 2, p.color === "#00f0ff" ? 3 : 2);
        ctx.globalAlpha = 1.0;
      });

      particles.current = particles.current.filter((p) => p.life > 0);

      // 7. Axis Machine Indicators
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 11px monospace";
      ctx.fillText(`X: ${coords.x.toFixed(3)} mm`, 20, 30);
      ctx.fillText(`Y: ${coords.y.toFixed(3)} mm`, 20, 48);
      ctx.fillText(`Z: ${coords.z.toFixed(3)} mm`, 20, 66);
      ctx.fillText(`FEED: ${isRunning && !isPaused ? "1,250 mm/min" : "0 mm/min"}`, 20, 84);

      // Digital Twin Status Badge
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.strokeStyle = "#334155";
      ctx.fillRect(width - 170, 15, 155, 30);
      ctx.strokeRect(width - 170, 15, 155, 30);

      ctx.fillStyle = isRunning && !isPaused ? "#10b981" : isPaused ? "#f59e0b" : "#64748b";
      ctx.beginPath();
      ctx.arc(width - 155, 30, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 10px monospace";
      ctx.fillText(
        isRunning && !isPaused ? "TWIN: EXECUTING" : isPaused ? "TWIN: FEED HOLD" : "TWIN: STANDBY",
        width - 142,
        34
      );

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isRunning, isPaused, spindleRpm, activeTool, progressPercent, coords]);

  // Handle Canvas Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight || 340;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
