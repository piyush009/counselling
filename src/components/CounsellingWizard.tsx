"use client";

import { useState } from "react";
import {
  advanceStep,
  sendCandidateOtp,
  verifyCandidateOtp,
  runFingerprint,
  saveDocumentReview,
  finalizeCounselling,
} from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";

type Doc = {
  id: string;
  status: string;
  remark: string | null;
  template: { name: string };
};

type SessionView = {
  id: string;
  step: string;
  candidateOtpOk: boolean;
  fingerprintOk: boolean;
  candidate: {
    rollNumber: string;
    name: string;
    fatherName: string;
    examPassed: string;
    category: string;
    phone: string;
    photoUrl: string | null;
    marks10th: string;
    marks12th: string | null;
    dob: string | null;
    address: string | null;
    email: string | null;
  };
  documents: Doc[];
};

const steps = ["brief", "full", "otp", "fingerprint", "documents"] as const;

export function CounsellingWizard({ session }: { session: SessionView }) {
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const c = session.candidate;
  const stepIndex = Math.max(0, steps.indexOf(session.step as (typeof steps)[number]));

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <span
            key={s}
            className={`badge ${i <= stepIndex ? "badge-ok" : "badge-muted"}`}
          >
            {s}
          </span>
        ))}
      </div>

      {(session.step === "brief" || session.step === "full") && (
        <div className="card-panel rounded-xl p-6">
          <div className="flex flex-wrap gap-6">
            {c.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.photoUrl}
                alt={c.name}
                className="h-28 w-28 rounded-lg border border-line object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">
                BPC profile · {session.step === "brief" ? "Brief" : "Full"} info
              </p>
              <h2 className="font-display mt-1 text-3xl">{c.name}</h2>
              <p className="mt-1 text-ink-soft">{c.rollNumber}</p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <p>Exam: {c.examPassed}</p>
                <p>Category: {c.category}</p>
                {session.step === "full" && (
                  <>
                    <p>Father: {c.fatherName}</p>
                    <p>Phone: {c.phone}</p>
                    <p>10th: {c.marks10th}</p>
                    <p>12th: {c.marks12th || "-"}</p>
                    <p>DOB: {c.dob || "-"}</p>
                    <p>Email: {c.email || "-"}</p>
                    <p className="sm:col-span-2">Address: {c.address || "-"}</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <form action={advanceStep} className="mt-6">
            <input type="hidden" name="sessionId" value={session.id} />
            <input
              type="hidden"
              name="step"
              value={session.step === "brief" ? "full" : "otp"}
            />
            <button className="btn btn-primary" type="submit">
              {session.step === "brief" ? "Continue to full info" : "Continue to OTP"}
            </button>
          </form>
        </div>
      )}

      {session.step === "otp" && (
        <div className="card-panel rounded-xl p-6">
          <h2 className="font-display text-2xl">Candidate phone OTP</h2>
          <p className="mt-2 text-ink-soft">
            OTP will be sent to BPC phone <strong>{c.phone}</strong>
          </p>
          <ActionForm
            className="mt-4"
            action={sendCandidateOtp}
            onSuccess={(r) => setDemoOtp(r.demoOtp as string)}
          >
            <input type="hidden" name="sessionId" value={session.id} />
            <button className="btn btn-ghost" type="submit">
              Send OTP
            </button>
          </ActionForm>
          {demoOtp && (
            <p className="mt-3 rounded bg-[#e7f2ee] px-3 py-2 text-sm">
              Demo OTP: <code className="font-semibold">{demoOtp}</code>
            </p>
          )}
          <ActionForm action={verifyCandidateOtp} className="mt-4 space-y-3">
            <input type="hidden" name="sessionId" value={session.id} />
            <input className="field" name="code" placeholder="Enter OTP" required />
            <button className="btn btn-primary" type="submit">
              Verify OTP
            </button>
          </ActionForm>
        </div>
      )}

      {session.step === "fingerprint" && (
        <div className="card-panel rounded-xl p-6">
          <h2 className="font-display text-2xl">Fingerprint authentication</h2>
          <p className="mt-2 text-ink-soft">
            AKPI vendor API returns yes/no. Place finger on tab (demo controls
            below).
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ActionForm action={runFingerprint}>
              <input type="hidden" name="sessionId" value={session.id} />
              <input type="hidden" name="force" value="yes" />
              <button className="btn btn-accent" type="submit">
                Simulate match (Yes)
              </button>
            </ActionForm>
            <ActionForm action={runFingerprint}>
              <input type="hidden" name="sessionId" value={session.id} />
              <input type="hidden" name="force" value="no" />
              <button className="btn btn-ghost" type="submit">
                Simulate fail (No)
              </button>
            </ActionForm>
          </div>
        </div>
      )}

      {session.step === "documents" && (
        <div className="card-panel rounded-xl p-6">
          <h2 className="font-display text-2xl">Document verification</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Mark each document Correct / Wrong / Doubtful. Doubtful requires a
            remark. Any doubtful or wrong → counselling unsuccessful.
          </p>
          <div className="mt-5 space-y-4">
            {session.documents.map((d) => (
              <DocumentRow key={d.id} sessionId={session.id} doc={d} />
            ))}
          </div>
          <ActionForm action={finalizeCounselling} className="mt-6">
            <input type="hidden" name="sessionId" value={session.id} />
            <button className="btn btn-primary" type="submit">
              Finalize counselling
            </button>
          </ActionForm>
        </div>
      )}
    </div>
  );
}

function DocumentRow({
  sessionId,
  doc,
}: {
  sessionId: string;
  doc: Doc;
}) {
  const [status, setStatus] = useState(doc.status);
  const [remark, setRemark] = useState(doc.remark || "");
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-lg border border-line bg-[#fffdf8] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">{doc.template.name}</p>
        <span
          className={`badge ${
            status === "correct"
              ? "badge-ok"
              : status === "wrong"
                ? "badge-bad"
                : status === "doubtful"
                  ? "badge-warn"
                  : "badge-muted"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["correct", "wrong", "doubtful"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`btn text-sm ${status === s ? "btn-primary" : "btn-ghost"}`}
            onClick={() => {
              setStatus(s);
              setSaved(false);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {status === "doubtful" && (
        <textarea
          className="field mt-3"
          rows={2}
          placeholder="Doubtful remark"
          value={remark}
          onChange={(e) => {
            setRemark(e.target.value);
            setSaved(false);
          }}
        />
      )}
      <ActionForm
        className="mt-3"
        action={async (fd) => {
          const r = await saveDocumentReview(fd);
          if (!r?.error) setSaved(true);
          return r;
        }}
      >
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="docId" value={doc.id} />
        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="remark" value={remark} />
        <button className="btn btn-ghost text-sm" type="submit">
          {saved ? "Saved" : "Save review"}
        </button>
      </ActionForm>
    </div>
  );
}
