import Link from "next/link";
import { adminLogout } from "@/app/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/tables", label: "Tables" },
  { href: "/admin/mapping", label: "Mapping" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="top-bar no-print">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/btsc-logo.png" alt="BTSC" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white/90">
                  BTSC Counselling Desk
                </p>
                <span className="portal-badge">v2</span>
              </div>
              <h1 className="text-xl font-bold text-white md:text-2xl">
                {title}
              </h1>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
            <form action={adminLogout} className="ml-1">
              <button
                className="btn btn-ghost text-sm !border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
                type="submit"
              >
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
