import { prisma } from "./prisma";
import { randomUUID } from "crypto";

/** Mock BPC API — returns candidate profile by roll number */
export async function fetchBpcCandidate(rollNumber: string) {
  const candidate = await prisma.candidate.findUnique({
    where: { rollNumber },
  });
  if (!candidate) {
    return { ok: false as const, error: "Roll number not found in BPC" };
  }
  return {
    ok: true as const,
    data: {
      rollNumber: candidate.rollNumber,
      name: candidate.name,
      fatherName: candidate.fatherName,
      examPassed: candidate.examPassed,
      category: candidate.category,
      phone: candidate.phone,
      aadhaarNumber: candidate.aadhaarNumber,
      photoUrl: candidate.photoUrl,
      marks10th: candidate.marks10th,
      marks12th: candidate.marks12th,
      dob: candidate.dob,
      address: candidate.address,
      email: candidate.email,
    },
  };
}

/** Mock fingerprint / AKPI vendor API */
export async function verifyFingerprint(opts: {
  rollNumber: string;
  forceResult?: "yes" | "no";
}) {
  const result = opts.forceResult === "no" ? "no" : "yes";
  return {
    ok: true as const,
    match: result === "yes",
    vendor: "AKPI",
    message:
      result === "yes"
        ? "Fingerprint matched"
        : "Fingerprint did not match",
  };
}

export function normalizeAadhaar(raw: string) {
  return raw.replace(/\D/g, "");
}

export function maskAadhaar(aadhaar: string) {
  const n = normalizeAadhaar(aadhaar);
  if (n.length !== 12) return "XXXX-XXXX-XXXX";
  return `XXXX-XXXX-${n.slice(-4)}`;
}

/**
 * Mock Aadhaar / UIDAI integration (BTSC PPT):
 * OTP eKYC + deduplication against previously verified counselling records.
 */
export async function lookupAadhaar(opts: {
  aadhaarNumber: string;
  expectedName?: string;
}) {
  const aadhaar = normalizeAadhaar(opts.aadhaarNumber);
  if (!/^\d{12}$/.test(aadhaar)) {
    return { ok: false as const, error: "Enter a valid 12-digit Aadhaar number" };
  }
  if (/^0+$/.test(aadhaar)) {
    return { ok: false as const, error: "Invalid Aadhaar number" };
  }

  const linked = await prisma.candidate.findFirst({
    where: { aadhaarNumber: aadhaar },
  });

  const name = linked?.name || opts.expectedName || "Aadhaar Registered Citizen";

  return {
    ok: true as const,
    data: {
      aadhaarNumber: aadhaar,
      masked: maskAadhaar(aadhaar),
      name,
      phoneMasked: linked?.phone
        ? `XXXXXX${linked.phone.slice(-4)}`
        : "XXXXXX0000",
      ref: `UIDAI-${randomUUID().slice(0, 8).toUpperCase()}`,
    },
  };
}

/** Deduplication: same Aadhaar already verified on another counselling record */
export async function checkAadhaarDedup(opts: {
  aadhaarNumber: string;
  excludeSessionId?: string;
  excludeCandidateId?: string;
}) {
  const aadhaar = normalizeAadhaar(opts.aadhaarNumber);

  const hit = await prisma.counsellingSession.findFirst({
    where: {
      aadhaarOk: true,
      id: opts.excludeSessionId ? { not: opts.excludeSessionId } : undefined,
      candidateId: opts.excludeCandidateId
        ? { not: opts.excludeCandidateId }
        : undefined,
      candidate: { aadhaarNumber: aadhaar },
      OR: [
        { status: "successful" },
        { status: "unsuccessful" },
        { pdfGenerated: true },
      ],
    },
    include: { candidate: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!hit) return { duplicate: false as const };

  return {
    duplicate: true as const,
    rollNumber: hit.candidate.rollNumber,
    name: hit.candidate.name,
    status: hit.status,
  };
}
