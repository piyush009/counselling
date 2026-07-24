import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";
import { mapCandidate, removeMapping } from "@/app/actions";

export default async function MappingPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [tables, mappings] = await Promise.all([
    prisma.deskTable.findMany({ orderBy: { number: "asc" } }),
    prisma.candidateTableMap.findMany({
      include: { candidate: true, table: true },
      orderBy: { candidate: { rollNumber: "asc" } },
    }),
  ]);

  return (
    <AdminShell title="Candidate Mapping">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-panel rounded-xl p-6">
          <h2 className="font-display text-2xl">Map roll → table</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Counselling is allowed only on the mapped table.
          </p>
          <form action={mapCandidate} className="mt-5 space-y-3">
            <div>
              <label className="label">Roll number</label>
              <input className="field" name="rollNumber" required placeholder="BPC2026013" />
            </div>
            <div>
              <label className="label">Table</label>
              <select className="field" name="tableId" required>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table {t.number} — {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" name="name" placeholder="Name (if new)" />
              <input className="field" name="phone" placeholder="Phone (if new)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" name="category" placeholder="Category" />
              <input className="field" name="marks10th" placeholder="10th marks" />
            </div>
            <button className="btn btn-primary" type="submit">
              Save mapping
            </button>
          </form>
        </div>

        <div className="card-panel rounded-xl p-6">
          <h2 className="font-display text-2xl">Current mappings</h2>
          <div className="mt-4 max-h-[32rem] space-y-3 overflow-auto">
            {mappings.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 border-b border-line/70 pb-3"
              >
                <div>
                  <p className="font-semibold">{m.candidate.rollNumber}</p>
                  <p className="text-sm text-ink-soft">
                    {m.candidate.name} → Table {m.table.number}
                  </p>
                </div>
                <form action={removeMapping}>
                  <input type="hidden" name="id" value={m.id} />
                  <button className="btn btn-ghost text-sm" type="submit">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
