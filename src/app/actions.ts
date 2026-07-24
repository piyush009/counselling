"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { createOtp, verifyOtp } from "@/lib/otp";
import { fetchBpcCandidate, verifyFingerprint, lookupAadhaar, checkAadhaarDedup, normalizeAadhaar } from "@/lib/mocks";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function adminLogin(formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Invalid username or password" };
  }
  const token = await signToken({ role: "admin", username });
  const jar = await cookies();
  jar.set("admin_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function adminLogout() {
  const jar = await cookies();
  jar.delete("admin_session");
  redirect("/admin/login");
}

export async function upsertTable(formData: FormData) {
  const id = String(formData.get("id") || "");
  const data = {
    number: Number(formData.get("number")),
    name: String(formData.get("name") || "").trim(),
    computerLabel: String(formData.get("computerLabel") || "").trim(),
    userId: String(formData.get("userId") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    masterOtp: String(formData.get("masterOtp") || "").trim(),
    attr1: String(formData.get("attr1") || "").trim(),
    attr2: String(formData.get("attr2") || "").trim(),
    attr3: String(formData.get("attr3") || "").trim(),
    isActive: formData.get("isActive") === "on",
  };

  const file = formData.get("signature") as File | null;
  let signaturePath: string | undefined;
  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploads = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploads, { recursive: true });
    const filename = `sig-${data.number}-${Date.now()}${path.extname(file.name) || ".png"}`;
    await writeFile(path.join(uploads, filename), bytes);
    signaturePath = `/uploads/${filename}`;
  }

  if (id) {
    await prisma.deskTable.update({
      where: { id },
      data: {
        ...data,
        ...(signaturePath ? { signaturePath } : {}),
      },
    });
  } else {
    await prisma.deskTable.create({
      data: {
        ...data,
        signaturePath: signaturePath || `/signatures/table${data.number}.svg`,
      },
    });
  }
  revalidatePath("/admin/tables");
  redirect("/admin/tables");
}

