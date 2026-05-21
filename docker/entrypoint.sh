#!/bin/bash
set -euo pipefail

VAULT=${VAULT_PATH:-/vault}

cd /app

echo "[$(date '+%Y-%m-%d %H:%M:%S')] sync"
ob sync --path "$VAULT"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] build + deploy"
VAULT_PATH="$VAULT" npm run deploy

echo "[$(date '+%Y-%m-%d %H:%M:%S')] done"
