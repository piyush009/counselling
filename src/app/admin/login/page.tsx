import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { adminLogin } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import Link from "next/link";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-sm text-ink-soft hover:text-ink">
        ← Counselling Desk
      </Link>
      <div className="card-panel rounded-xl p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
          Master Admin
        </p>
        <h1 className="font-display mt-2 text-3xl">Sign in</h1>
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
    </main>
  );
}
