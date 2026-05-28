#!/bin/bash
set -e

echo "=== [1/5] Validating environment variables ==="
if [ -z "$DATABASE_URL" ]; then echo "FAIL: DATABASE_URL not set"; exit 1; fi
if [ -z "$JWT_SECRET" ]; then echo "FAIL: JWT_SECRET not set"; exit 1; fi
echo "All required env vars present"
echo ""

echo "=== [2/5] Prisma generate ==="
npm run prisma:generate
echo ""

echo "=== [3/5] Prisma migrate deploy ==="
npx prisma migrate deploy
echo ""

echo "=== [4/5] Database seed ==="
npx tsx prisma/seed.ts
echo ""

echo "=== [5/5] Starting application ==="
exec node dist/src/main.js
