#!/bin/sh
set -eu

mkdir -p /app/data /app/public/uploads

if [ ! -f /app/data/.seeded ]; then
  echo "Initializing SQLite database from image seed..."
  cp /app/docker-seed.db /app/data/dev.db
  touch /app/data/.seeded
fi

echo "Starting Counselling Desk on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec node server.js
