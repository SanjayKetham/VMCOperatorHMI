import { create } from "zustand";
import { Operator, WorkOrder, MachineCheck, RequiredTool, WorkpieceStep, OperatorProgress, StageId } from "@/lib/types";

interface HMIState {
  operator: Operator | null;
  workOrder: WorkOrder | null;
  machineChecks: MachineCheck[];
  requiredTools: RequiredTool[];
  workpieceSteps: WorkpieceStep[];
  progress: OperatorProgress | null;
  currentStage: StageId;
  isLoading: boolean;
  error: string | null;
  elapsedSeconds: number;

  setOperator: (op: Operator | null) => void;
  setWorkOrder: (wo: WorkOrder) => void;
  setMachineChecks: (checks: MachineCheck[]) => void;
  setRequiredTools: (tools: RequiredTool[]) => void;
  setWorkpieceSteps: (steps: WorkpieceStep[]) => void;
  setProgress: (progress: OperatorProgress) => void;
  setCurrentStage: (stage: StageId) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setElapsed: (seconds: number) => void;

  confirmCheck: (checkKey: string) => void;
  confirmTool: (toolId: string) => void;
  confirmWorkpiece: (stepKey: string) => void;

  allChecksConfirmed: () => boolean;
  allToolsConfirmed: () => boolean;
  allWorkpieceConfirmed: () => boolean;
}

export const useHMIStore = create<HMIState>((set, get) => ({
  operator: null,
  workOrder: null,
  machineChecks: [],
  requiredTools: [],
  workpieceSteps: [],
  progress: null,
  currentStage: 1,
  isLoading: false,
  error: null,
  elapsedSeconds: 0,

  setOperator: (op) => set({ operator: op }),
  setWorkOrder: (wo) => set({ workOrder: wo }),
  setMachineChecks: (checks) => set({ machineChecks: checks }),
  setRequiredTools: (tools) => set({ requiredTools: tools }),
  setWorkpieceSteps: (steps) => set({ workpieceSteps: steps }),
  setProgress: (progress) => set({ progress, currentStage: progress.current_stage as StageId }),
  setCurrentStage: (stage) => set({ currentStage: stage }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setElapsed: (seconds) => set({ elapsedSeconds: seconds }),

  confirmCheck: (checkKey) => {
    const { progress } = get();
    if (!progress) return;
    const updated = { ...progress.machine_checks_state, [checkKey]: true };
    set({ progress: { ...progress, machine_checks_state: updated } });
  },

  confirmTool: (toolId) => {
    const { progress } = get();
    if (!progress) return;
    const updated = { ...progress.tools_state, [toolId]: true };
    set({ progress: { ...progress, tools_state: updated } });
  },

  confirmWorkpiece: (stepKey) => {
    const { progress } = get();
    if (!progress) return;
    const updated = { ...progress.workpiece_state, [stepKey]: true };
    set({ progress: { ...progress, workpiece_state: updated } });
  },

  allChecksConfirmed: () => {
    const { machineChecks, progress } = get();
    if (!progress || machineChecks.length === 0) return false;
    return machineChecks.every((c) => progress.machine_checks_state[c.check_key]);
  },

  allToolsConfirmed: () => {
    const { requiredTools, progress } = get();
    if (!progress || requiredTools.length === 0) return false;
    return requiredTools.every((t) => progress.tools_state[t.id]);
  },

  allWorkpieceConfirmed: () => {
    const { workpieceSteps, progress } = get();
    if (!progress || workpieceSteps.length === 0) return false;
    return workpieceSteps.every((s) => progress.workpiece_state[s.step_key]);
  },
}));
