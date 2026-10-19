#!/usr/bin/env bash
# B-02 外部ストレージ（Google ドライブ）への退避（毎日 3:30）
# rclone の暗号化リモート「remote-crypt」を使う（設定は 13_環境構築・デプロイ手順書 2.15）。
set -euo pipefail
SRC=/srv/artleave
DEST=remote-crypt:artleave
TODAY=$(date +%Y%m%d)

if ! ls "$SRC/backups/db/daily/artleave_${TODAY}.dump" > /dev/null 2>&1; then
  echo "warning: 今日のDBダンプがありません（B-01 が失敗している可能性）。画像のみ同期します"
else
  rclone sync "$SRC/backups/db" "$DEST/db" --retries 3
fi

# 消したイラストも30日間は uploads-deleted に残す
rclone sync "$SRC/uploads" "$DEST/uploads" --backup-dir "$DEST/uploads-deleted/$TODAY" --retries 3
rclone delete "$DEST/uploads-deleted" --min-age 30d --rmdirs || true
echo "$(date -Is) offsite sync ok"
