import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await prisma.counsellingSession.findUnique({
    where: { verifyToken: token },
    include: {
      candidate: true,
      table: true,
      documents: {
        include: { template: true },
        orderBy: { template: { sortOrder: "asc" } },
      },
    },
  });
  if (!session) notFound();

  const ok = session.status === "successful";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-ink-soft hover:text-ink">
        ← Counselling Desk
      </Link>
      <div className="card-panel mt-6 rounded-xl p-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">
          Public verification
        </p>
        <h1 className="font-display mt-2 text-3xl">
          Certificate {ok ? "valid" : "recorded as unsuccessful"}
        </h1>
        <span className={`badge mt-4 ${ok ? "badge-ok" : "badge-bad"}`}>
          {session.status}
        </span>

        <div className="mt-6 flex gap-5">
          {session.candidate.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.candidate.photoUrl}
              alt=""
              className="h-24 w-24 rounded-lg border border-line object-cover"
            />
          )}
          <div className="text-sm">
            <p className="font-display text-2xl">{session.candidate.name}</p>
            <p className="mt-1">{session.candidate.rollNumber}</p>
            <p>{session.candidate.examPassed}</p>
            <p>
              Table {session.table.number} · {session.table.name}
            </p>
            <p className="mt-2 text-ink-soft">
              {session.completedAt
                ? new Date(session.completedAt).toLocaleString()
                : "In progress"}
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          {session.documents.map((d) => (
            <li key={d.id} className="flex justify-between gap-3">
              <span>{d.template.name}</span>
              <span className="text-ink-soft">
                {d.status}
                {d.remark ? ` (${d.remark})` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
