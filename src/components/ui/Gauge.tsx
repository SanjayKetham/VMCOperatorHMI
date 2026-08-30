"use client";

import React from "react";

interface GaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit: string;
  color?: "cyan" | "emerald" | "amber" | "rose";
  warningThreshold?: number;
}

export default function Gauge({
  label,
  value,
  min = 0,
  max = 100,
  unit,
  color = "cyan",
  warningThreshold = 90,
}: GaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isWarning = percentage >= warningThreshold;

  const colorStyles = {
    cyan: { stroke: "#00f0ff", text: "text-cyan-400", bg: "bg-cyan-500/10" },
    emerald: { stroke: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10" },
    amber: { stroke: "#f59e0b", text: "text-amber-400", bg: "bg-amber-500/10" },
    rose: { stroke: "#f43f5e", text: "text-rose-400", bg: "bg-rose-500/10" },
  }[isWarning ? "rose" : color];

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between shadow-md relative overflow-hidden">
      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </div>

      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-135" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
            strokeLinecap="round"
          />
          {/* Filled Gauge Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={colorStyles.stroke}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Center Display Value */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-extrabold text-base leading-none ${colorStyles.text}`}>
            {value.toLocaleString()}
          </span>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{unit}</span>
        </div>
      </div>

      <div className="w-full flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
