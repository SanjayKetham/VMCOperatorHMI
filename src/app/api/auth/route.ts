import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { employee_id, password } = await req.json();
    if (!employee_id || !password) {
      return NextResponse.json({ error: "Employee ID and password are required" }, { status: 400 });
    }

    const db = getDb();
    const operator = db
      .prepare("SELECT * FROM operators WHERE employee_id = ?")
      .get(employee_id) as Record<string, unknown> | undefined;

    if (!operator) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = bcryptjs.compareSync(password, operator.password_hash as string);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
    db.prepare("INSERT INTO sessions (id, operator_id, expires_at) VALUES (?, ?, ?)").run(
      sessionId,
      operator.id,
      expiresAt
    );

    const response = NextResponse.json({
      session_id: sessionId,
      operator: {
        id: operator.id,
        employee_id: operator.employee_id,
        name: operator.name,
        role: operator.role,
        avatar_initials: operator.avatar_initials,
      },
    });

    response.cookies.set("vmc_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
