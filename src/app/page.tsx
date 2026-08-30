"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHMIStore } from "@/store/hmi-store";
import { StageId } from "@/lib/types";
import Header from "@/components/layout/Header";
import StageNav from "@/components/layout/StageNav";
import AuditLogModal from "@/components/layout/AuditLogModal";
import SetupSheetModal from "@/components/layout/SetupSheetModal";
import FaultSimulatorModal from "@/components/layout/FaultSimulatorModal";

import Stage1MachineChecks from "@/components/stages/Stage1MachineChecks";
import Stage2RequiredTools from "@/components/stages/Stage2RequiredTools";
import Stage3WorkpieceSetup from "@/components/stages/Stage3WorkpieceSetup";
import Stage4ReadyReview from "@/components/stages/Stage4ReadyReview";
import Stage5LiveOperation from "@/components/stages/Stage5LiveOperation";
import { soundEngine } from "@/lib/audio";
import { Cpu } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    operator,
    workOrder,
    machineChecks,
    requiredTools,
    workpieceSteps,
    progress,
    currentStage,
    isLoading,
    setOperator,
    setWorkOrder,
    setMachineChecks,
    setRequiredTools,
    setWorkpieceSteps,
    setProgress,
    setCurrentStage,
    setLoading,
    confirmCheck,
    confirmTool,
    confirmWorkpiece,
  } = useHMIStore();

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSetupSheetOpen, setIsSetupSheetOpen] = useState(false);
  const [isFaultSimOpen, setIsFaultSimOpen] = useState(false);
  const [activeFaults, setActiveFaults] = useState<string[]>([]);

  // 1. Initial Session & Data Fetching
  const loadData = async () => {
    setLoading(true);
    try {
      // Check session
      const sessionRes = await fetch("/api/session");
      if (!sessionRes.ok) {
        router.push("/login");
        return;
      }
      const sessionData = await sessionRes.json();
      setOperator(sessionData.operator);

      // Load progress and workorder
      const progressRes = await fetch("/api/progress");
      if (progressRes.ok) {
        const data = await progressRes.json();
        setWorkOrder(data.workOrder);
        setMachineChecks(data.machineChecks);
        setRequiredTools(data.requiredTools);
        setWorkpieceSteps(data.workpieceSteps);
        if (data.progress) {
          setProgress(data.progress);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Sync state updates to persistent backend API
  const syncProgress = async (
    stage: StageId,
    checksState: Record<string, boolean>,
    toolsState: Record<string, boolean>,
    workpieceState: Record<string, boolean>,
    actionName?: string,
    actionDetail?: string
  ) => {
    if (!progress) return;
    try {
      await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          progress_id: progress.id,
          current_stage: stage,
          machine_checks_state: checksState,
          tools_state: toolsState,
          workpiece_state: workpieceState,
          action: actionName,
          detail: actionDetail,
        }),
      });
    } catch (e) {
      console.error("Sync error:", e);
    }
  };

  const handleSelectStage = (stageId: StageId) => {
    setCurrentStage(stageId);
    if (progress) {
      syncProgress(
        stageId,
        progress.machine_checks_state,
        progress.tools_state,
        progress.workpiece_state,
        "STAGE_TRANSITION",
        `Operator navigated to Stage ${stageId}`
      );
    }
  };

  // Check confirmations
  const handleConfirmCheck = (key: string) => {
    confirmCheck(key);
    if (progress) {
      const updatedChecks = { ...progress.machine_checks_state, [key]: true };
      syncProgress(
        currentStage,
        updatedChecks,
        progress.tools_state,
        progress.workpiece_state,
        "CHECK_CONFIRMED",
        `Confirmed machine check: ${key}`
      );
    }
  };

  // Tool confirmations
  const handleConfirmTool = (toolId: string) => {
    confirmTool(toolId);
    if (progress) {
      const updatedTools = { ...progress.tools_state, [toolId]: true };
      syncProgress(
        currentStage,
        progress.machine_checks_state,
        updatedTools,
        progress.workpiece_state,
        "TOOL_CONFIRMED",
        `Verified carousel tool ID: ${toolId}`
      );
    }
  };

  // Workpiece step confirmations
  const handleConfirmWorkpiece = (stepKey: string) => {
    confirmWorkpiece(stepKey);
    if (progress) {
      const updatedWorkpiece = { ...progress.workpiece_state, [stepKey]: true };
      syncProgress(
        currentStage,
        progress.machine_checks_state,
        progress.tools_state,
        updatedWorkpiece,
        "WORKPIECE_CONFIRMED",
        `Completed workpiece setup step: ${stepKey}`
      );
    }
  };

  // Reset Progress
  const handleResetProgress = async () => {
    if (!confirm("Are you sure you want to reset the entire startup workflow sequence back to Stage 1?")) {
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/progress", { method: "DELETE" });
      await loadData();
      setCurrentStage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/session", { method: "DELETE" });
    setOperator(null);
    router.push("/login");
  };

  // Fault Simulator Toggles
  const handleToggleFault = (faultKey: string) => {
    if (activeFaults.includes(faultKey)) {
      setActiveFaults(activeFaults.filter((f) => f !== faultKey));
    } else {
      setActiveFaults([...activeFaults, faultKey]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-mono space-y-3">
        <Cpu className="w-10 h-10 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400">INITIALIZING VMC TERMINAL TELEMETRY...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <Header
        onOpenAuditLog={() => setIsAuditOpen(true)}
        onOpenSetupSheet={() => setIsSetupSheetOpen(true)}
        onOpenFaultSim={() => setIsFaultSimOpen(true)}
        onResetProgress={handleResetProgress}
        onLogout={handleLogout}
        activeFaults={activeFaults}
      />

      {/* 5-Stage Stepper Navigation */}
      <StageNav
        currentStage={currentStage}
        onSelectStage={handleSelectStage}
      />

      {/* Main Active Stage View Container */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {currentStage === 1 && (
          <Stage1MachineChecks
            checks={machineChecks}
            onConfirmCheck={handleConfirmCheck}
            onNextStage={() => handleSelectStage(2)}
          />
        )}

        {currentStage === 2 && (
          <Stage2RequiredTools
            tools={requiredTools}
            onConfirmTool={handleConfirmTool}
            onNextStage={() => handleSelectStage(3)}
          />
        )}

        {currentStage === 3 && (
          <Stage3WorkpieceSetup
            steps={workpieceSteps}
            onConfirmStep={handleConfirmWorkpiece}
            onNextStage={() => handleSelectStage(4)}
          />
        )}

        {currentStage === 4 && (
          <Stage4ReadyReview
            onOpenSetupSheet={() => setIsSetupSheetOpen(true)}
            onProceedToOperation={() => handleSelectStage(5)}
          />
        )}

        {currentStage === 5 && (
          <Stage5LiveOperation activeFaults={activeFaults} />
        )}
      </main>

      {/* Modals */}
      <AuditLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      <SetupSheetModal
        isOpen={isSetupSheetOpen}
        onClose={() => setIsSetupSheetOpen(false)}
      />

      <FaultSimulatorModal
        isOpen={isFaultSimOpen}
        onClose={() => setIsFaultSimOpen(false)}
        activeFaults={activeFaults}
        onToggleFault={handleToggleFault}
        onClearAllFaults={() => setActiveFaults([])}
      />
    </div>
  );
}
