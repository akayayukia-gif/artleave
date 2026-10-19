#!/usr/bin/env bash
# B-01 DBバックアップ（毎日 3:00）
# pg_dump で日次ダンプを作り、読み込めることを確認してから保存する。日次7世代・週次4世代を残す。
set -euo pipefail
cd "$(dirname "$0")/.."
BK=/srv/artleave/backups/db
DATE=$(date +%Y%m%d)
TMP="$BK/daily/.artleave_${DATE}.dump.tmp"
OUT="$BK/daily/artleave_${DATE}.dump"
mkdir -p "$BK/daily" "$BK/weekly"

trap 'rm -f "$TMP"' ERR
docker compose exec -T db pg_dump -U artleave -Fc artleave > "$TMP"
docker compose exec -T db pg_restore --list < "$TMP" > /dev/null   # 壊れたダンプを残さない
mv "$TMP" "$OUT"

[ "$(date +%u)" = "7" ] && cp "$OUT" "$BK/weekly/"
ls -1t "$BK"/daily/*.dump  | tail -n +8 | xargs -r rm -f
ls -1t "$BK"/weekly/*.dump | tail -n +5 | xargs -r rm -f
echo "$(date -Is) backup ok: $OUT ($(du -h "$OUT" | cut -f1))"
