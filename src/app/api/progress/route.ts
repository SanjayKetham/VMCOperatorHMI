import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

function getOperatorFromSession(req: NextRequest) {
  const sessionId = req.cookies.get("vmc_session")?.value;
  if (!sessionId) return null;
  const db = getDb();
  const session = db
    .prepare(
      `SELECT o.id as operator_id FROM sessions s JOIN operators o ON s.operator_id = o.id
       WHERE s.id = ? AND s.expires_at > datetime('now')`
    )
    .get(sessionId) as { operator_id: string } | undefined;
  return session?.operator_id ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const operatorId = getOperatorFromSession(req);
    if (!operatorId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getDb();

    const workOrder = db.prepare("SELECT * FROM work_orders LIMIT 1").get() as Record<string, unknown>;
    if (!workOrder) {
      return NextResponse.json({ error: "No work order found" }, { status: 404 });
    }

    const machineChecks = db
      .prepare("SELECT * FROM machine_checks WHERE work_order_id = ? ORDER BY sort_order")
      .all(workOrder.id);

    const requiredTools = db
      .prepare("SELECT * FROM required_tools WHERE work_order_id = ? ORDER BY sort_order")
      .all(workOrder.id);

    const workpieceSteps = db
      .prepare("SELECT * FROM workpiece_steps WHERE work_order_id = ? ORDER BY sort_order")
      .all(workOrder.id);

    let progress = db
      .prepare("SELECT * FROM operator_progress WHERE operator_id = ? AND work_order_id = ? ORDER BY started_at DESC LIMIT 1")
      .get(operatorId, workOrder.id) as Record<string, unknown> | undefined;

    if (!progress) {
      const progressId = uuidv4();
      db.prepare(
        `INSERT INTO operator_progress (id, operator_id, work_order_id, current_stage, machine_checks_state, tools_state, workpiece_state, operation_status)
         VALUES (?, ?, ?, 1, '{}', '{}', '{}', 'READY')`
      ).run(progressId, operatorId, workOrder.id);

      db.prepare(
        "INSERT INTO audit_log (id, operator_id, work_order_id, action, stage, detail) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(uuidv4(), operatorId, workOrder.id as string, "SESSION_START", 1, "Operator began setup sequence");

      progress = db.prepare("SELECT * FROM operator_progress WHERE id = ?").get(progressId) as Record<string, unknown>;
    }

    return NextResponse.json({
      workOrder,
      machineChecks,
      requiredTools,
      workpieceSteps,
      progress: {
        ...progress,
        machine_checks_state: JSON.parse((progress!.machine_checks_state as string) || "{}"),
        tools_state: JSON.parse((progress!.tools_state as string) || "{}"),
        workpiece_state: JSON.parse((progress!.workpiece_state as string) || "{}"),
      },
    });
  } catch (err) {
    console.error("Progress GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const operatorId = getOperatorFromSession(req);
    if (!operatorId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { progress_id, current_stage, machine_checks_state, tools_state, workpiece_state, operation_status, action, detail } = body;

    const db = getDb();

    db.prepare(
      `UPDATE operator_progress
       SET current_stage = ?, machine_checks_state = ?, tools_state = ?, workpiece_state = ?, operation_status = ?,
           completed_at = CASE WHEN ? = 'STOPPED' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = ?`
    ).run(
      current_stage,
      JSON.stringify(machine_checks_state || {}),
      JSON.stringify(tools_state || {}),
      JSON.stringify(workpiece_state || {}),
      operation_status || "READY",
      operation_status || "READY",
      progress_id
    );

    if (action) {
      const workOrder = db.prepare("SELECT work_order_id FROM operator_progress WHERE id = ?").get(progress_id) as { work_order_id: string };
      db.prepare(
        "INSERT INTO audit_log (id, operator_id, work_order_id, action, stage, detail) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(uuidv4(), operatorId, workOrder.work_order_id, action, current_stage, detail || "");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Progress PUT error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const operatorId = getOperatorFromSession(req);
    if (!operatorId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getDb();
    const workOrder = db.prepare("SELECT * FROM work_orders LIMIT 1").get() as Record<string, unknown>;
    if (!workOrder) {
      return NextResponse.json({ error: "No work order found" }, { status: 404 });
    }

    db.prepare("DELETE FROM operator_progress WHERE operator_id = ? AND work_order_id = ?").run(operatorId, workOrder.id);

    db.prepare(
      "INSERT INTO audit_log (id, operator_id, work_order_id, action, stage, detail) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(uuidv4(), operatorId, workOrder.id as string, "SESSION_RESET", 0, "Operator reset the entire sequence");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Progress DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
