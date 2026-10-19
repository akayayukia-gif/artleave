#!/usr/bin/env bash
# B-03 期限切れ・使用済みのパスワード再設定トークンを削除（毎日 4:30）
set -euo pipefail
cd "$(dirname "$0")/.."
docker compose exec -T db psql -U artleave -d artleave -v ON_ERROR_STOP=1 -c \
  "DELETE FROM password_reset_tokens WHERE used_at IS NOT NULL OR expires_at < now() - interval '1 day';"
