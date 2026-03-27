#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="root@187.77.177.121"
APP_DIR="/var/www/orgcentral-app"

echo "=== OrgCentral Deploy ==="

# 1. Commit and push any uncommitted changes
cd "$(dirname "$0")"

if [ -n "$(git status --porcelain)" ]; then
    echo "[1/3] Committing local changes..."
    git add -A
    git commit -m "Pre-deploy: $(date +%Y-%m-%d_%H:%M)"
else
    echo "[1/3] No local changes to commit."
fi

echo "[1/3] Pushing to GitHub..."
git push origin main

# 2. Deploy on VPS
echo "[2/3] Deploying on VPS..."
ssh -o StrictHostKeyChecking=accept-new "$VPS_HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /var/www/orgcentral-app

echo "  Pulling latest..."
git pull origin main

echo "  Installing dependencies..."
npm ci --omit=dev

echo "  Generating Prisma client..."
npx prisma generate

echo "  Building..."
npm run build

echo "  Restarting app..."
if pm2 describe orgcentral > /dev/null 2>&1; then
    pm2 restart orgcentral
else
    pm2 start npm --name orgcentral -- start
fi

pm2 save
REMOTE

# 3. Done
echo "[3/3] Deploy complete."
echo "  VPS: $VPS_HOST"
echo "  App: $APP_DIR"
