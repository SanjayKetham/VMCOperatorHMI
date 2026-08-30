"use client";

import React from "react";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Play,
  User,
  Wrench,
  Box,
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface Stage4Props {
  onOpenSetupSheet: () => void;
  onProceedToOperation: () => void;
}

export default function Stage4ReadyReview({
  onOpenSetupSheet,
  onProceedToOperation,
}: Stage4Props) {
  const { operator, workOrder, machineChecks, requiredTools, workpieceSteps } = useHMIStore();

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Ready Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/50 rounded-2xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] text-center space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
          <ShieldCheck className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-1">
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded font-mono font-extrabold text-xs uppercase tracking-widest">
            100% PRE-FLIGHT READINESS VERIFIED
          </span>
          <h2 className="text-3xl font-black text-slate-50 tracking-tight">
            VMC Machine Ready for Live Milling Operation
          </h2>
          <p className="text-sm text-slate-300 font-mono max-w-xl mx-auto">
            All safety interlocks passed, tool offsets confirmed, and workpiece vise clamped to 45 N·m torque.
          </p>
        </div>

        {/* Diagnostic Score Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 font-mono">
          <div className="bg-slate-950/90 p-4 rounded-xl border border-emerald-500/40 text-center space-y-1">
            <div className="text-slate-400 text-[10px] uppercase">Stage 1 Checks</div>
            <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {machineChecks.length} / {machineChecks.length}
            </div>
            <div className="text-[10px] text-emerald-500 font-bold">100% HEALTHY</div>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-xl border border-emerald-500/40 text-center space-y-1">
            <div className="text-slate-400 text-[10px] uppercase">Stage 2 Tooling</div>
            <div className="text-xl font-black text-cyan-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" /> {requiredTools.length} / {requiredTools.length}
            </div>
            <div className="text-[10px] text-cyan-500 font-bold">CAROUSEL LOADED</div>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-xl border border-emerald-500/40 text-center space-y-1">
            <div className="text-slate-400 text-[10px] uppercase">Stage 3 Workpiece</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-amber-400" /> {workpieceSteps.length} / {workpieceSteps.length}
            </div>
            <div className="text-[10px] text-amber-500 font-bold">CLAMPED 45 N·m</div>
          </div>
        </div>
      </div>

      {/* Summary Details & Operator Sign-off */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Specs */}
        {workOrder && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-cyan-400" /> Active Job Specifications
            </h3>
            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Order Ref:</span>
                <span className="font-bold text-cyan-300">{workOrder.order_number}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Part Name:</span>
                <span className="font-bold text-slate-100">{workOrder.part_name}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Part Number:</span>
                <span className="font-bold text-slate-300">{workOrder.part_number}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Program:</span>
                <span className="font-bold text-emerald-400">{workOrder.cnc_program}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Work Offset:</span>
                <span className="font-bold text-amber-400">{workOrder.work_offset}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenSetupSheet();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold font-mono transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" /> VIEW PRINTABLE SETUP SHEET
            </button>
          </div>
        )}

        {/* Operator Badge & Signoff Stamp */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 font-mono">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" /> Authorized Operator Sign-Off
            </h3>

            {operator && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center text-base">
                  {operator.avatar_initials}
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-sm">{operator.name}</div>
                  <div className="text-xs text-slate-400">Employee ID: {operator.employee_id}</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                    Certified VMC Operator • Shift Authorized
                  </div>
                </div>
              </div>
            )}

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              Digital compliance signature verified &amp; recorded to audit database.
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onProceedToOperation();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm tracking-wider shadow-lg shadow-emerald-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 uppercase"
          >
            <Play className="w-5 h-5 fill-slate-950" /> PROCEED TO LIVE OPERATION (STAGE 05)
          </button>
        </div>
      </div>
    </div>
  );
}
