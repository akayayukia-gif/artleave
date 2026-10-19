#!/usr/bin/env bash
# バッチ共通の入口（10_バッチ処理設計書 1章）
# 使い方: run-job.sh <ジョブID> <スクリプト>
#  ・同じジョブの二重起動を防ぐ（flock）
#  ・ログを /srv/artleave/logs/batch/<ジョブID>_<日付>.log に残す
#  ・Healthchecks.io に開始・成功・失敗を知らせる（.env.batch に HC_URL_B01 などを書く）
set -euo pipefail
JOB_ID="$1"; SCRIPT="$2"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR=/srv/artleave/logs/batch
LOG="$LOG_DIR/${JOB_ID}_$(date +%Y%m%d).log"

[ -f "$APP_DIR/.env.batch" ] && source "$APP_DIR/.env.batch"
HC_VAR="HC_URL_${JOB_ID//-/}"
HC_URL="${!HC_VAR:-}"
ping_hc() { [ -n "$HC_URL" ] && curl -fsS -m 10 "$HC_URL$1" > /dev/null || true; }

mkdir -p "$LOG_DIR"
exec 9>"/tmp/artleave_${JOB_ID}.lock"
if ! flock -n 9; then
  echo "$(date -Is) skip: already running" >> "$LOG"
  exit 0
fi

ping_hc /start
echo "$(date -Is) start $JOB_ID" >> "$LOG"
if "$SCRIPT" >> "$LOG" 2>&1; then
  echo "$(date -Is) success $JOB_ID" >> "$LOG"
  ping_hc ""
else
  code=$?
  echo "$(date -Is) failed $JOB_ID (exit $code)" >> "$LOG"
  ping_hc /fail
  exit $code
fi
