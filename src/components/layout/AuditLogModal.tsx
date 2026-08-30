"use client";

import React, { useEffect, useState } from "react";
import { soundEngine } from "@/lib/audio";
import { X, Clock, FileSpreadsheet, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";

interface AuditLogEntry {
  id: string;
  operator_id: string;
  operator_name?: string;
  employee_id?: string;
  work_order_id: string;
  action: string;
  stage: number;
  detail: string;
  timestamp: string;
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logs");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchLogs();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Operator Action &amp; Compliance Audit Log
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-time timestamped audit trail stored in persistent database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                fetchLogs();
              }}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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

        {/* Log Content Table */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No audit log entries recorded yet.</div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {logs.map((log) => {
                    const isAlert = log.action.includes("FAULT") || log.action.includes("STOP");
                    const isSuccess = log.action.includes("CONFIRM") || log.action.includes("START");

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-200">
                          {log.operator_name || "Operator"}{" "}
                          <span className="text-[10px] text-slate-500">({log.employee_id || "VMC-001"})</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-bold">
                            Stage {log.stage}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1 ${
                              isAlert
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : isSuccess
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            }`}
                          >
                            {isAlert && <ShieldAlert className="w-3 h-3" />}
                            {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-300">{log.detail}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-3 flex justify-between items-center text-xs text-slate-400">
          <span>Total Entries: {logs.length}</span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
