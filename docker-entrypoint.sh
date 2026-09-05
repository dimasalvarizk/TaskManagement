#!/bin/sh
set -e

echo "🚀 Starting TaskFlow container entrypoint..."

# Check and sync database schema if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Syncing database schema with Prisma (DATABASE_URL configured)..."
  MAX_RETRIES=20
  COUNT=0
  
  until npx prisma db push --accept-data-loss --skip-generate || [ $COUNT -ge $MAX_RETRIES ]; do
    COUNT=$((COUNT + 1))
    echo "⏳ Database is starting up. Retrying in 3s ($COUNT/$MAX_RETRIES)..."
    sleep 3
  done

  if [ $COUNT -lt $MAX_RETRIES ]; then
    echo "✅ Database schema synchronized successfully!"
    echo "🌱 Checking / Seeding default demo data..."
    npx tsx prisma/seed.ts || true
    echo "✅ Database ready!"
  else
    echo "⚠️ Warning: Database synchronization timed out, proceeding to start server..."
  fi
else
  echo "ℹ️ DATABASE_URL not set in environment, skipping prisma db push."
fi

echo "✨ Starting TaskFlow Next.js server on port ${PORT:-3000}..."
exec node server.js
