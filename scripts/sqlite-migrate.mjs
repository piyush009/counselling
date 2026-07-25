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

function hasIndex(name) {
  const rows = db.prepare(`PRAGMA index_list(CounsellingSession)`).all();
  return rows.some((r) => r.name === name);
}

addColumn("Candidate", "aadhaarNumber", "TEXT");
addColumn("CounsellingSession", "aadhaarOk", "BOOLEAN NOT NULL DEFAULT 0");
addColumn("CounsellingSession", "aadhaarLast4", "TEXT");
addColumn("CounsellingSession", "aadhaarName", "TEXT");
addColumn("CounsellingSession", "aadhaarRef", "TEXT");

// Keep latest session per candidate+table; drop older duplicates from testing/re-runs
const groups = db
  .prepare(
    `SELECT candidateId, tableId, COUNT(*) AS c
     FROM CounsellingSession
     GROUP BY candidateId, tableId
     HAVING c > 1`
  )
  .all();

for (const g of groups) {
  const rows = db
    .prepare(
      `SELECT id FROM CounsellingSession
       WHERE candidateId = ? AND tableId = ?
       ORDER BY updatedAt DESC, createdAt DESC`
    )
    .all(g.candidateId, g.tableId);
  for (const r of rows.slice(1)) {
    db.prepare(`DELETE FROM SessionDocument WHERE sessionId = ?`).run(r.id);
    db.prepare(`DELETE FROM CounsellingSession WHERE id = ?`).run(r.id);
    console.log(`Removed duplicate session ${r.id}`);
  }
}

if (!hasIndex("CounsellingSession_candidateId_tableId_key")) {
  db.exec(
    `CREATE UNIQUE INDEX CounsellingSession_candidateId_tableId_key
     ON CounsellingSession(candidateId, tableId)`
  );
  console.log("Added unique index candidateId+tableId");
} else {
  console.log("OK unique index candidateId+tableId");
}

console.log("SQLite migrate complete.");
