import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [tables, candidates, mappings, sessions] = await Promise.all([
    prisma.deskTable.count(),
    prisma.candidate.count(),
    prisma.candidateTableMap.count(),
    prisma.counsellingSession.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const success =
    sessions.find((s) => s.status === "successful")?._count || 0;
  const fail =
    sessions.find((s) => s.status === "unsuccessful")?._count || 0;
  const progress =
    sessions.find((s) => s.status === "in_progress")?._count || 0;

  return (
    <AdminShell title="Master Admin">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Tables", value: tables },
          { label: "Candidates", value: candidates },
          { label: "Mappings", value: mappings },
          { label: "Successful", value: success },
        ].map((s) => (
          <div key={s.label} className="card-panel rounded-xl p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
              {s.label}
            </p>
            <p className="font-display mt-2 text-4xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card-panel rounded-xl p-5 md:col-span-2">
          <h2 className="font-display text-2xl">Session snapshot</h2>
          <p className="mt-2 text-ink-soft">
            In progress: {progress} · Unsuccessful: {fail} · Successful:{" "}
            {success}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin/tables" className="btn btn-primary">
              Manage tables
            </Link>
            <Link href="/admin/mapping" className="btn btn-ghost">
              Map candidates
            </Link>
            <Link href="/admin/reports" className="btn btn-ghost">
              View reports
            </Link>
          </div>
        </div>
        <div className="card-panel rounded-xl p-5">
          <h2 className="font-display text-xl">Signed in</h2>
          <p className="mt-2 text-ink-soft">{session.username}</p>
          <p className="mt-4 text-sm text-ink-soft">
            Create up to 6 tables with signatures, map roll numbers, and review
            counselling outcomes.
          </p>
        </div>
      </div>
    </AdminShell>
  );
}
