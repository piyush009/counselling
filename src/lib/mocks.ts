import { prisma } from "./prisma";

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
  // Demo: default yes unless explicitly forced to no
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
