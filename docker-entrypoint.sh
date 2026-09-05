#!/bin/sh
set -e

echo "🚀 Starting TaskFlow container..."

# Check and sync database schema if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Syncing database schema with Prisma (DATABASE_URL configured)..."
  MAX_RETRIES=10
  COUNT=0
  until npx prisma db push --skip-generate || [ $COUNT -ge $MAX_RETRIES ]; do
    COUNT=$((COUNT + 1))
    echo "⏳ Database connection pending. Retrying in 3s ($COUNT/$MAX_RETRIES)..."
    sleep 3
  done

  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "⚠️ Warning: Database synchronization timed out, continuing to start server..."
  else
    echo "✅ Database schema synchronized successfully!"
  fi
else
  echo "ℹ️ DATABASE_URL not set in environment, skipping prisma db push."
fi

echo "✨ Starting TaskFlow Next.js server on port ${PORT:-3000}..."
exec node server.js
