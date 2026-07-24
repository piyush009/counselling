import { prisma } from "./prisma";

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function createOtp(
  purpose: "table_login" | "candidate_verify",
  targetKey: string,
  tableId?: string
) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpChallenge.updateMany({
    where: { purpose, targetKey, consumed: false },
    data: { consumed: true },
  });
  const challenge = await prisma.otpChallenge.create({
    data: { purpose, targetKey, tableId, code, expiresAt },
  });
  return challenge;
}

export async function verifyOtp(
  purpose: "table_login" | "candidate_verify",
  targetKey: string,
  code: string
) {
  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      purpose,
      targetKey,
      code,
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!challenge) return false;
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumed: true },
  });
  return true;
}
