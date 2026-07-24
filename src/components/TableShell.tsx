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
      <header className="no-print border-b border-line/80 bg-[#fffdf8]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
              Counselling Desk · Table Console
            </p>
            <h1 className="font-display text-2xl">
              {tableName}{" "}
              <span className="text-ink-soft">#{tableNumber}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/table" className="text-sm text-ink-soft hover:text-ink">
              New candidate
            </Link>
            <form action={tableLogout}>
              <button className="btn btn-ghost text-sm" type="submit">
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
