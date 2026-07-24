import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DOCUMENTS = [
  "Photo ID / Aadhaar",
  "10th Marksheet",
  "12th Marksheet",
  "Category Certificate",
  "Domicile Certificate",
  "Transfer Certificate",
];

const CANDIDATES = [
  { roll: "BPC2026001", name: "Aarav Sharma", father: "Rakesh Sharma", exam: "NEET UG 2026", cat: "General", phone: "9800000001", aadhaar: "234567890001", m10: "92.4%", m12: "89.0%", table: 1 },
  { roll: "BPC2026002", name: "Priya Verma", father: "Suresh Verma", exam: "NEET UG 2026", cat: "OBC", phone: "9800000002", aadhaar: "234567890002", m10: "88.0%", m12: "91.2%", table: 1 },
  { roll: "BPC2026003", name: "Rohan Gupta", father: "Anil Gupta", exam: "NEET UG 2026", cat: "General", phone: "9800000003", aadhaar: "234567890003", m10: "85.6%", m12: "84.0%", table: 2 },
  { roll: "BPC2026004", name: "Ananya Singh", father: "Vikram Singh", exam: "NEET UG 2026", cat: "SC", phone: "9800000004", aadhaar: "234567890004", m10: "90.2%", m12: "87.5%", table: 2 },
  { roll: "BPC2026005", name: "Kabir Khan", father: "Imran Khan", exam: "NEET UG 2026", cat: "General", phone: "9800000005", aadhaar: "234567890005", m10: "81.0%", m12: "80.4%", table: 3 },
  { roll: "BPC2026006", name: "Ishita Patel", father: "Nitin Patel", exam: "NEET UG 2026", cat: "ST", phone: "9800000006", aadhaar: "234567890006", m10: "86.8%", m12: "88.1%", table: 3 },
  { roll: "BPC2026007", name: "Vivaan Mehta", father: "Paresh Mehta", exam: "NEET UG 2026", cat: "EWS", phone: "9800000007", aadhaar: "234567890007", m10: "93.0%", m12: "90.0%", table: 4 },
  { roll: "BPC2026008", name: "Diya Joshi", father: "Hemant Joshi", exam: "NEET UG 2026", cat: "OBC", phone: "9800000008", aadhaar: "234567890008", m10: "87.4%", m12: "86.0%", table: 4 },
  { roll: "BPC2026009", name: "Arjun Nair", father: "Sanjay Nair", exam: "NEET UG 2026", cat: "General", phone: "9800000009", aadhaar: "234567890009", m10: "84.2%", m12: "83.5%", table: 5 },
  { roll: "BPC2026010", name: "Meera Iyer", father: "Ravi Iyer", exam: "NEET UG 2026", cat: "General", phone: "9800000010", aadhaar: "234567890010", m10: "91.5%", m12: "92.0%", table: 5 },
  { roll: "BPC2026011", name: "Yash Reddy", father: "Kiran Reddy", exam: "NEET UG 2026", cat: "OBC", phone: "9800000011", aadhaar: "234567890011", m10: "79.8%", m12: "81.2%", table: 6 },
  { roll: "BPC2026012", name: "Sara Ali", father: "Farhan Ali", exam: "NEET UG 2026", cat: "EWS", phone: "9800000012", aadhaar: "234567890012", m10: "88.6%", m12: "85.4%", table: 6 },
];

async function main() {
  await prisma.sessionDocument.deleteMany();
  await prisma.counsellingSession.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.candidateTableMap.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.documentTemplate.deleteMany();
  await prisma.deskTable.deleteMany();
  await prisma.admin.deleteMany();

  await prisma.admin.create({
    data: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
    },
  });

  const tables = [];
  for (let i = 1; i <= 6; i++) {
    const t = await prisma.deskTable.create({
      data: {
        number: i,
        name: `Counselling Table ${i}`,
        computerLabel: `PC-${i}`,
        userId: `table${i}`,
        phone: `990000000${i}`,
        masterOtp: `MASTER${i}`,
        attr1: "Zone A",
        attr2: i % 2 === 0 ? "Morning Shift" : "Full Day",
        attr3: "Biometric Enabled",
        signaturePath: `/signatures/table${i}.svg`,
        isActive: true,
      },
    });
    tables.push(t);
  }

  for (let i = 0; i < DOCUMENTS.length; i++) {
    await prisma.documentTemplate.create({
      data: { name: DOCUMENTS[i], sortOrder: i + 1, isActive: true },
    });
  }

  for (const c of CANDIDATES) {
    const table = tables.find((t) => t.number === c.table)!;
    const candidate = await prisma.candidate.create({
      data: {
        rollNumber: c.roll,
        name: c.name,
        fatherName: c.father,
        examPassed: c.exam,
        category: c.cat,
        phone: c.phone,
        aadhaarNumber: c.aadhaar,
        photoUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=1e3a8a&textColor=ffffff`,
        marks10th: c.m10,
        marks12th: c.m12,
        dob: "2005-06-15",
        address: `Sample Address, City ${c.table}`,
        email: `${c.roll.toLowerCase()}@example.com`,
      },
    });
    await prisma.candidateTableMap.create({
      data: { candidateId: candidate.id, tableId: table.id },
    });
  }

  console.log("Seed complete.");
  console.log("Admin: admin / admin123");
  console.log("Table phones: 9900000001 … 9900000006 (Master OTP: MASTER1 … MASTER6)");
  console.log("Sample rolls: BPC2026001 (Table 1), BPC2026003 (Table 2), …");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
