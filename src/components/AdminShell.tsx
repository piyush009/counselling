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
      <header className="no-print border-b border-line/80 bg-[#fffdf8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
              Counselling Desk
            </p>
            <h1 className="font-display text-2xl">{title}</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded px-2 py-1 text-ink-soft hover:bg-paper-2 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <form action={adminLogout}>
              <button className="btn btn-ghost text-sm" type="submit">
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
