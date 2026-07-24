import Link from "next/link";
import { tableLogout } from "@/app/actions";

export function TableShell({
  children,
  tableName,
  tableNumber,
}: {
  children: React.ReactNode;
  tableName: string;
  tableNumber: number;
}) {
  return (
    <div className="min-h-screen">
      <header className="top-bar no-print">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/btsc-logo.png" alt="BTSC" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-white/90">
                  BTSC Counselling Desk · Table Console
                </p>
                <span className="portal-badge">v2</span>
              </div>
              <h1 className="text-xl font-bold text-white md:text-2xl">
                {tableName}{" "}
                <span className="font-semibold text-white/80">
                  #{tableNumber}
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/table" className="nav-link">
              New candidate
            </Link>
            <form action={tableLogout}>
              <button
                className="btn btn-ghost text-sm !border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
                type="submit"
              >
                Close table
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
