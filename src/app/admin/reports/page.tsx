import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";

export default async function ReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [byTable, recent] = await Promise.all([
    prisma.counsellingSession.groupBy({
      by: ["tableId", "status"],
      _count: true,
    }),
    prisma.counsellingSession.findMany({
      include: { candidate: true, table: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const tables = await prisma.deskTable.findMany({ orderBy: { number: "asc" } });
  const tableMap = Object.fromEntries(tables.map((t) => [t.id, t]));

  const stats = tables.map((t) => {
    const rows = byTable.filter((r) => r.tableId === t.id);
    return {
      table: t,
      successful: rows.find((r) => r.status === "successful")?._count || 0,
      unsuccessful: rows.find((r) => r.status === "unsuccessful")?._count || 0,
      in_progress: rows.find((r) => r.status === "in_progress")?._count || 0,
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
        <h2 className="font-display text-2xl">Recent counselling</h2>
        <table className="mt-4 w-full min-w-[640px] text-left text-sm">
          <thead className="text-ink-soft">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">Roll</th>
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Table</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 font-medium">Verify</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id} className="border-b border-line/60">
                <td className="py-2.5 pr-3 font-medium">{r.candidate.rollNumber}</td>
                <td className="py-2.5 pr-3">{r.candidate.name}</td>
                <td className="py-2.5 pr-3">
                  {tableMap[r.tableId]?.number ?? "-"}
                </td>
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
                <td className="py-2.5">
                  <Link
                    className="text-accent underline"
                    href={`/verify/${r.verifyToken}`}
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
