import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";

type Outcome = { status: string; at: string };

function parseHistory(raw: string | null): Outcome[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Outcome[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function timesLabel(n: number) {
  if (n <= 0) return "—";
  if (n === 1) return "1 time";
  return `${n} times`;
}

export default async function ReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const rows = await prisma.counsellingSession.findMany({
    include: { candidate: true, table: true },
    orderBy: { updatedAt: "desc" },
  });

  const tables = await prisma.deskTable.findMany({ orderBy: { number: "asc" } });

  const stats = tables.map((t) => {
    const list = rows.filter((r) => r.tableId === t.id);
    return {
      table: t,
      successful: list.filter((r) => r.status === "successful").length,
      unsuccessful: list.filter((r) => r.status === "unsuccessful").length,
      in_progress: list.filter((r) => r.status === "in_progress").length,
    };
  });

  return (
    <AdminShell title="Reports">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.table.id} className="card-panel rounded-xl p-5">
            <h3 className="font-display text-xl">Table {s.table.number}</h3>
            <p className="mt-3 text-sm">
              <span className="badge badge-ok mr-2">OK {s.successful}</span>
              <span className="badge badge-bad mr-2">Fail {s.unsuccessful}</span>
              <span className="badge badge-muted">Open {s.in_progress}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="card-panel mt-6 overflow-x-auto rounded-xl p-6">
        <h2 className="font-display text-2xl">Counselling report</h2>
        <p className="mt-1 text-sm text-ink-soft">
          One row per candidate. Re-finalize keeps the same row and increases the
          count.
        </p>
        <table className="mt-4 w-full min-w-[720px] text-left text-sm">
          <thead className="text-ink-soft">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">Roll</th>
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Table</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Finalized</th>
              <th className="py-2 font-medium">Verify</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const history = parseHistory(r.outcomeHistory);
              const trail =
                history.length > 1
                  ? history.map((h) => h.status.replace("_", " ")).join(" → ")
                  : null;
              return (
                <tr key={r.id} className="border-b border-line/60 align-top">
                  <td className="py-2.5 pr-3 font-medium">
                    {r.candidate.rollNumber}
                  </td>
                  <td className="py-2.5 pr-3">{r.candidate.name}</td>
                  <td className="py-2.5 pr-3">{r.table.number}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`badge ${
                        r.status === "successful"
                          ? "badge-ok"
                          : r.status === "unsuccessful"
                            ? "badge-bad"
                            : "badge-warn"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="font-medium">{timesLabel(r.finalizeCount)}</span>
                    {trail && (
                      <p className="mt-1 max-w-[220px] text-xs leading-snug text-ink-soft">
                        {trail}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5">
                    <Link
                      className="text-accent underline"
                      href={`/verify/${r.verifyToken}`}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
