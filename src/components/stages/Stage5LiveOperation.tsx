"use client";

import React, { useEffect, useState } from "react";
import { useHMIStore } from "@/store/hmi-store";
import { soundEngine } from "@/lib/audio";
import DigitalTwinCanvas from "@/components/DigitalTwinCanvas";
import Gauge from "@/components/ui/Gauge";
import {
  Play,
  Pause,
  Square,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Activity,
  Terminal
} from "lucide-react";

interface Stage5Props {
  activeFaults: string[];
}

const GCODE_PROGRAM = [
  "O8004 (HYDRAULIC MANIFOLD BLOCK - FINISH)",
  "G21 G90 G40 G80 G49 (METRIC / ABSOLUTE)",
  "G28 G91 Z0.0 (RETRACT SPINDLE Z)",
  "T01 M06 (FACE MILL Ø63mm)",
  "G54 G00 X-80.0 Y-80.0 S4500 M03",
  "M08 (COOLANT ON - 18 BAR)",
  "G43 H01 Z5.0",
  "G01 Z-2.5 F800",
  "G01 X80.0 F1250",
  "G01 Y80.0 F1250",
  "G01 X-80.0 F1250",
  "T02 M06 (END MILL Ø16mm)",
  "G00 X0.0 Y0.0 S7200 M03",
  "G01 Z-12.0 F950",
  "G02 X20.0 Y0.0 I10.0 J0.0 F1100",
  "G01 Z-25.0 F850",
  "T03 M06 (DRILL Ø8.5mm)",
  "G81 Z-20.0 R3.0 F450",
  "T05 M06 (TAP M10x1.5)",
  "G84 Z-18.0 R5.0 F750",
  "M09 (COOLANT OFF)",
  "G28 G91 Z0.0 M05",
  "M30 (PROGRAM END)",
];

