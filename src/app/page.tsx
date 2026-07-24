import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.2em] text-ink-soft">
          Institutional counselling console
        </p>
        <h1 className="font-display mt-3 text-5xl leading-tight text-ink md:text-6xl">
          Counselling Desk
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Master Admin manages tables and mappings. Table officers verify
          candidates through OTP, fingerprint, document review, and signed PDF
          certificates.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/admin/login"
            className="card-panel group rounded-xl p-7 transition hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              Module 01
            </p>
            <h2 className="font-display mt-2 text-3xl">Master Admin</h2>
            <p className="mt-3 text-ink-soft">
              Tables, signatures, candidate mapping, document templates, and
              reports.
            </p>
            <span className="mt-6 inline-block text-sm font-semibold text-accent group-hover:underline">
              Open admin →
            </span>
          </Link>

          <Link
            href="/table/login"
            className="card-panel group rounded-xl p-7 transition hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
              Module 02
            </p>
            <h2 className="font-display mt-2 text-3xl">Table Officer</h2>
            <p className="mt-3 text-ink-soft">
              Phone OTP login, mapped counselling flow, document checklist, and
              printable PDF.
            </p>
            <span className="mt-6 inline-block text-sm font-semibold text-accent-2 group-hover:underline">
              Open table console →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
