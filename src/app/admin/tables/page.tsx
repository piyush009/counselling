import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/AdminShell";
import { upsertTable } from "@/app/actions";

export default async function TablesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const tables = await prisma.deskTable.findMany({ orderBy: { number: "asc" } });

  return (
    <AdminShell title="Tables & Users">
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card-panel rounded-xl p-6 lg:col-span-2">
          <h2 className="font-display text-2xl">Create / update table</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Phone OTP login + Master OTP fallback. Signature auto-applies on PDF.
          </p>
          <form action={upsertTable} className="mt-5 space-y-3" encType="multipart/form-data">
            <input type="hidden" name="id" value="" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Number</label>
                <input className="field" name="number" type="number" min={1} required />
              </div>
              <div>
                <label className="label">User ID</label>
                <input className="field" name="userId" placeholder="table7" required />
              </div>
            </div>
            <div>
              <label className="label">Name</label>
              <input className="field" name="name" required />
            </div>
            <div>
              <label className="label">Computer label</label>
              <input className="field" name="computerLabel" placeholder="PC-7" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input className="field" name="phone" required />
              </div>
              <div>
                <label className="label">Master OTP</label>
                <input className="field" name="masterOtp" required />
              </div>
            </div>
            <div>
              <label className="label">Attribute 1</label>
              <input className="field" name="attr1" required />
            </div>
            <div>
              <label className="label">Attribute 2</label>
              <input className="field" name="attr2" required />
            </div>
            <div>
              <label className="label">Attribute 3</label>
              <input className="field" name="attr3" required />
            </div>
            <div>
              <label className="label">Signature image</label>
              <input className="field" name="signature" type="file" accept="image/*" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked /> Active
            </label>
            <button className="btn btn-primary" type="submit">
              Save table
            </button>
          </form>
        </div>

        <div className="space-y-4 lg:col-span-3">
          {tables.map((t) => (
            <div key={t.id} className="card-panel rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl">
                    Table {t.number} · {t.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {t.userId} · {t.computerLabel} · {t.phone}
                  </p>
                </div>
                <span className={`badge ${t.isActive ? "badge-ok" : "badge-muted"}`}>
                  {t.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-3">
                <p>Attr1: {t.attr1}</p>
                <p>Attr2: {t.attr2}</p>
                <p>Attr3: {t.attr3}</p>
              </div>
              <p className="mt-2 text-sm">
                Master OTP: <code>{t.masterOtp}</code>
              </p>
              {t.signaturePath && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.signaturePath}
                  alt={`Signature table ${t.number}`}
                  className="mt-3 h-12 object-contain"
                />
              )}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-accent">
                  Edit table
                </summary>
                <form
                  action={upsertTable}
                  className="mt-3 space-y-3 border-t border-line pt-3"
                  encType="multipart/form-data"
                >
                  <input type="hidden" name="id" value={t.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Number</label>
                      <input className="field" name="number" type="number" defaultValue={t.number} required />
                    </div>
                    <div>
                      <label className="label">User ID</label>
                      <input className="field" name="userId" defaultValue={t.userId} required />
                    </div>
                  </div>
                  <input className="field" name="name" defaultValue={t.name} required />
                  <input className="field" name="computerLabel" defaultValue={t.computerLabel} required />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="field" name="phone" defaultValue={t.phone} required />
                    <input className="field" name="masterOtp" defaultValue={t.masterOtp} required />
                  </div>
                  <input className="field" name="attr1" defaultValue={t.attr1} required />
                  <input className="field" name="attr2" defaultValue={t.attr2} required />
                  <input className="field" name="attr3" defaultValue={t.attr3} required />
                  <input className="field" name="signature" type="file" accept="image/*" />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isActive" defaultChecked={t.isActive} /> Active
                  </label>
                  <button className="btn btn-accent" type="submit">
                    Update
                  </button>
                </form>
              </details>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
