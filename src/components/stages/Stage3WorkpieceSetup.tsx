"use client";

import React from "react";
import { WorkpieceStep } from "@/lib/types";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import TorqueWrench from "@/components/ui/TorqueWrench";
import { Box, CheckCircle2, Check, ArrowRight, Lock, Wrench, Compass, FileCode } from "lucide-react";

interface Stage3Props {
  steps: WorkpieceStep[];
  onConfirmStep: (key: string) => void;
  onNextStage: () => void;
}

export default function Stage3WorkpieceSetup({
  steps,
  onConfirmStep,
  onNextStage,
}: Stage3Props) {
  const { progress, allWorkpieceConfirmed, setProgress } = useHMIStore();
  const workpieceState = progress?.workpiece_state || {};

  const confirmedCount = steps.filter((s) => workpieceState[s.step_key]).length;
  const isAllConfirmed = allWorkpieceConfirmed();

  const isClamped = !!workpieceState["clamp_secure"];

  const handleConfirmAll = () => {
    if (!progress) return;
    soundEngine.playCheck();
    const allState: Record<string, boolean> = {};
    steps.forEach((s) => {
      allState[s.step_key] = true;
    });
    setProgress({
      ...progress,
      workpiece_state: allState,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded font-mono font-bold text-xs uppercase tracking-wider">
              Stage 03
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Workpiece Mounting, Fixture Clamping &amp; Offset Zeroing
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Mount billet stock into fixture, execute 45 Nm vise clamping, set G54 datum, and dry run program.
          </p>
        </div>

        {/* Progress & Shortcut */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Setup Steps</div>
              <div className="text-base font-extrabold text-cyan-400">
                {confirmedCount} / {steps.length} <span className="text-xs text-slate-400">Completed</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
              {Math.round((confirmedCount / (steps.length || 1)) * 100)}%
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

      {/* Interactive Torque Wrench Component for Clamping */}
      <TorqueWrench
        targetTorque={45}
        isClamped={isClamped}
        onClamped={() => {
          onConfirmStep("clamp_secure");
        }}
      />

      {/* Grid of Workpiece Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => {
          const isConfirmed = !!workpieceState[step.step_key];

          return (
            <div
              key={step.id}
              onClick={() => {
                if (!isConfirmed) {
                  soundEngine.playCheck();
                  onConfirmStep(step.step_key);
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 select-none ${
                isConfirmed
                  ? "bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-700">
                    0{step.sort_order}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                    {step.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100">{step.label}</h3>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {step.detail && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
                    {step.detail}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                disabled={isConfirmed}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isConfirmed) {
                    soundEngine.playCheck();
                    onConfirmStep(step.step_key);
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
                    STEP VERIFIED
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    CONFIRM STEP
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono">
          {isAllConfirmed ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All workpiece setup steps completed. Ready for review.
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Safety Interlock: Complete remaining {steps.length - confirmedCount} setup steps to unlock review.
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
          PROCEED TO STAGE 04: READY REVIEW <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
