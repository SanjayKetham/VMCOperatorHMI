"use client";

import React from "react";
import { RequiredTool } from "@/lib/types";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import { Wrench, CheckCircle2, Check, ArrowRight, Lock, Disc, Layers } from "lucide-react";

interface Stage2Props {
  tools: RequiredTool[];
  onConfirmTool: (toolId: string) => void;
  onNextStage: () => void;
}

export default function Stage2RequiredTools({
  tools,
  onConfirmTool,
  onNextStage,
}: Stage2Props) {
  const { progress, allToolsConfirmed, setProgress } = useHMIStore();
  const toolsState = progress?.tools_state || {};

  const confirmedCount = tools.filter((t) => toolsState[t.id]).length;
  const isAllConfirmed = allToolsConfirmed();

  const handleConfirmAll = () => {
    if (!progress) return;
    soundEngine.playCheck();
    const allState: Record<string, boolean> = {};
    tools.forEach((t) => {
      allState[t.id] = true;
    });
    setProgress({
      ...progress,
      tools_state: allState,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded font-mono font-bold text-xs uppercase tracking-wider">
              Stage 02
            </span>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Tool Carousel Loading &amp; Offset Verification
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Verify tool numbers, geometry parameters, and height offsets (H-codes) loaded in pockets.
          </p>
        </div>

        {/* Progress & Shortcut */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-400 uppercase">Tools Loaded</div>
              <div className="text-base font-extrabold text-cyan-400">
                {confirmedCount} / {tools.length} <span className="text-xs text-slate-400">Verified</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
              {Math.round((confirmedCount / (tools.length || 1)) * 100)}%
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

      {/* Tool Table / Carousel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const isConfirmed = !!toolsState[tool.id];

          return (
            <div
              key={tool.id}
              onClick={() => {
                if (!isConfirmed) {
                  soundEngine.playCheck();
                  onConfirmTool(tool.id);
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
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 font-mono font-extrabold text-cyan-300 flex items-center justify-center text-xs">
                      {tool.tool_number}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      Pocket P0{tool.sort_order}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    {tool.diameter}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-cyan-400" /> {tool.tool_type}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] flex justify-between items-center text-slate-300">
                  <span>Offset Register:</span>
                  <span className="font-bold text-emerald-400">{tool.length_offset}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={isConfirmed}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isConfirmed) {
                    soundEngine.playCheck();
                    onConfirmTool(tool.id);
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
                    TOOL LOADED &amp; VERIFIED
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    VERIFY TOOL CAROUSEL
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
              <CheckCircle2 className="w-4 h-4" /> All {tools.length} carousel tools verified. Ready for workpiece setup.
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Safety Interlock: Verify remaining {tools.length - confirmedCount} tools to unlock next stage.
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
          PROCEED TO STAGE 03: WORKPIECE SETUP <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
