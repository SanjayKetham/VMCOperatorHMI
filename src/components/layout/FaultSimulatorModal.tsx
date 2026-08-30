"use client";

import React from "react";
import { soundEngine } from "@/lib/audio";
import { X, ShieldAlert, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

interface FaultSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFaults: string[];
  onToggleFault: (faultKey: string) => void;
  onClearAllFaults: () => void;
}

const SIMULATED_FAULTS = [
  {
    key: "door_open",
    label: "Safety Guard Door Interlock Open",
    description: "Triggers safety interlock trip. Immediately halts spindle rotation and locks Stage 5 cycle start.",
    severity: "CRITICAL",
  },
  {
    key: "lube_low",
    label: "Way-Lube Reservoir Pressure Drop (< 1.2 BAR)",
    description: "Triggers lubrication warning alarm. Prevents axis rapid motion.",
    severity: "WARNING",
  },
  {
    key: "estop_tripped",
    label: "Emergency Stop Circuit Tripped",
    description: "Simulates depressed E-Stop button on control panel.",
    severity: "CRITICAL",
  },
];

export default function FaultSimulatorModal({
  isOpen,
  onClose,
  activeFaults,
  onToggleFault,
  onClearAllFaults,
}: FaultSimulatorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Safety Interlock Fault Simulator
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Evaluator Tool — Inject dynamic machine hardware faults to test interlock logic
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono text-xs">
          <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
            Use these controls to simulate industrial machine sensor faults and evaluate safety lock enforcement during operation.
          </p>

          <div className="space-y-3">
            {SIMULATED_FAULTS.map((f) => {
              const isActive = activeFaults.includes(f.key);

              return (
                <div
                  key={f.key}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isActive
                      ? "bg-rose-950/40 border-rose-600/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-sm ${
                          isActive ? "text-rose-300" : "text-slate-200"
                        }`}
                      >
                        {f.label}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          f.severity === "CRITICAL"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{f.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isActive) soundEngine.playAlarm();
                      else soundEngine.playClick();
                      onToggleFault(f.key);
                    }}
                    className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    }`}
                  >
                    {isActive ? "SIMULATING FAULT" : "TRIGGER FAULT"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClearAllFaults();
            }}
            disabled={activeFaults.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600/60 text-emerald-400 font-bold hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Clear All Faults
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
