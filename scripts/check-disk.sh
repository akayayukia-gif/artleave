#!/usr/bin/env bash
# B-05 ディスク使用率チェック（毎時）。80%以上なら失敗として終了し、通知を出す
set -euo pipefail
LIMIT=80
USED=$(df --output=pcent /srv/artleave | tail -1 | tr -dc '0-9')
echo "disk usage: ${USED}%"
if [ "$USED" -ge "$LIMIT" ]; then
  echo "ディスク使用率が ${LIMIT}% を超えています。12_運用・保守・障害対応手順書「障害4」を参照"
  exit 1
fi
