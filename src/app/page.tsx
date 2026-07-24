import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="top-bar">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/btsc-logo.png" alt="BTSC" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white/90">
                  Bihar Technical Service Commission
                </p>
                <span className="portal-badge">v2</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white md:text-3xl">
                Counselling Desk
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="card-panel overflow-hidden rounded-2xl">
          <div className="border-b border-line bg-gradient-to-r from-[#eff6ff] to-[#e0f2fe] px-7 py-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-deep">
              Recruitment counselling portal
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink md:text-4xl">
              Secure multi-table verification
            </h2>
            <p className="mt-3 max-w-2xl text-ink-soft">
              Master Admin configures tables and mappings. Table officers verify
              candidates through OTP, fingerprint, document review, and signed
              certificates with QR authentication.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            <Link
              href="/admin/login"
              className="group border-b border-line p-7 transition hover:bg-[#f8fbff] md:border-b-0 md:border-r"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
                Module 01
              </p>
              <h3 className="mt-2 text-2xl font-bold text-ink">Master Admin</h3>
              <p className="mt-3 text-ink-soft">
                Tables, signatures, candidate mapping, document templates, and
                reports.
              </p>
              <span className="mt-6 inline-flex text-sm font-bold text-accent group-hover:underline">
                Open admin →
              </span>
            </Link>

            <Link
              href="/table/login"
              className="group p-7 transition hover:bg-[#f0f9ff]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-2">
                Module 02
              </p>
              <h3 className="mt-2 text-2xl font-bold text-ink">Table Officer</h3>
              <p className="mt-3 text-ink-soft">
                Phone OTP login, mapped counselling flow, document checklist, and
                printable PDF with QR.
              </p>
              <span className="mt-6 inline-flex text-sm font-bold text-accent-2 group-hover:underline">
                Open table console →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
