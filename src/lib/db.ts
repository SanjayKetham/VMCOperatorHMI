import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";

function getDbPath(): string {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpPath = path.join("/tmp", "vmc-hmi.db");
    const localDbPath = path.join(process.cwd(), "vmc-hmi.db");
    if (!fs.existsSync(tmpPath) && fs.existsSync(localDbPath)) {
      try {
        fs.copyFileSync(localDbPath, tmpPath);
      } catch (e) {
        console.warn("Could not copy seed database file to /tmp:", e);
      }
    }
    return tmpPath;
  }
  return path.join(process.cwd(), "vmc-hmi.db");
}

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    const dbPath = getDbPath();
    _db = new Database(dbPath);
    try {
      _db.pragma("journal_mode = WAL");
    } catch {
      _db.pragma("journal_mode = DELETE");
    }
    _db.pragma("foreign_keys = ON");
    initializeDb(_db);
  }
  return _db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS operators (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'operator',
      avatar_initials TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (operator_id) REFERENCES operators(id)
    );

    CREATE TABLE IF NOT EXISTS work_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      part_name TEXT NOT NULL,
      part_number TEXT NOT NULL,
      material TEXT NOT NULL,
      drawing_revision TEXT NOT NULL,
      cnc_program TEXT NOT NULL,
      cnc_program_revision TEXT NOT NULL,
      fixture TEXT NOT NULL,
      work_offset TEXT NOT NULL,
      operation_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS machine_checks (
      id TEXT PRIMARY KEY,
      work_order_id TEXT NOT NULL,
      check_key TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      category TEXT DEFAULT 'safety',
      icon TEXT,
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
    );

    CREATE TABLE IF NOT EXISTS required_tools (
      id TEXT PRIMARY KEY,
      work_order_id TEXT NOT NULL,
      tool_number TEXT NOT NULL,
      tool_type TEXT NOT NULL,
      description TEXT NOT NULL,
      diameter TEXT,
      length_offset TEXT,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
    );

    CREATE TABLE IF NOT EXISTS workpiece_steps (
      id TEXT PRIMARY KEY,
      work_order_id TEXT NOT NULL,
      step_key TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT NOT NULL,
      detail TEXT,
      sort_order INTEGER NOT NULL,
      category TEXT DEFAULT 'setup',
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
    );

    CREATE TABLE IF NOT EXISTS operator_progress (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL,
      work_order_id TEXT NOT NULL,
      current_stage INTEGER DEFAULT 1,
      machine_checks_state TEXT DEFAULT '{}',
      tools_state TEXT DEFAULT '{}',
      workpiece_state TEXT DEFAULT '{}',
      operation_status TEXT DEFAULT 'READY',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (operator_id) REFERENCES operators(id),
      FOREIGN KEY (work_order_id) REFERENCES work_orders(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      operator_id TEXT NOT NULL,
      work_order_id TEXT NOT NULL,
      action TEXT NOT NULL,
      stage INTEGER,
      detail TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const operatorCount = db.prepare("SELECT COUNT(*) as count FROM operators").get() as { count: number };
  if (operatorCount.count === 0) {
    seedData(db);
  }
}

function seedData(db: Database.Database) {
  const hash = bcryptjs.hashSync("operator123", 10);
  const operatorId = uuidv4();
  db.prepare(
    "INSERT INTO operators (id, employee_id, name, password_hash, role, avatar_initials) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(operatorId, "VMC-001", "Rajesh Kumar", hash, "operator", "RK");

  const hash2 = bcryptjs.hashSync("admin123", 10);
  const adminId = uuidv4();
  db.prepare(
    "INSERT INTO operators (id, employee_id, name, password_hash, role, avatar_initials) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(adminId, "VMC-002", "Priya Sharma", hash2, "supervisor", "PS");

  const woId = uuidv4();
  db.prepare(`
    INSERT INTO work_orders (id, order_number, part_name, part_number, material, drawing_revision,
      cnc_program, cnc_program_revision, fixture, work_offset, operation_name, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    woId, "WO-2024-0847", "Hydraulic Manifold Block", "HMB-4420-A",
    "Aluminium 6061-T6", "Rev C3", "PRG-4420-FINISH", "v2.7",
    "Custom 4-Jaw Chuck – Fixture F-112", "G54 (X0 Y0 Z+50.000)", "Finish Milling – Top Face & Ports", 12
  );

  const checks = [
    { key: "power_control", label: "Power & Control System", desc: "Verify main power breaker is ON, CNC controller is booted and responsive. Check spindle drive status indicator is green.", category: "power", icon: "Zap" },
    { key: "estop_released", label: "Emergency Stop Released", desc: "Confirm all E-stop buttons (panel and pendant) are released and reset. Verify E-stop circuit status shows CLEAR on controller.", category: "safety", icon: "ShieldAlert" },
    { key: "guard_door", label: "Guard Door & Interlocks", desc: "Close all safety guard doors. Verify interlock sensors engage — controller must show DOOR CLOSED status. Test door switch by opening slightly.", category: "safety", icon: "DoorClosed" },
    { key: "no_alarms", label: "Active Alarm Check", desc: "Review alarm history on CNC controller. Clear any residual alarms. Confirm zero active alarms and no pending warnings on status bar.", category: "diagnostics", icon: "AlertTriangle" },
    { key: "lubrication", label: "Lubrication System", desc: "Check way-lube reservoir level (must be above MIN line). Verify auto-lube pump cycles — observe pressure gauge pulse. Inspect slide-ways for oil film.", category: "fluids", icon: "Droplets" },
    { key: "coolant", label: "Coolant System Ready", desc: "Verify coolant tank level and concentration (6-8% emulsion). Test coolant pump — run for 10 sec and check nozzle flow. Inspect for leaks at fittings.", category: "fluids", icon: "Waves" },
    { key: "reference_return", label: "Reference Return Complete", desc: "Execute machine home / reference return on all axes (X, Y, Z). Confirm position counters reset to machine zero. Verify no axis following errors.", category: "motion", icon: "Home" },
  ];
  const insertCheck = db.prepare(
    "INSERT INTO machine_checks (id, work_order_id, check_key, label, description, sort_order, category, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  checks.forEach((c, i) =>
    insertCheck.run(uuidv4(), woId, c.key, c.label, c.desc, i + 1, c.category, c.icon)
  );

  const tools = [
    { num: "T01", type: "Face Mill", desc: "63mm Carbide Face Mill – 5 Insert", dia: "Ø63mm", offset: "H01 = 125.340" },
    { num: "T02", type: "End Mill", desc: "16mm 4-Flute Carbide End Mill", dia: "Ø16mm", offset: "H02 = 108.220" },
    { num: "T03", type: "End Mill", desc: "10mm 4-Flute Carbide End Mill", dia: "Ø10mm", offset: "H03 = 95.750" },
    { num: "T04", type: "Drill", desc: "8.5mm Carbide Drill (for M10 tap)", dia: "Ø8.5mm", offset: "H04 = 142.100" },
    { num: "T05", type: "Tap", desc: "M10 x 1.5 Spiral Flute Tap", dia: "M10x1.5", offset: "H05 = 88.600" },
    { num: "T06", type: "Chamfer Mill", desc: "90° Chamfer Mill – 12mm", dia: "Ø12mm", offset: "H06 = 76.430" },
  ];
  const insertTool = db.prepare(
    "INSERT INTO required_tools (id, work_order_id, tool_number, tool_type, description, diameter, length_offset, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  tools.forEach((t, i) =>
    insertTool.run(uuidv4(), woId, t.num, t.type, t.desc, t.dia, t.offset, i + 1)
  );

  const wpSteps = [
    { key: "fixture_mount", label: "Mount Fixture", desc: "Install Fixture F-112 (Custom 4-Jaw Chuck) onto the machine table. Align fixture datum pins with table T-slots.", detail: "Torque T-slot bolts to 45 N·m. Verify fixture is seated flat with dial indicator (TIR < 0.02mm).", category: "fixture" },
    { key: "workpiece_orient", label: "Orient Workpiece", desc: "Place Aluminium 6061-T6 blank (HMB-4420-A) into fixture. Datum face A down, machined bore toward spindle.", detail: "Match orientation arrow on part to fixture reference mark. Drawing Rev C3.", category: "orientation" },
    { key: "clamp_secure", label: "Clamp & Secure", desc: "Engage all four chuck jaws evenly. Apply clamping pressure in sequence: Jaw 1→3→2→4.", detail: "Target clamp force: 8 kN per jaw. Verify part does not shift — tap test with soft mallet.", category: "clamping" },
    { key: "work_offset", label: "Set Work Offset G54", desc: "Touch off part top surface with Z-axis tool setter. Set X/Y zero using edge finder on datum surfaces.", detail: "G54: X0.000 Y0.000 Z+50.000. Verify offset values match CNC program PRG-4420-FINISH v2.7.", category: "offset" },
    { key: "verify_program", label: "Verify CNC Program", desc: "Load program PRG-4420-FINISH (v2.7) from controller memory. Dry-run first 20 lines in single-block mode.", detail: "Check tool calls match loaded tools (T01-T06). Verify feed/speed overrides at 100%.", category: "program" },
  ];
  const insertWp = db.prepare(
    "INSERT INTO workpiece_steps (id, work_order_id, step_key, label, description, detail, sort_order, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  wpSteps.forEach((s, i) =>
    insertWp.run(uuidv4(), woId, s.key, s.label, s.desc, s.detail, i + 1, s.category)
  );
}

export default getDb;
