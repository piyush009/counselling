#!/bin/sh
set -eu

mkdir -p /app/data /app/public/uploads

if [ ! -f /app/data/.seeded ]; then
  echo "Initializing SQLite database from image seed..."
  cp /app/docker-seed.db /app/data/dev.db
  touch /app/data/.seeded
fi

if [ -f ./node_modules/prisma/build/index.js ]; then
  echo "Applying database schema updates..."
  node ./node_modules/prisma/build/index.js db push --skip-generate || \
    echo "Warning: schema push failed; continuing with existing DB."
fi

echo "Starting Counselling Desk on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec node server.js
