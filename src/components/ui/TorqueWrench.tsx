"use client";

import React, { useState } from "react";
import { soundEngine } from "@/lib/audio";
import { Wrench, CheckCircle2, ShieldCheck } from "lucide-react";

interface TorqueWrenchProps {
  targetTorque?: number;
  onClamped: () => void;
  isClamped: boolean;
}

export default function TorqueWrench({
  targetTorque = 45,
  onClamped,
  isClamped,
}: TorqueWrenchProps) {
  const [currentTorque, setCurrentTorque] = useState(isClamped ? targetTorque : 0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleApplyTorque = () => {
    if (isClamped || isAnimating) return;
    setIsAnimating(true);
    soundEngine.playClick();

    let step = 0;
    const interval = setInterval(() => {
      step += 5;
      if (step >= targetTorque) {
        setCurrentTorque(targetTorque);
        clearInterval(interval);
        setIsAnimating(false);
        soundEngine.playClamp();
        onClamped();
      } else {
        setCurrentTorque(step);
      }
    }, 40);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm text-slate-200">
            Interactive Pneumatic Vise Torque Control
          </span>
        </div>
        <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-amber-300">
          Target: {targetTorque} N·m
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
        {/* Torque Gauge Bar */}
        <div className="flex-1 w-full flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Torque Applied</span>
            <span
              className={`font-bold ${
                currentTorque >= targetTorque ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {currentTorque} / {targetTorque} N·m
            </span>
          </div>

          <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                currentTorque >= targetTorque
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  : "bg-gradient-to-r from-amber-500 to-yellow-400"
              }`}
              style={{ width: `${(currentTorque / targetTorque) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          disabled={isClamped || isAnimating}
          onClick={handleApplyTorque}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[170px] ${
            isClamped
              ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 cursor-default"
              : isAnimating
              ? "bg-amber-600 text-slate-950 animate-pulse"
              : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95"
          }`}
        >
          {isClamped ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              VISE CLAMPED ({targetTorque} Nm)
            </>
          ) : isAnimating ? (
            <>
              <Wrench className="w-4 h-4 animate-spin" />
              TORQUING...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              APPLY 45 N·m TORQUE
            </>
          )}
        </button>
      </div>
    </div>
  );
}
