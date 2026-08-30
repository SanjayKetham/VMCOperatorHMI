"use client";

import React from "react";
import { STAGES, StageId } from "@/lib/types";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import { Check, Lock, ShieldCheck, Wrench, Box, ClipboardCheck, Play } from "lucide-react";

interface StageNavProps {
  currentStage: StageId;
  onSelectStage: (stageId: StageId) => void;
}

const STAGE_ICONS = [
  ShieldCheck,
  Wrench,
  Box,
  ClipboardCheck,
  Play,
];

export default function StageNav({ currentStage, onSelectStage }: StageNavProps) {
  const {
    allChecksConfirmed,
    allToolsConfirmed,
    allWorkpieceConfirmed,
  } = useHMIStore();

  const isStageUnlocked = (stageId: StageId): boolean => {
    if (stageId === 1) return true;
    if (stageId === 2) return allChecksConfirmed();
    if (stageId === 3) return allChecksConfirmed() && allToolsConfirmed();
    if (stageId === 4) return allChecksConfirmed() && allToolsConfirmed() && allWorkpieceConfirmed();
    if (stageId === 5) return allChecksConfirmed() && allToolsConfirmed() && allWorkpieceConfirmed();
    return false;
  };

  const isStageCompleted = (stageId: StageId): boolean => {
    if (stageId === 1) return allChecksConfirmed();
    if (stageId === 2) return allToolsConfirmed();
    if (stageId === 3) return allWorkpieceConfirmed();
    if (stageId === 4) return currentStage === 5;
    return false;
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between overflow-x-auto select-none">
      <div className="flex items-center gap-2 min-w-max w-full justify-between max-w-7xl mx-auto">
        {STAGES.map((stage, idx) => {
          const stageId = stage.id as StageId;
          const isActive = currentStage === stageId;
          const unlocked = isStageUnlocked(stageId);
          const completed = isStageCompleted(stageId);
          const Icon = STAGE_ICONS[idx];

          return (
            <React.Fragment key={stage.id}>
              {/* Connector line */}
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 min-w-[20px] max-w-[60px] transition-colors ${
                    isStageCompleted(STAGES[idx - 1].id as StageId)
                      ? "bg-emerald-500"
                      : "bg-slate-800"
                  }`}
                />
              )}

              {/* Stage Step Item */}
              <button
                disabled={!unlocked}
                onClick={() => {
                  if (unlocked) {
                    soundEngine.playClick();
                    onSelectStage(stageId);
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all relative ${
                  isActive
                    ? "bg-cyan-950/90 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-105"
                    : completed
                    ? "bg-emerald-950/40 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/40"
                    : unlocked
                    ? "bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600"
                    : "bg-slate-900/40 border-slate-800/80 text-slate-600 cursor-not-allowed opacity-60"
                }`}
              >
                {/* Badge Number / Icon */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                    isActive
                      ? "bg-cyan-500 text-slate-950"
                      : completed
                      ? "bg-emerald-500 text-slate-950"
                      : unlocked
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-900 text-slate-700 border border-slate-800"
                  }`}
                >
                  {completed ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : !unlocked ? (
                    <Lock className="w-3 h-3 text-slate-600" />
                  ) : (
                    stage.id
                  )}
                </div>

                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase font-mono text-slate-400 leading-none mb-0.5">
                    Stage 0{stage.id}
                  </span>
                  <span className="font-bold tracking-tight whitespace-nowrap flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 hidden sm:inline-block" />
                    {stage.label}
                  </span>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