export async function mapCandidate(formData: FormData) {
  const rollNumber = String(formData.get("rollNumber") || "").trim();
  const tableId = String(formData.get("tableId") || "");
  let candidate = await prisma.candidate.findUnique({ where: { rollNumber } });
  if (!candidate) {
    candidate = await prisma.candidate.create({
      data: {
        rollNumber,
        name: String(formData.get("name") || "New Candidate"),
        fatherName: String(formData.get("fatherName") || "-"),
        examPassed: String(formData.get("examPassed") || "NEET UG 2026"),
        category: String(formData.get("category") || "General"),
        phone: String(formData.get("phone") || "9800000999"),
        marks10th: String(formData.get("marks10th") || "-"),
        photoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(rollNumber)}&backgroundColor=0f2744&textColor=ffffff`,
      },
    });
  }
  await prisma.candidateTableMap.upsert({
    where: {
      candidateId_tableId: { candidateId: candidate.id, tableId },
    },
    create: { candidateId: candidate.id, tableId },
    update: {},
  });
  revalidatePath("/admin/mapping");
  redirect("/admin/mapping");
}

export async function removeMapping(formData: FormData) {
  const id = String(formData.get("id") || "");
  await prisma.candidateTableMap.delete({ where: { id } });
  revalidatePath("/admin/mapping");
}

export async function upsertDocument(formData: FormData) {
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const isActive = formData.get("isActive") === "on";
  if (id) {
    await prisma.documentTemplate.update({
      where: { id },
      data: { name, sortOrder, isActive },
    });
  } else {
    await prisma.documentTemplate.create({
      data: { name, sortOrder, isActive },
    });
  }
  revalidatePath("/admin/documents");
  redirect("/admin/documents");
}

export async function requestTableOtp(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const table = await prisma.deskTable.findFirst({
    where: { phone, isActive: true },
  });
  if (!table) return { error: "No active table found for this phone" };
  const challenge = await createOtp("table_login", phone, table.id);
  return {
    ok: true,
    demoOtp: challenge.code,
    masterOtpHint: table.masterOtp,
    tableName: table.name,
    tableNumber: table.number,
  };
}

export async function verifyTableLogin(formData: FormData) {
  const phone = String(formData.get("phone") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const table = await prisma.deskTable.findFirst({
    where: { phone, isActive: true },
  });
  if (!table) return { error: "No active table found for this phone" };

  const otpOk = await verifyOtp("table_login", phone, code);
  const masterOk = code === table.masterOtp;
  if (!otpOk && !masterOk) {
    return { error: "Invalid OTP. Use SMS OTP or Master OTP." };
  }

  await prisma.tableSession.updateMany({
    where: { tableId: table.id, isOpen: true },
    data: { isOpen: false, closedAt: new Date() },
  });
  const session = await prisma.tableSession.create({
    data: { tableId: table.id, token: randomUUID(), isOpen: true },
  });
  const token = await signToken({
    role: "table",
    tableId: table.id,
    tableNumber: table.number,
    sessionToken: session.token,
  });
  const jar = await cookies();
  jar.set("table_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/table");
}

export async function tableLogout() {
  const jar = await cookies();
  jar.delete("table_session");
  redirect("/table/login");
}

export async function startCounselling(formData: FormData) {
  const { getTableSession } = await import("@/lib/auth");
  const session = await getTableSession();
  if (!session) redirect("/table/login");

  const rollNumber = String(formData.get("rollNumber") || "").trim().toUpperCase();
  const candidate = await prisma.candidate.findUnique({
    where: { rollNumber },
    include: { mappings: true },
  });
  if (!candidate) {
    return { error: "Roll number not found in BPC" };
  }
  const mapped = candidate.mappings.some((m) => m.tableId === session.tableId);
  if (!mapped) {
    return {
      error:
        "User is not mapped with this table or this system.",
    };
  }

  const bpc = await fetchBpcCandidate(rollNumber);
  if (!bpc.ok) return { error: bpc.error };

  // Resume latest session for this candidate on this table
  const existing = await prisma.counsellingSession.findFirst({
    where: {
      candidateId: candidate.id,
      tableId: session.tableId,
    },
    orderBy: { updatedAt: "desc" },
    include: { documents: true },
  });

  if (existing) {
    const isCompleted =
      existing.step === "done" ||
      existing.status === "successful" ||
      existing.status === "unsuccessful" ||
      Boolean(existing.pdfGenerated && existing.completedAt);

    if (isCompleted) {
      // Do not mutate yet — show status gate (success/fail + edit confirm + QR page)
      redirect(`/table/session/${existing.id}/status`);
    }

    const resumeStep =
      existing.step === "roll" ? "brief" : existing.step || "brief";
    if (resumeStep !== existing.step) {
      await prisma.counsellingSession.update({
        where: { id: existing.id },
        data: { step: resumeStep },
      });
    }

    redirect(`/table/session/${existing.id}`);
  }

  const templates = await prisma.documentTemplate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const counselling = await prisma.counsellingSession.create({
    data: {
      candidateId: candidate.id,
      tableId: session.tableId,
      verifyToken: randomUUID().replace(/-/g, ""),
      status: "in_progress",
      step: "brief",
      documents: {
        create: templates.map((t) => ({
          templateId: t.id,
          status: "pending",
        })),
      },
    },
  });

  redirect(`/table/session/${counselling.id}`);
}

export async function advanceStep(formData: FormData) {
  const id = String(formData.get("sessionId") || "");
  const step = String(formData.get("step") || "");
  await prisma.counsellingSession.update({
    where: { id },
    data: { step },
  });
  revalidatePath(`/table/session/${id}`);
  redirect(`/table/session/${id}`);
}

export async function sendCandidateOtp(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
    include: { candidate: true },
  });
  if (!session) return { error: "Session not found" };
  const challenge = await createOtp(
    "candidate_verify",
    session.candidate.id,
    session.tableId
  );
  return { ok: true, demoOtp: challenge.code, phone: session.candidate.phone };
}

export async function verifyCandidateOtp(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const code = String(formData.get("code") || "").trim();
  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
    include: { candidate: true },
  });
  if (!session) return { error: "Session not found" };
  const ok = await verifyOtp("candidate_verify", session.candidate.id, code);
  if (!ok) return { error: "Invalid or expired OTP" };
  await prisma.counsellingSession.update({
    where: { id: sessionId },
    data: { candidateOtpOk: true, step: "fingerprint" },
  });
  revalidatePath(`/table/session/${sessionId}`);
  redirect(`/table/session/${sessionId}`);
}

export async function runFingerprint(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const force = String(formData.get("force") || "yes") as "yes" | "no";
  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
    include: { candidate: true },
  });
  if (!session) return { error: "Session not found" };
  if (!session.candidateOtpOk) return { error: "Complete candidate OTP first" };

  const result = await verifyFingerprint({
    rollNumber: session.candidate.rollNumber,
    forceResult: force,
  });
  if (!result.match) {
    return { error: result.message };
  }
  await prisma.counsellingSession.update({
    where: { id: sessionId },
    data: { fingerprintOk: true, step: "aadhaar" },
  });
  revalidatePath(`/table/session/${sessionId}`);
  redirect(`/table/session/${sessionId}`);
}

export async function sendAadhaarOtp(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const aadhaarRaw = String(formData.get("aadhaarNumber") || "");
  const consent = String(formData.get("consent") || "") === "on";

  if (!consent) {
    return { error: "Aadhaar eKYC consent is required to proceed" };
  }

  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
    include: { candidate: true },
  });
  if (!session) return { error: "Session not found" };
  if (!session.fingerprintOk) {
    return { error: "Complete fingerprint authentication first" };
  }

  const lookup = await lookupAadhaar({
    aadhaarNumber: aadhaarRaw,
    expectedName: session.candidate.name,
  });
  if (!lookup.ok) return { error: lookup.error };

  const dedup = await checkAadhaarDedup({
    aadhaarNumber: lookup.data.aadhaarNumber,
    excludeSessionId: sessionId,
    excludeCandidateId: session.candidateId,
  });
  if (dedup.duplicate) {
    return {
      error: `Aadhaar already used for counselling of ${dedup.rollNumber} (${dedup.name}). Deduplication check failed.`,
    };
  }

  // Persist Aadhaar on candidate record for future dedup
  await prisma.candidate.update({
    where: { id: session.candidateId },
    data: { aadhaarNumber: lookup.data.aadhaarNumber },
  });

  const challenge = await createOtp(
    "aadhaar_verify",
    lookup.data.aadhaarNumber,
    session.tableId
  );

  return {
    ok: true,
    demoOtp: challenge.code,
    masked: lookup.data.masked,
    name: lookup.data.name,
    phoneMasked: lookup.data.phoneMasked,
    ref: lookup.data.ref,
    aadhaarNumber: lookup.data.aadhaarNumber,
  };
}

export async function verifyAadhaarOtp(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const aadhaarNumber = String(formData.get("aadhaarNumber") || "");
  const code = String(formData.get("code") || "").trim();
  const aadhaarName = String(formData.get("aadhaarName") || "").trim();
  const aadhaarRef = String(formData.get("aadhaarRef") || "").trim();

  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
    include: { candidate: true },
  });
  if (!session) return { error: "Session not found" };

  const aadhaar = normalizeAadhaar(aadhaarNumber);
  const ok = await verifyOtp("aadhaar_verify", aadhaar, code);
  if (!ok) return { error: "Invalid or expired Aadhaar OTP" };

  const dedup = await checkAadhaarDedup({
    aadhaarNumber: aadhaar,
    excludeSessionId: sessionId,
    excludeCandidateId: session.candidateId,
  });
  if (dedup.duplicate) {
    return {
      error: `Aadhaar already used for counselling of ${dedup.rollNumber} (${dedup.name}).`,
    };
  }

  await prisma.counsellingSession.update({
    where: { id: sessionId },
    data: {
      aadhaarOk: true,
      aadhaarLast4: aadhaar.slice(-4),
      aadhaarName: aadhaarName || session.candidate.name,
      aadhaarRef: aadhaarRef || `UIDAI-${aadhaar.slice(-4)}`,
      step: "documents",
    },
  });

  revalidatePath(`/table/session/${sessionId}`);
  redirect(`/table/session/${sessionId}`);
}

export async function saveDocumentReview(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const docId = String(formData.get("docId") || "");
  const status = String(formData.get("status") || "pending");
  const remark = String(formData.get("remark") || "").trim();

  if (status === "doubtful" && !remark) {
    return { error: "Remark required for doubtful documents" };
  }

  await prisma.sessionDocument.update({
    where: { id: docId },
    data: {
      status,
      // Keep comment text so prior remarks stay visible when reopening / editing
      remark: remark || null,
    },
  });
  revalidatePath(`/table/session/${sessionId}`);
  return { ok: true };
}

export async function finalizeCounselling(formData: FormData) {
  const sessionId = String(formData.get("sessionId") || "");
  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
    include: { documents: true },
  });
  if (!session) return { error: "Session not found" };
  if (!session.fingerprintOk) return { error: "Fingerprint not verified" };
  if (!session.aadhaarOk) return { error: "Aadhaar verification is required" };

  const pending = session.documents.some((d) => d.status === "pending");
  if (pending) return { error: "Review all documents before finalize" };

  const hasDoubtful = session.documents.some((d) => d.status === "doubtful");
  const hasWrong = session.documents.some((d) => d.status === "wrong");
  const allCorrect = session.documents.every((d) => d.status === "correct");

  let status: "successful" | "unsuccessful" = "unsuccessful";
  if (allCorrect && !hasDoubtful && !hasWrong) status = "successful";
  if (hasDoubtful || hasWrong) status = "unsuccessful";

  await prisma.counsellingSession.update({
    where: { id: sessionId },
    data: {
      status,
      step: "done",
      pdfGenerated: true,
      completedAt: new Date(),
    },
  });
  revalidatePath(`/table/session/${sessionId}`);
  redirect(`/table/session/${sessionId}/result`);
}

export async function confirmEditCounselling(formData: FormData) {
  const { getTableSession } = await import("@/lib/auth");
  const auth = await getTableSession();
  if (!auth) redirect("/table/login");

  const sessionId = String(formData.get("sessionId") || "");
  const session = await prisma.counsellingSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.tableId !== auth.tableId) {
    return { error: "Session not found" };
  }

  await prisma.counsellingSession.update({
    where: { id: sessionId },
    data: {
      step: session.aadhaarOk || session.pdfGenerated ? "documents" : "aadhaar",
      status: "in_progress",
      // Grandfather pre-Aadhaar completed records so re-edit can finalize
      aadhaarOk: session.aadhaarOk || session.pdfGenerated,
      notes: `reopened_from:${session.status}`,
    },
  });

  revalidatePath(`/table/session/${sessionId}`);
  redirect(`/table/session/${sessionId}`);
}
