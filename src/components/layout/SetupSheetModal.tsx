"use client";

import React from "react";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import { X, Printer, FileText, CheckCircle, Wrench, Shield, Cpu } from "lucide-react";

interface SetupSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SetupSheetModal({ isOpen, onClose }: SetupSheetModalProps) {
  const { workOrder, requiredTools, workpieceSteps } = useHMIStore();

  if (!isOpen || !workOrder) return null;

  const handlePrint = () => {
    soundEngine.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:w-full print:border-none print:bg-white print:text-black">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Official CNC Machine Setup Sheet
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Job Specification &amp; Tooling Document — Printable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-600/20"
            >
              <Printer className="w-4 h-4" /> Print Setup Sheet
            </button>
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
        </div>

        {/* Setup Sheet Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-200 print:text-black font-sans">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-700 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg font-mono">
                <Cpu className="w-5 h-5" /> VMC-400 PRO SHOPFLOOR SPECIFICATION
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-100 print:text-black mt-1">
                {workOrder.part_name}
              </h1>
              <p className="text-xs text-slate-400 print:text-slate-600 font-mono">
                Part No: {workOrder.part_number} | Drawing Rev: {workOrder.drawing_revision}
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded font-bold text-sm">
                ORDER #{workOrder.order_number}
              </span>
              <p className="text-xs text-slate-400 mt-2">Target Quantity: {workOrder.quantity} PCS</p>
            </div>
          </div>

          {/* Job Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Raw Material</span>
              <p className="font-bold text-slate-100">{workOrder.material}</p>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">CNC Program &amp; Rev</span>
              <p className="font-bold text-emerald-400">
                {workOrder.cnc_program} ({workOrder.cnc_program_revision})
              </p>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Work Offset (Datum)</span>
              <p className="font-bold text-cyan-400">{workOrder.work_offset}</p>
            </div>
          </div>

          {/* Fixture & Clamping Specs */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Wrench className="w-4 h-4" /> Fixture &amp; Clamping Specification
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {workOrder.fixture}
            </p>
          </div>

          {/* Tooling Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              Tool Carousel Loading Table ({requiredTools.length} Tools)
            </h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Pocket</th>
                    <th className="py-2.5 px-4">Tool Type</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Diameter</th>
                    <th className="py-2.5 px-4">Length Offset</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {requiredTools.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-4 font-bold text-cyan-400">{t.tool_number}</td>
                      <td className="py-2 px-4 text-slate-200 font-semibold">{t.tool_type}</td>
                      <td className="py-2 px-4 text-slate-300">{t.description}</td>
                      <td className="py-2 px-4 text-amber-300">{t.diameter}</td>
                      <td className="py-2 px-4 text-emerald-400">{t.length_offset}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setup Verification Checklist */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
              Workpiece Setup Steps &amp; Tolerances
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {workpieceSteps.map((step) => (
                <div key={step.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold">{step.label}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{step.description}</p>
                  {step.detail && (
                    <p className="text-emerald-400 text-[10px] mt-1 italic">{step.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex justify-between items-center text-xs text-slate-400 print:hidden">
          <span>Approved for Production Run</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
