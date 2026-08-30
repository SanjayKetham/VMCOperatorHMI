import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("vmc_session")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = getDb();
    const session = db
      .prepare(
        `SELECT s.*, o.id as op_id, o.employee_id, o.name, o.role, o.avatar_initials
         FROM sessions s JOIN operators o ON s.operator_id = o.id
         WHERE s.id = ? AND s.expires_at > datetime('now')`
      )
      .get(sessionId) as Record<string, unknown> | undefined;

    if (!session) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json({
      operator: {
        id: session.op_id,
        employee_id: session.employee_id,
        name: session.name,
        role: session.role,
        avatar_initials: session.avatar_initials,
      },
    });
  } catch (err) {
    console.error("Session check error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get("vmc_session")?.value;
    if (sessionId) {
      const db = getDb();
      db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
    }
    const response = NextResponse.json({ success: true });
    response.cookies.delete("vmc_session");
    return response;
  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
