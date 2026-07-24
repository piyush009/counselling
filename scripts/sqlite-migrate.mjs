import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

const dbPath = process.env.DATABASE_URL?.replace(/^file:/, "") || "/app/data/dev.db";

if (!existsSync(dbPath)) {
  console.log("No DB yet — skip migrate.");
  process.exit(0);
}

const db = new DatabaseSync(dbPath);

function hasColumn(table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((r) => r.name === column);
}

function addColumn(table, column, typeSql) {
  if (hasColumn(table, column)) {
    console.log(`OK ${table}.${column}`);
    return;
  }
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeSql}`);
  console.log(`Added ${table}.${column}`);
}

addColumn("Candidate", "aadhaarNumber", "TEXT");
addColumn("CounsellingSession", "aadhaarOk", "BOOLEAN NOT NULL DEFAULT 0");
addColumn("CounsellingSession", "aadhaarLast4", "TEXT");
addColumn("CounsellingSession", "aadhaarName", "TEXT");
addColumn("CounsellingSession", "aadhaarRef", "TEXT");

console.log("SQLite migrate complete.");
