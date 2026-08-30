"use client";

import React from "react";
import { MachineCheck } from "@/lib/types";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import {
  Zap,
  ShieldAlert,
  DoorClosed,
  AlertTriangle,
  Droplets,
  Waves,
  Home,
  CheckCircle2,
  Check,
  ArrowRight,
  ShieldCheck,
  Lock
} from "lucide-react";

interface Stage1Props {
  checks: MachineCheck[];
  onConfirmCheck: (key: string) => void;
  onNextStage: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  ShieldAlert,
  DoorClosed,
  AlertTriangle,
  Droplets,
  Waves,
  Home,
};

export default function Stage1MachineChecks({
  checks,
  onConfirmCheck,
  onNextStage,
}: Stage1Props) {
  const { progress, allChecksConfirmed, setProgress } = useHMIStore();
  const checksState = progress?.machine_checks_state || {};

  const confirmedCount = checks.filter((c) => checksState[c.check_key]).length;
  const isAllConfirmed = allChecksConfirmed();

  const handleConfirmAll = () => {
    if (!progress) return;
    soundEngine.playCheck();
    const allState: Record<string, boolean> = {};
    checks.forEach((c) => {
      allState[c.check_key] = true;
    });
    setProgress({
      ...progress,
      machine_checks_state: allState,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info & Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded font-mono font-bold text-xs uppercase tracking-wider">
              Stage 01
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Pre-Flight Machine Health &amp; Safety Checks
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Verify controller status, safety guard interlocks, and fluid reservoirs before loading tools.
          </p>
        </div>

        {/* Progress & Fast Action */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Verification Progress</div>
              <div className="text-base font-extrabold text-cyan-400">
                {confirmedCount} / {checks.length} <span className="text-xs text-slate-400">Confirmed</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
              {Math.round((confirmedCount / (checks.length || 1)) * 100)}%
            </div>
          </div>

          {!isAllConfirmed && (
            <button
              onClick={handleConfirmAll}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold font-mono transition-colors whitespace-nowrap"
            >
              CONFIRM ALL
            </button>
          )}
        </div>
      </div>

      {/* Grid of 7 Machine Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checks.map((check) => {
          const isConfirmed = !!checksState[check.check_key];
          const IconComponent = ICON_MAP[check.icon] || ShieldCheck;

          return (
            <div
              key={check.id}
              onClick={() => {
                if (!isConfirmed) {
                  soundEngine.playCheck();
                  onConfirmCheck(check.check_key);
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 select-none ${
                isConfirmed
                  ? "bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isConfirmed
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-slate-800 text-cyan-400 border-slate-700"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isConfirmed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {check.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100 leading-snug">
                    {check.label}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    {check.description}
                  </p>
                </div>
              </div>

              {/* Card Action Button */}
              <button
                disabled={isConfirmed}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isConfirmed) {
                    soundEngine.playCheck();
                    onConfirmCheck(check.check_key);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isConfirmed
                    ? "bg-emerald-950 border border-emerald-500/40 text-emerald-400 cursor-default"
                    : "bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-cyan-400 active:scale-98"
                }`}
              >
                {isConfirmed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    VERIFIED &amp; PASSED
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    CONFIRM CHECK
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Stage Footer Navigation Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono">
          {isAllConfirmed ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All 7 machine checks verified. Ready to proceed.
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Safety Interlock: Confirm remaining {checks.length - confirmedCount} checks to unlock next stage.
            </span>
          )}
        </div>

        <button
          disabled={!isAllConfirmed}
          onClick={() => {
            if (isAllConfirmed) {
              soundEngine.playClick();
              onNextStage();
            }
          }}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            isAllConfirmed
              ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 active:scale-95"
              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
          }`}
        >
          PROCEED TO STAGE 02: REQUIRED TOOLS <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
