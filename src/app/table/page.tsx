import { redirect } from "next/navigation";
import { getTableSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TableShell } from "@/components/TableShell";
import { ActionForm } from "@/components/ActionForm";
import { startCounselling } from "@/app/actions";

export default async function TableHomePage() {
  const session = await getTableSession();
  if (!session) redirect("/table/login");

  const table = await prisma.deskTable.findUnique({
    where: { id: session.tableId },
  });
  if (!table) redirect("/table/login");

  const mapped = await prisma.candidateTableMap.findMany({
    where: { tableId: table.id },
    include: { candidate: true },
    orderBy: { candidate: { rollNumber: "asc" } },
  });

  return (
    <TableShell tableName={table.name} tableNumber={table.number}>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card-panel rounded-xl p-6 lg:col-span-3">
          <h2 className="font-display text-3xl">Start counselling</h2>
          <p className="mt-2 text-ink-soft">
            Enter roll number. Only candidates mapped to Table {table.number} can
            proceed.
          </p>
          <ActionForm action={startCounselling} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="rollNumber">
                Roll number
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                className="field"
                placeholder="BPC2026001"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Fetch from BPC & start
            </button>
          </ActionForm>
        </div>

        <div className="card-panel rounded-xl p-6 lg:col-span-2">
          <h3 className="font-display text-xl">Mapped candidates</h3>
          <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
            {mapped.map((m) => (
              <li key={m.id} className="border-b border-line/60 pb-2">
                <span className="font-semibold">{m.candidate.rollNumber}</span>
                <span className="text-ink-soft"> — {m.candidate.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TableShell>
  );
}
