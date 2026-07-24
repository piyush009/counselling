#!/bin/sh
set -eu

mkdir -p /app/data /app/public/uploads

echo "Applying database schema..."
npx prisma db push

if [ ! -f /app/data/.seeded ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
  touch /app/data/.seeded
  echo "Seed complete."
else
  echo "Database already seeded — skipping."
fi

echo "Starting Counselling Desk on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec npx next start -H "${HOSTNAME:-0.0.0.0}" -p "${PORT:-3000}"
