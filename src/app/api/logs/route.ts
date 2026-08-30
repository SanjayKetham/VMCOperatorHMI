import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const logs = db
      .prepare(
        `SELECT l.*, o.name as operator_name, o.employee_id
         FROM audit_log l
         LEFT JOIN operators o ON l.operator_id = o.id
         ORDER BY l.timestamp DESC
         LIMIT 100`
      )
      .all();

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("Audit log GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
