# Counselling System — Requirements from Audio Briefing

**Source:** `audio.mp4` (duration ~5 min 17 sec)  
**Captured:** 24 Jul 2026  
**Note:** Speech is mixed English/Hindi. Most content was transcribed; ~40 seconds of Hindi mid-recording (~3:04–3:40) was unclear to automatic transcription and is inferred from surrounding context.

---

## 1. Master Admin

- There is a **Master Admin** role.
- Master Admin can:
  - View **reports**
  - **Create users / tables** (counselling desk setups)
- Setup model discussed:
  - **6 tables** in a group
  - **6 computers** (one per table)
  - Master Admin creates **user IDs** mapped to table numbers (Table 1, Table 2, Table 3, …)
- Each table has a **signature / sign photo** of the officer sitting at that table.
  - When the counselling letter / certificate is generated, this signature is **auto-applied** on the document.

---

## 2. Table Login (OTP)

- Tables have attributes configured and **activated** (mentioned as 3 attributes for the 6 tables).
- On login for a table (e.g. Table 1):
  - Officer enters **phone number**
  - System sends **OTP**
  - OTP is entered to open the table session
- If normal OTP fails / is blocked:
  - There is a **Master OTP** available per table as fallback
- After successful OTP, the table session is **open** (example: Table 1 open).

---

## 3. Open Table — Candidate Mapping

When a table is open, there are **two sections / concepts**:

### 3.1 Candidate–table mapping
- Candidates are **mapped to specific tables**.
- Counselling for a candidate is allowed **only** on the table they are mapped to.
- Other table user IDs **cannot** counsel that candidate.

### 3.2 Unmapped roll number behaviour
- If someone enters a roll number at the wrong table (not mapped):
  - Show error such as: **user is not mapped with this table / this system**.

---

## 4. Counselling Flow (per candidate)

### Step A — Roll number + profile from BPC API
- Officer enters / selects **roll number**.
- System fetches candidate data from **BPC API**, including:
  - Photo
  - Name
  - Exam passed
  - Category
  - Other brief/profile fields
- Photo is shown automatically from API data.
- (Reference made to a PPT already prepared; to be shared later.)

### Step B — Candidate phone OTP (BPC API)
- Using the phone number from BPC API data:
  - Send **OTP** to the candidate’s phone
  - Complete **OTP verification**

### Step C — Fingerprint / tab authentication
- After OTP, **tab (fingerprint) authentication** starts.
- Fingerprint is verified via a **company API** (referred to in speech as something like “A K P I” / fingerprint vendor API).
- API returns **yes / no**.
- If **yes** (fingerprint correct) → proceed to next screen.
- If not → do not proceed.

### Step D — Information screens
- First screen after roll number: **brief information** of the candidate.
- Mid-recording Hindi portion (~40s) appears to continue describing UI screens between brief info and documents (full information / further verification). Exact Hindi wording was not reliably recovered.

### Step E — Document verification (dynamic list)
- Next: open a **dynamic list of documents**.
- For each document, officer can mark:
  - **Correct**
  - **Wrong**
  - **Doubtful**
- If **Doubtful** is selected:
  - A remark box opens below
  - Officer enters why it is doubtful
- After reviewing all documents → **Finalize**

### Step F — Acknowledgement, PDF, QR, print
- On finalize:
  - Show **acknowledgement** that counselling steps are complete / final
  - **Generate PDF**
  - PDF includes:
    - Candidate **photo**
    - **QR code** (linked / described against website content)
    - **Official signature** of the table officer (from table signature photo)
    - Document/content details (example mentioned: **10th marks** corrected/verified content)
- Outcome rules:
  - If **any document is doubtful** → counselling is **not successful** (reflected in report)
  - If **all documents approved** → counselling is **successful**
- **Print** option for the candidate’s counselling output
- Officer can then take up **another roll number** and repeat / generate another PDF

---

## 5. Roles & Systems Summary

| Actor / System | Responsibility |
|---|---|
| Master Admin | Create tables/users, signatures, reports |
| Table officer | Login via OTP, counsel mapped candidates only |
| BPC API | Candidate profile, photo, phone, exam/category data |
| Fingerprint / tab API | Biometric yes/no after OTP |
| Counselling app | Mapping checks, document review, PDF + QR + sign, success/fail reporting |

---

## 6. Success / Failure Rules

1. Candidate must be **mapped** to the current table.
2. Candidate **OTP** must pass.
3. **Fingerprint** must return yes from vendor API.
4. Documents reviewed; any **doubtful** → counselling **unsuccessful**.
5. All documents **approved** → counselling **successful** + printable PDF with QR + officer sign.

---

## 7. Open Items / Ambiguities from Audio

- Exact name of fingerprint vendor API (“A K P I” in transcript — confirm spelling).
- Exact list of the **3 table attributes**.
- Exact fields returned by **BPC API**.
- Exact document checklist (said to be **dynamic**).
- Full content of Hindi mid-section screens (brief → full info → next).
- Master OTP generation / distribution rules.
- How QR code maps to website verification page.

---

## Appendix — Cleaned Transcript (English-oriented)

First of all there will be a Master Admin in which there will be a report, and [admin] will be able to create tables. What will Master Admin do? First of all there will be 6 tables in a group and 6 computers. If [there are] 6 [systems], it will create user IDs for Table 1, Table 2, Table 3, [etc.], with signature photo / sign so that when the counselling letter is written, the sign of the person sitting on that table is automatically applied.

We have made 3 attributes in the 6 tables and activated them. When logging in, for Table 1 the phone number is entered and OTP is sent. If OTP fails, there is a Master OTP for every table. OTP is entered and the table opens (e.g. Table 1).

If Table 1 is open, it will have [mapping]: candidates mapped to these tables can be counselled only on that table. Other user IDs cannot counsel them. If you go to another table, enter roll number, and it is not mapped, it will show that the user is not mapped with this table or this system.

On the mapped system, enter roll number. Photo and details (exam passed, name, category) come from the BPC API; photo auto-shows. Next, OTP goes to the phone number from BPC API and is verified. After that, tab fingerprint authentication starts; the company API returns yes or no. If yes and fingerprint is correct, go to the next screen. First screen: roll number put in and brief information shown.

[Hindi section ~3:04–3:40 — unclear in auto-transcript; continues UI flow toward documents.]

Next: entire document list opens (dynamic). Options: all documents correct / document wrong / document doubtful. If doubtful, a box opens below for remarks. On complete finalize, acknowledgement comes, then PDF generate with QR code, person photo, and official signature of the table. If any document is doubtful, counselling is not successful in the report. If documents are fully approved, it is successful. Print for candidate. Another roll number can be added and PDF generated again.
