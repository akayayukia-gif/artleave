#!/usr/bin/env bash
# B-06 30日より古いバッチのログを削除（毎日 5:00）
set -euo pipefail
find /srv/artleave/logs/batch -name '*.log' -mtime +30 -delete
