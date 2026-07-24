import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { adminLogin } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import Link from "next/link";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="min-h-screen">
      <header className="top-bar">
        <div className="mx-auto flex max-w-md items-center gap-3 px-6 py-4">
          <div className="brand-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/btsc-logo.png" alt="BTSC" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-white/90">BTSC Portal</p>
              <span className="portal-badge">v2</span>
            </div>
            <p className="text-lg font-bold text-white">Master Admin</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 py-10">
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-accent hover:underline">
          ← Back to home
        </Link>
        <div className="card-panel rounded-2xl p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Secure access
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">Sign in</h1>
          <ActionForm action={adminLogin} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                className="field"
                defaultValue="admin"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="field"
                defaultValue="admin123"
                required
              />
            </div>
            <button className="btn btn-primary w-full" type="submit">
              Enter admin
            </button>
          </ActionForm>
        </div>
      </div>
    </main>
  );
}
