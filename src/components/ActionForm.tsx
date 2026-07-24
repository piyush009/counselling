"use client";

import { useState, useTransition } from "react";

type ActionResult = { error?: string; ok?: boolean; [k: string]: unknown };

function isNextRedirect(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function ActionForm({
  action,
  children,
  className,
  onSuccess,
}: {
  action: (formData: FormData) => Promise<ActionResult | void>;
  children: React.ReactNode;
  className?: string;
  onSuccess?: (result: ActionResult) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          setError(null);
          try {
            const result = await action(fd);
            if (result?.error) setError(result.error);
            else if (result && onSuccess) onSuccess(result);
          } catch (err) {
            if (isNextRedirect(err)) throw err;
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
    >
      {children}
      {error && (
        <p className="mt-3 rounded border border-bad/30 bg-[#f8e8e4] px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}
      {pending && <p className="mt-2 text-sm text-ink-soft">Working…</p>}
    </form>
  );
}
