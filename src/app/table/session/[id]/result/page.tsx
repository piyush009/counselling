import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getTableSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TableShell } from "@/components/TableShell";
import { makeVerifyQrDataUrl, appUrl } from "@/lib/qr";
import { PrintButton } from "@/components/PrintButton";

export default async function ResultPage({
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
      documents: {
        include: { template: true },
        orderBy: { template: { sortOrder: "asc" } },
      },
      table: true,
    },
  });
  if (!session || session.tableId !== auth.tableId) notFound();
  if (session.step !== "done") redirect(`/table/session/${id}`);

  const qr = await makeVerifyQrDataUrl(session.verifyToken);
  const verifyUrl = appUrl(`/verify/${session.verifyToken}`);
  const ok = session.status === "successful";

  return (
    <TableShell tableName={table.name} tableNumber={table.number}>
      <div className="no-print mb-6 rounded-xl border border-accent/25 bg-[#e7f2ee] px-4 py-3 text-sm">
        Acknowledgement recorded. Certificate is ready to print. You may start
        another roll number when finished.
      </div>

      <div className="no-print mb-6 flex flex-wrap gap-3">
        <PrintButton />
        <Link href="/table" className="btn btn-ghost">
          Next roll number
        </Link>
      </div>

      <div
        id="certificate"
        className="card-panel mx-auto max-w-3xl rounded-xl p-8 print:border-0 print:bg-white print:shadow-none"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
              Counselling Desk · Acknowledgement
            </p>
            <h1 className="font-display mt-2 text-3xl">
              Counselling {ok ? "Successful" : "Unsuccessful"}
            </h1>
            <p className="mt-2 text-ink-soft">
              Table {session.table.number} · {session.table.name}
            </p>
          </div>
          <span className={`badge ${ok ? "badge-ok" : "badge-bad"}`}>
            {session.status}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          {session.candidate.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.candidate.photoUrl}
              alt={session.candidate.name}
              className="h-28 w-28 rounded-lg border border-line object-cover"
            />
          )}
          <div className="flex-1 text-sm">
            <p className="font-display text-2xl">{session.candidate.name}</p>
            <p className="mt-1">Roll: {session.candidate.rollNumber}</p>
            <p>Exam: {session.candidate.examPassed}</p>
            <p>Category: {session.candidate.category}</p>
            <p>10th marks: {session.candidate.marks10th}</p>
          </div>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR code" className="mx-auto h-[140px] w-[140px]" />
            <p className="mt-2 max-w-[140px] break-all text-[10px] text-ink-soft">
              {verifyUrl}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-display text-xl">Documents</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {session.documents.map((d) => (
              <li
                key={d.id}
                className="flex justify-between gap-3 border-b border-line/50 pb-2"
              >
                <span>{d.template.name}</span>
                <span>
                  {d.status}
                  {d.remark ? ` — ${d.remark}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-soft">
              Officer signature
            </p>
            {session.table.signaturePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.table.signaturePath}
                alt="Officer signature"
                className="mt-2 h-14 object-contain"
              />
            ) : (
              <p className="mt-2 italic text-ink-soft">No signature on file</p>
            )}
            <p className="mt-1 text-sm">{session.table.name}</p>
          </div>
          <p className="text-sm text-ink-soft">
            Completed{" "}
            {session.completedAt
              ? new Date(session.completedAt).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>
    </TableShell>
  );
}
