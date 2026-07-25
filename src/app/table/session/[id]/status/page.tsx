import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTableSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TableShell } from "@/components/TableShell";
import { confirmEditCounselling } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";

function resolveOutcome(session: {
  status: string;
  documents: { status: string }[];
}) {
  if (session.status === "successful" || session.status === "unsuccessful") {
    return session.status;
  }
  const hasBad = session.documents.some(
    (d) => d.status === "doubtful" || d.status === "wrong"
  );
  const allCorrect =
    session.documents.length > 0 &&
    session.documents.every((d) => d.status === "correct");
  if (hasBad) return "unsuccessful" as const;
  if (allCorrect) return "successful" as const;
  return "unsuccessful" as const;
}

export default async function AlreadyDoneStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await getTableSession();
  if (!auth) redirect("/table/login");

  const table = await prisma.deskTable.findUnique({
    where: { id: auth.tableId },
  });
  if (!table) redirect("/table/login");

  const session = await prisma.counsellingSession.findUnique({
    where: { id },
    include: {
      candidate: true,
      documents: true,
    },
  });
  if (!session || session.tableId !== auth.tableId) notFound();

  const outcome = resolveOutcome(session);
  const ok = outcome === "successful";
  const c = session.candidate;

  return (
    <TableShell tableName={table.name} tableNumber={table.number}>
      <div
        className={`card-panel rounded-2xl border-2 p-8 md:p-12 ${
          ok ? "border-ok bg-[#e7f2ee]" : "border-bad bg-[#f8e8e4]"
        }`}
      >
        <p className="text-center text-sm uppercase tracking-[0.2em] text-ink-soft">
          Counselling already completed
        </p>
        <h1
          className={`font-display mt-4 text-center text-4xl leading-tight md:text-6xl ${
            ok ? "text-ok" : "text-bad"
          }`}
        >
          {ok ? "SUCCESSFUL" : "UNSUCCESSFUL"}
        </h1>
        <p
          className={`mt-4 text-center text-2xl font-semibold md:text-3xl ${
            ok ? "text-ok" : "text-bad"
          }`}
        >
          Counselling for this candidate has already been completed
        </p>
        <p className="mt-2 text-center text-lg text-ink-soft">
          Outcome:{" "}
          <strong className={ok ? "text-ok" : "text-bad"}>
            {ok ? "Successful" : "Unsuccessful"}
          </strong>
        </p>

        <div className="mx-auto mt-8 max-w-lg rounded-xl border border-line bg-[#fffdf8] p-5 text-center">
          {c.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.photoUrl}
              alt={c.name}
              className="mx-auto h-24 w-24 rounded-lg border border-line object-cover"
            />
          )}
          <p className="font-display mt-3 text-2xl">{c.name}</p>
          <p className="text-ink-soft">{c.rollNumber}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {c.examPassed} · {c.category}
          </p>
          {session.completedAt && (
            <p className="mt-2 text-xs text-ink-soft">
              Completed {new Date(session.completedAt).toLocaleString()}
              {session.finalizeCount > 0
                ? ` · Finalized ${session.finalizeCount} ${
                    session.finalizeCount === 1 ? "time" : "times"
                  }`
                : ""}
            </p>
          )}
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xl font-semibold text-ink md:text-2xl">
          Do you want to edit this counselling record again?
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
          <ActionForm action={confirmEditCounselling}>
            <input type="hidden" name="sessionId" value={session.id} />
            <button className="btn btn-primary w-full sm:w-auto" type="submit">
              Yes, edit record
            </button>
          </ActionForm>

          <Link
            href={`/table/session/${session.id}/result`}
            className="btn btn-accent text-center"
          >
            Open final certificate / QR
          </Link>

          <Link href="/table" className="btn btn-ghost text-center">
            Cancel — enter another roll number
          </Link>
        </div>
      </div>
    </TableShell>
  );
}