export default function Stage5LiveOperation({ activeFaults }: Stage5Props) {
  const { workOrder, requiredTools, progress, setProgress } = useHMIStore();

  const [status, setStatus] = useState<"READY" | "RUNNING" | "PAUSED" | "STOPPED">("READY");
  const [spindleRpm, setSpindleRpm] = useState(0);
  const [feedRate, setFeedRate] = useState(0);
  const [coolantBar, setCoolantBar] = useState(0);
  const [spindleLoad, setSpindleLoad] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeGCodeLine, setActiveGCodeLine] = useState(0);

  const [feedOverride, setFeedOverride] = useState(100);
  const [spindleOverride, setSpindleOverride] = useState(100);
  const [partsCompleted, setPartsCompleted] = useState(1);

  const [coords, setCoords] = useState({ x: -40, y: -40, z: 25 });
  const [activeToolIndex, setActiveToolIndex] = useState(0);

  // Interlock check
  const hasInterlockFault = activeFaults.length > 0;

  // Auto halt if fault injected while running
  useEffect(() => {
    if (hasInterlockFault && status === "RUNNING") {
      setStatus("STOPPED");
      setSpindleRpm(0);
      setFeedRate(0);
      setCoolantBar(0);
      setSpindleLoad(0);
      soundEngine.stopSpindleSound();
      soundEngine.playAlarm();
    }
  }, [hasInterlockFault, status]);

  // Simulation step timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (status === "RUNNING") {
      const targetRpm = Math.round(4500 * (spindleOverride / 100));
      const targetFeed = Math.round(1250 * (feedOverride / 100));

      setSpindleRpm((prev) => Math.min(targetRpm, prev + 250));
      setFeedRate(targetFeed);
      setCoolantBar(18);
      setSpindleLoad(38 + Math.floor(Math.random() * 8));

      soundEngine.startSpindleSound(targetRpm);

      timer = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            setStatus("READY");
            setSpindleRpm(0);
            setFeedRate(0);
            setCoolantBar(0);
            setSpindleLoad(0);
            soundEngine.stopSpindleSound();
            soundEngine.playCheck();
            setPartsCompleted((p) => p + 1);
            return 0;
          }
          return prev + 1.5;
        });

        setActiveGCodeLine((prev) => (prev + 1) % GCODE_PROGRAM.length);

        // Tool carousel switcher
        setActiveToolIndex((prev) => {
          if (Math.random() < 0.1 && requiredTools.length > 0) {
            return (prev + 1) % requiredTools.length;
          }
          return prev;
        });

        // Coordinates jitter simulation
        setCoords({
          x: Math.sin(Date.now() / 300) * 45,
          y: Math.cos(Date.now() / 300) * 45,
          z: Math.max(-25, 25 - (progressPercent / 100) * 50),
        });
      }, 300);
    } else {
      soundEngine.stopSpindleSound();
    }

    return () => clearInterval(timer);
  }, [status, spindleOverride, feedOverride, requiredTools.length, progressPercent]);

  const handleStart = () => {
    if (hasInterlockFault) {
      soundEngine.playAlarm();
      return;
    }
    soundEngine.playClick();
    setStatus("RUNNING");
  };

  const handlePause = () => {
    soundEngine.playClick();
    setStatus("PAUSED");
    setSpindleRpm(0);
    setFeedRate(0);
    setCoolantBar(0);
    setSpindleLoad(0);
  };

  const handleStop = () => {
    soundEngine.playClick();
    setStatus("STOPPED");
    setSpindleRpm(0);
    setFeedRate(0);
    setCoolantBar(0);
    setSpindleLoad(0);
    setProgressPercent(0);
  };

  const handleEStop = () => {
    soundEngine.playAlarm();
    setStatus("STOPPED");
    setSpindleRpm(0);
    setFeedRate(0);
    setCoolantBar(0);
    setSpindleLoad(0);
    setProgressPercent(0);
  };

  const activeTool = requiredTools[activeToolIndex] || requiredTools[0] || null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto select-none">
      {/* Active Fault Alert Banner */}
      {hasInterlockFault && (
        <div className="bg-rose-950/90 border-2 border-rose-600 rounded-2xl p-4 flex items-center justify-between text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.3)] animate-pulse font-mono">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <div>
              <div className="font-extrabold text-sm uppercase">SAFETY INTERLOCK FAULT ACTIVE</div>
              <div className="text-xs text-rose-300">
                Cycle start inhibited. Open Fault Simulator in header to resolve machine faults.
              </div>
            </div>
          </div>
          <span className="bg-rose-600 text-slate-950 px-3 py-1 rounded font-black text-xs">
            LOCKED
          </span>
        </div>
      )}

      {/* Main Digital Twin Visualizer & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Canvas & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <DigitalTwinCanvas
            isRunning={status === "RUNNING"}
            isPaused={status === "PAUSED"}
            spindleRpm={spindleRpm}
            activeTool={activeTool}
            progressPercent={progressPercent}
            coords={coords}
          />

          {/* Industrial Machine Control Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* START CYCLE */}
                <button
                  disabled={status === "RUNNING" || hasInterlockFault}
                  onClick={handleStart}
                  className={`px-5 py-3 rounded-xl font-mono text-xs font-black flex items-center gap-2 transition-all shadow-lg uppercase ${
                    status === "RUNNING"
                      ? "bg-emerald-600 text-slate-950 shadow-emerald-500/30"
                      : hasInterlockFault
                      ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 active:scale-95"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" /> CYCLE START
                </button>

                {/* FEED HOLD */}
                <button
                  disabled={status !== "RUNNING"}
                  onClick={handlePause}
                  className={`px-4 py-3 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all uppercase ${
                    status === "PAUSED"
                      ? "bg-amber-600 text-slate-950"
                      : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 disabled:opacity-50"
                  }`}
                >
                  <Pause className="w-4 h-4" /> FEED HOLD
                </button>

                {/* STOP */}
                <button
                  disabled={status === "READY" || status === "STOPPED"}
                  onClick={handleStop}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-2 transition-all uppercase disabled:opacity-50"
                >
                  <Square className="w-4 h-4 text-slate-400" /> STOP
                </button>
              </div>

              {/* EMERGENCY STOP PALM BUTTON */}
              <button
                onClick={handleEStop}
                className="px-6 py-3 rounded-xl bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-mono font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40 border-2 border-rose-400 active:scale-95 uppercase tracking-wider"
              >
                <ShieldAlert className="w-5 h-5" /> E-STOP
              </button>
            </div>

            {/* Overrides Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Feed Rate Override</span>
                  <span className="font-bold text-cyan-400">{feedOverride}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={feedOverride}
                  onChange={(e) => setFeedOverride(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Spindle Speed Override</span>
                  <span className="font-bold text-amber-400">{spindleOverride}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={spindleOverride}
                  onChange={(e) => setSpindleOverride(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Telemetry Gauges & G-Code Console */}
        <div className="space-y-4">
          {/* Gauges Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Gauge label="Spindle Speed" value={spindleRpm} max={12000} unit="RPM" color="cyan" />
            <Gauge label="Feed Speed" value={feedRate} max={3000} unit="mm/min" color="emerald" />
            <Gauge label="Coolant Pressure" value={coolantBar} max={30} unit="BAR" color="cyan" />
            <Gauge label="Spindle Load" value={spindleLoad} max={100} unit="%" color="amber" />
          </div>

          {/* Active Tool Badge */}
          {activeTool && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs">
              <div>
                <div className="text-slate-400 text-[10px]">ACTIVE CUTTER</div>
                <div className="font-bold text-cyan-300">
                  {activeTool.tool_number} — {activeTool.tool_type}
                </div>
              </div>
              <span className="bg-slate-950 px-2 py-1 rounded text-emerald-400 font-bold border border-slate-800">
                {activeTool.diameter}
              </span>
            </div>
          )}

          {/* Job Counter & Progress Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cycle Progress</span>
              <span className="font-bold text-emerald-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Target Batch: {workOrder?.quantity || 12} PCS</span>
              <span className="text-slate-100 font-bold">Finished: {partsCompleted} PCS</span>
            </div>
          </div>

          {/* G-Code Streamer Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800 pb-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> Live G-Code Streamer
            </div>
            <div className="h-32 overflow-y-auto space-y-1 text-[11px] font-mono">
              {GCODE_PROGRAM.map((line, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    idx === activeGCodeLine
                      ? "bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400"
                      : "text-slate-500"
                  }`}
                >
                  <span className="text-[9px] text-slate-600 mr-2">{(idx + 1).toString().padStart(2, "0")}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
