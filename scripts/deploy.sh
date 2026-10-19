#!/usr/bin/env bash
# 本番デプロイ（GitHub Actions から SSH で呼ばれる。手動でも実行できる）
# 1. 念のためDBをバックアップ  2. 最新のコードを取得  3. ビルドして入れ替え（migrate も自動実行）
# 4. 起動確認。失敗したら前のバージョンに戻す
set -euo pipefail
cd "$(dirname "$0")/.."
source .env
LOG=/srv/artleave/logs/batch/deploy_$(date +%Y%m%d_%H%M%S).log
mkdir -p "$(dirname "$LOG")"
exec > >(tee -a "$LOG") 2>&1

PREV=$(git rev-parse HEAD)
echo "== 現在のバージョン: $PREV"

BK=/srv/artleave/backups/db
mkdir -p "$BK"
docker compose exec -T db pg_dump -U artleave -Fc artleave > "$BK/predeploy_$(date +%Y%m%d_%H%M%S).dump"
ls -1t "$BK"/predeploy_*.dump | tail -n +4 | xargs -r rm -f   # 3世代だけ残す

git fetch origin main
git reset --hard origin/main
echo "== 新しいバージョン: $(git rev-parse HEAD)"

docker compose up -d --build

for _ in $(seq 1 36); do
  if curl -fsS --resolve "${DOMAIN}:443:127.0.0.1" "https://${DOMAIN}/api/v1/health" > /dev/null; then
    echo "== デプロイ成功"
    docker image prune -f
    exit 0
  fi
  sleep 5
done

echo "== 起動確認に失敗。前のバージョン ($PREV) に戻します"
git reset --hard "$PREV"
docker compose up -d --build
exit 1
