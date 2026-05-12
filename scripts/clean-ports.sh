#!/bin/bash
# Clean up stuck Vite processes

echo "🧹 Cleaning up stuck Vite processes..."

# Kill any Node processes running vite
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# On Windows with WSL, also try:
# lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

sleep 2

# Verify
if ! pgrep -f "vite" > /dev/null 2>&1; then
  echo "✅ All Vite processes cleaned"
else
  echo "⚠️  Some processes still running, trying harder..."
  pkill -9 -f "vite" 2>/dev/null || true
  sleep 1
  echo "✅ Forcefully killed"
fi

# Clean cache
echo "🗑️  Cleaning Vite cache..."
rm -rf .vite 2>/dev/null
rm -rf dist 2>/dev/null
rm -f server.log 2>/dev/null

echo "✅ Done! Run 'npm run dev' to start fresh server"
