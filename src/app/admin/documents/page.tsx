import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";
import { upsertDocument } from "@/app/actions";

export default async function DocumentsAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const docs = await prisma.documentTemplate.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <AdminShell title="Document Templates">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-panel rounded-xl p-6">
          <h2 className="font-display text-2xl">Add document</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Dynamic checklist used during counselling verification.
          </p>
          <form action={upsertDocument} className="mt-5 space-y-3">
            <input type="hidden" name="id" value="" />
            <div>
              <label className="label">Name</label>
              <input className="field" name="name" required />
            </div>
            <div>
              <label className="label">Sort order</label>
              <input className="field" name="sortOrder" type="number" defaultValue={docs.length + 1} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <button className="btn btn-primary" type="submit">
              Add
            </button>
          </form>
        </div>

        <div className="space-y-3">
          {docs.map((d) => (
            <form
              key={d.id}
              action={upsertDocument}
              className="card-panel flex flex-wrap items-end gap-3 rounded-xl p-4"
            >
              <input type="hidden" name="id" value={d.id} />
              <div className="min-w-[12rem] flex-1">
                <label className="label">Name</label>
                <input className="field" name="name" defaultValue={d.name} required />
              </div>
              <div className="w-24">
                <label className="label">Order</label>
                <input className="field" name="sortOrder" type="number" defaultValue={d.sortOrder} />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={d.isActive} /> Active
              </label>
              <button className="btn btn-ghost" type="submit">
                Save
              </button>
            </form>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
