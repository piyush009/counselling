import { redirect, notFound } from "next/navigation";
import { getTableSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TableShell } from "@/components/TableShell";
import { CounsellingWizard } from "@/components/CounsellingWizard";

export default async function SessionPage({
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
    },
  });
  if (!session || session.tableId !== auth.tableId) notFound();
  if (session.step === "done") redirect(`/table/session/${id}/result`);

  return (
    <TableShell tableName={table.name} tableNumber={table.number}>
      <CounsellingWizard session={session} />
    </TableShell>
  );
}
