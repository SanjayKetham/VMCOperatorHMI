"use client";

import React, { useEffect, useState } from "react";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import {
  Volume2,
  VolumeX,
  FileText,
  ShieldAlert,
  RotateCcw,
  LogOut,
  Clock,
  Cpu,
  User,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface HeaderProps {
  onOpenAuditLog: () => void;
  onOpenSetupSheet: () => void;
  onOpenFaultSim: () => void;
  onResetProgress: () => void;
  onLogout: () => void;
  activeFaults?: string[];
}

export default function Header({
  onOpenAuditLog,
  onOpenSetupSheet,
  onOpenFaultSim,
  onResetProgress,
  onLogout,
  activeFaults = [],
}: HeaderProps) {
  const { operator, workOrder, elapsedSeconds, setElapsed } = useHMIStore();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(elapsedSeconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [elapsedSeconds, setElapsed]);

  const toggleSound = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
    if (!nextMute) soundEngine.playClick();
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-slate-100 select-none shadow-md">
      {/* Brand & System Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-slate-50 font-mono">
              VMC-400 <span className="text-cyan-400">PRO</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 tracking-widest uppercase">
              ONLINE
            </span>
            {activeFaults.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 tracking-widest uppercase flex items-center gap-1 animate-bounce">
                <AlertTriangle className="w-3 h-3" /> FAULT ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            CNC Operator Startup Guidance &amp; Telemetry HMI
          </p>
        </div>
      </div>

      {/* Active Workorder Info */}
      {workOrder && (
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] uppercase tracking-wider">Job Order</div>
            <div className="font-mono font-bold text-cyan-300">{workOrder.order_number}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase tracking-wider">Part</div>
            <div className="font-semibold text-slate-200">{workOrder.part_name}</div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <div className="text-slate-400 text-[10px] uppercase tracking-wider">Material / Offset</div>
            <div className="font-mono text-slate-300">
              {workOrder.material} | <span className="text-emerald-400">{workOrder.work_offset.split(" ")[0]}</span>
            </div>
          </div>
        </div>
      )}

      {/* Operator & Quick Controls */}
      <div className="flex items-center gap-3">
        {/* Operator Badge */}
        {operator && (
          <div className="flex items-center gap-2.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 font-bold flex items-center justify-center text-xs">
              {operator.avatar_initials || "OP"}
            </div>
            <div className="text-xs hidden sm:block">
              <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                {operator.name}
                <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                  {operator.employee_id}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-cyan-400" /> Shift: {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleSound}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? "bg-rose-950/40 border-rose-700/50 text-rose-400 hover:bg-rose-900/40"
                : "bg-slate-900 border-slate-800 text-cyan-400 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSetupSheet();
            }}
            title="Setup Sheet"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Setup Sheet</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenAuditLog();
            }}
            title="Audit Trail Log"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 text-xs font-medium transition-colors"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenFaultSim();
            }}
            title="Safety Fault Simulator"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              activeFaults.length > 0
                ? "bg-rose-950/80 border-rose-600 text-rose-200 hover:bg-rose-900"
                : "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden md:inline">Fault Sim</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onResetProgress();
            }}
            title="Reset Workflow Sequence"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800 hover:border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onLogout();
            }}
            title="Logout Operator"
            className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-400 hover:bg-rose-900/50 hover:border-rose-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
