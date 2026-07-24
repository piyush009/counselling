"use client";

import { useState } from "react";
import Link from "next/link";
import { ActionForm } from "@/components/ActionForm";
import { requestTableOtp, verifyTableLogin } from "@/app/actions";

export default function TableLoginPage() {
  const [phone, setPhone] = useState("9900000001");
  const [otpSent, setOtpSent] = useState<{
    demoOtp?: string;
    masterOtpHint?: string;
    tableName?: string;
  } | null>(null);

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
            <p className="text-lg font-bold text-white">Table Officer</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-semibold text-accent hover:underline"
        >
          ← Back to home
        </Link>
        <div className="card-panel rounded-2xl p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-2">
            Table session
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">Open table</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Enter table phone, receive OTP (demo shows code). Master OTP works if
            SMS OTP fails.
          </p>

          {!otpSent ? (
            <ActionForm
              className="mt-6 space-y-4"
              action={requestTableOtp}
              onSuccess={(r) =>
                setOtpSent({
                  demoOtp: r.demoOtp as string,
                  masterOtpHint: r.masterOtpHint as string,
                  tableName: r.tableName as string,
                })
              }
            >
              <div>
                <label className="label" htmlFor="phone">
                  Table phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  className="field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button className="btn btn-primary w-full" type="submit">
                Send OTP
              </button>
            </ActionForm>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-3 py-3 text-sm">
                <p>
                  OTP sent for <strong>{otpSent.tableName}</strong>
                </p>
                <p className="mt-1">
                  Demo OTP:{" "}
                  <code className="font-semibold">{otpSent.demoOtp}</code>
                </p>
                <p className="mt-1 text-ink-soft">
                  Master OTP fallback: <code>{otpSent.masterOtpHint}</code>
                </p>
              </div>
              <ActionForm action={verifyTableLogin} className="space-y-4">
                <input type="hidden" name="phone" value={phone} />
                <div>
                  <label className="label" htmlFor="code">
                    Enter OTP
                  </label>
                  <input
                    id="code"
                    name="code"
                    className="field"
                    required
                    autoFocus
                  />
                </div>
                <button className="btn btn-accent w-full" type="submit">
                  Open table session
                </button>
              </ActionForm>
              <button
                type="button"
                className="btn btn-ghost w-full"
                onClick={() => setOtpSent(null)}
              >
                Change phone
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
