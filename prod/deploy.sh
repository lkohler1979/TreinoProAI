#!/usr/bin/env bash
# Redeploy do TreinoPro.AI na VPS depois de uma mudanca de codigo.
#
# Uso (na VPS, dentro de /var/www/treino):
#   ./app/prod/deploy.sh
#
# O que faz, em ordem: git pull, build do backend, migrations do Prisma,
# build do frontend, restart dos processos no PM2. Para no primeiro erro.

set -euo pipefail

ROOT_DIR="/var/www/treino"
APP_DIR="$ROOT_DIR/app"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOCK_FILE="/tmp/treino-deploy.lock"

log() {
  printf '\n\033[1;36m[deploy] %s\033[0m\n' "$1"
}

fail() {
  printf '\n\033[1;31m[deploy] ERRO: %s\033[0m\n' "$1" >&2
  exit 1
}

exec 200>"$LOCK_FILE"
flock -n 200 || fail "ja existe um deploy em andamento (lock: $LOCK_FILE)"

[ -d "$APP_DIR/.git" ] || fail "repositorio nao encontrado em $APP_DIR"
[ -f "$BACKEND_DIR/.env" ] || fail "faltando $BACKEND_DIR/.env (veja prod/DEPLOY.md)"
[ -f "$FRONTEND_DIR/.env.production" ] || fail "faltando $FRONTEND_DIR/.env.production (veja prod/DEPLOY.md)"

log "1/6 - Atualizando o repositorio (git pull)"
cd "$APP_DIR"
if [ -n "$(git status --porcelain)" ]; then
  fail "existem mudancas locais nao commitadas em $APP_DIR - resolva antes de dar deploy (git status)"
fi
git pull --ff-only

log "2/6 - Instalando dependencias do backend"
cd "$BACKEND_DIR"
pnpm install --frozen-lockfile

log "3/6 - Buildando o backend (prisma generate + tsc)"
pnpm run build

log "4/6 - Rodando migrations do Prisma"
pnpm exec prisma migrate deploy

log "5/6 - Instalando dependencias e buildando o frontend"
cd "$FRONTEND_DIR"
pnpm install --frozen-lockfile
pnpm run build

log "6/6 - Reiniciando os processos no PM2"
cp "$APP_DIR/prod/ecosystem.config.js" "$ROOT_DIR/ecosystem.config.js"
cd "$ROOT_DIR"
pm2 restart ecosystem.config.js --update-env
pm2 save

sleep 2

log "Verificando os processos"
pm2 status

log "Checando as portas locais"
curl -fsS -o /dev/null -w "backend  (127.0.0.1:8080): %{http_code}\n" http://127.0.0.1:8080/ || echo "backend  (127.0.0.1:8080): SEM RESPOSTA"
curl -fsS -o /dev/null -w "frontend (127.0.0.1:3000): %{http_code}\n" http://127.0.0.1:3000/auth || echo "frontend (127.0.0.1:3000): SEM RESPOSTA"

log "Deploy concluido"
