# Counselling Desk

Multi-table counselling verification system built from the audio briefing requirements.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite
- Mock BPC API and fingerprint (AKPI) vendor API
- Demo OTP shown in UI (no real SMS)
- **UI v2** aligned with BTSC Teacher Recruitment Portal (navy/blue header, cyan accent, Plus Jakarta Sans)

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

```bash
cp .env.docker.example .env
docker compose up -d --build
```

App: [http://localhost:3000](http://localhost:3000)  
SQLite + uploads persist in Docker volumes (`counselling-data`, `counselling-uploads`).

```bash
docker compose logs -f counselling
docker compose down
```

## Demo credentials

### Master Admin
- URL: `/admin/login`
- Username: `admin`
- Password: `admin123`

### Table Officer
- URL: `/table/login`
- Phones: `9900000001` … `9900000006` (Tables 1–6)
- OTP: shown on screen after “Send OTP”
- Master OTP fallback: `MASTER1` … `MASTER6`

### Sample mapped roll numbers
| Roll | Table |
|------|-------|
| BPC2026001, BPC2026002 | 1 |
| BPC2026003, BPC2026004 | 2 |
| BPC2026005, BPC2026006 | 3 |
| BPC2026007, BPC2026008 | 4 |
| BPC2026009, BPC2026010 | 5 |
| BPC2026011, BPC2026012 | 6 |

Trying a roll on the wrong table shows: **User is not mapped with this table or this system.**

## Modules

1. **Master Admin** — tables/users, signature upload, 3 attributes, candidate mapping, document templates, reports
2. **Table login** — phone OTP + master OTP
3. **Counselling wizard** — BPC profile → brief/full info → candidate OTP → fingerprint → dynamic documents → finalize
4. **Certificate** — printable acknowledgement with photo, QR, officer signature
5. **Public verify** — `/verify/[token]` from QR code

## Outcome rules

- Any document marked **doubtful** or **wrong** → counselling **unsuccessful**
- All documents **correct** → counselling **successful**
