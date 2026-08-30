export interface Operator {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  avatar_initials: string;
}

export interface WorkOrder {
  id: string;
  order_number: string;
  part_name: string;
  part_number: string;
  material: string;
  drawing_revision: string;
  cnc_program: string;
  cnc_program_revision: string;
  fixture: string;
  work_offset: string;
  operation_name: string;
  quantity: number;
}

export interface MachineCheck {
  id: string;
  work_order_id: string;
  check_key: string;
  label: string;
  description: string;
  sort_order: number;
  category: string;
  icon: string;
}

export interface RequiredTool {
  id: string;
  work_order_id: string;
  tool_number: string;
  tool_type: string;
  description: string;
  diameter: string;
  length_offset: string;
  sort_order: number;
}

export interface WorkpieceStep {
  id: string;
  work_order_id: string;
  step_key: string;
  label: string;
  description: string;
  detail: string;
  sort_order: number;
  category: string;
}

export interface OperatorProgress {
  id: string;
  operator_id: string;
  work_order_id: string;
  current_stage: number;
  machine_checks_state: Record<string, boolean>;
  tools_state: Record<string, boolean>;
  workpiece_state: Record<string, boolean>;
  operation_status: "READY" | "RUNNING" | "STOPPED";
  started_at: string;
  completed_at: string | null;
}

export interface AuditLogEntry {
  id: string;
  operator_id: string;
  work_order_id: string;
  action: string;
  stage: number;
  detail: string;
  timestamp: string;
}

export const STAGES = [
  { id: 1, key: "machine_checks", label: "Machine Checks", shortLabel: "Checks" },
  { id: 2, key: "required_tools", label: "Required Tools", shortLabel: "Tools" },
  { id: 3, key: "workpiece_setup", label: "Workpiece Setup", shortLabel: "Workpiece" },
  { id: 4, key: "ready_review", label: "Ready Review", shortLabel: "Review" },
  { id: 5, key: "operation", label: "Operation", shortLabel: "Run" },
] as const;

export type StageId = 1 | 2 | 3 | 4 | 5;
