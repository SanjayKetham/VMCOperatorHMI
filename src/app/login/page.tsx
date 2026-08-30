"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { soundEngine } from "@/lib/audio";
import { Cpu, Lock, User, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState("VMC-001");
  const [password, setPassword] = useState("operator123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    soundEngine.playClick();

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        soundEngine.playAlarm();
        return;
      }

      soundEngine.playCheck();
      router.push("/");
    } catch (err) {
      setError("Network error. Please try again.");
      soundEngine.playAlarm();
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (empId: string, pass: string) => {
    soundEngine.playClick();
    setEmployeeId(empId);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-2">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-50 font-mono">
            VMC-400 <span className="text-cyan-400">PRO</span> HMI
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Industrial Operator Terminal Authentication
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          {error && (
            <div className="bg-rose-950/80 border border-rose-600/80 text-rose-200 p-3 rounded-xl text-center font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-400 uppercase font-bold text-[10px]">
              Employee Badge ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. VMC-001"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-bold"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 uppercase font-bold text-[10px]">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-bold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN TO TERMINAL"} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Preset Operator Badges for Evaluator */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 text-center uppercase tracking-wider">
            Quick Evaluator Login Presets
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              onClick={() => quickFill("VMC-001", "operator123")}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-cyan-300">VMC-001</div>
              <div className="text-[10px] text-slate-400">Rajesh (Operator)</div>
            </button>

            <button
              onClick={() => quickFill("VMC-002", "admin123")}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-emerald-400">VMC-002</div>
              <div className="text-[10px] text-slate-400">Priya (Supervisor)</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
