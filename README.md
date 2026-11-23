# Artリーブ

オリジナルキャラクター（オリキャラ）の設定とイラストを一か所にまとめ、自分だけの「公式キャラクター図鑑」のように眺めて楽しめる、個人クリエイター向けの創作支援Webアプリです。

設定やイラストが紙のノート・スマホのメモ・複数のアプリに散らばり、「あのキャラの設定はどうだったか」と迷ったり、過去の設定と食い違う「設定崩壊」が起きたりする問題を解決します。

> 開発中です。現在はプロジェクトの土台（ログイン・DB・デプロイの仕組み）までできています。

## 主な機能（予定）

| 機能 | 状態 |
|---|---|
| ユーザー登録・ログイン（F-01） | ✅ 実装済み（パスワード再設定は未実装） |
| キャラクター図鑑・タグ・検索（F-02〜F-04） | 🔧 API実装済み（画面は未実装） |
| 世界観・用語集（F-05） | Phase 1 |
| 画像管理（F-09） | Phase 1 |
| 変更履歴・バージョン管理（F-13） | Phase 1 |
| エピソード年表・相関図・リファレンスサイドバー・カラーパレット・マネキン（F-06〜F-11） | Phase 2 |
| テーマ切替・書き出し（F-12、F-14） | Phase 3 |
| 公開共有・矛盾チェック（F-15、F-16） | 将来 |

詳しくは [機能定義書](docs/機能定義書.md) を参照してください。

## 使用技術

| 分類 | 技術 |
|---|---|
| フロントエンド・バックエンド | Next.js 16（App Router、Server Actions、Cache Components）、React 19、TypeScript |
| スタイル | Tailwind CSS 4 |
| DB | PostgreSQL 16、Prisma 7（ORM） |
| 認証 | Auth.js（Credentials、JWTセッション）、argon2id |
| 入力検証 | Zod 4（画面とサーバーで同じスキーマを使用） |
| テスト・品質 | Vitest、Biome、GitHub Actions |
| 本番環境 | Raspberry Pi 5（自宅サーバー）、Docker Compose、Caddy（HTTPS）、Cloudflare DDNS、Tailscale |

## 開発環境の準備

必要なもの：Git、Docker Desktop、[Volta](https://volta.sh/)（Node.js と pnpm のバージョンを自動でそろえる）

```bash
# 1. Node.js と pnpm を入れる（package.json の volta 設定と同じバージョンになる）
volta install node@22 pnpm

# 2. リポジトリを取得
git clone https://github.com/akayayukia-gif/artleave.git
cd artleave

# 3. 環境変数ファイルを作る（開発用はそのままでよい）
cp .env.example .env

# 4. 依存パッケージを入れる（Prisma のクライアントも自動で生成される）
pnpm install

# 5. 開発用DBを起動し、テーブルとサンプルデータを作る
docker compose -f docker-compose.dev.yml up -d
pnpm db:deploy
pnpm db:seed

# 6. 開発サーバーを起動 → http://localhost:3000
pnpm dev
```

サンプルデータのログイン：`demo@example.com` / `artleave123`

## よく使うコマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー |
| `pnpm check` | Biome で静的解析と整形チェック（`pnpm check:fix` で自動修正） |
| `pnpm typecheck` | 型チェック |
| `pnpm test` | テスト（DBを使う結合テストは `.env` の `DATABASE_URL` のDBで実行） |
| `pnpm db:migrate --name <名前>` | `schema.prisma` を変えたときにマイグレーションを作る |
| `pnpm db:studio` | DBの中身をブラウザで確認 |
| `pnpm build` | 本番用ビルド |

## フォルダ構成

```
artleave/
├─ prisma/
│   ├─ schema.prisma        # テーブル定義（20テーブル）
│   ├─ migrations/          # マイグレーションSQL（CHECK制約・初期データを含む）
│   └─ seed.ts              # 開発用のサンプルデータ
├─ src/
│   ├─ app/
│   │   ├─ (auth)/          # ログイン・新規登録など、ログイン前の画面
│   │   ├─ (main)/          # ログイン後の画面
│   │   └─ api/             # API（Auth.js、/api/v1/health）
│   ├─ components/          # 共通のUI部品
│   ├─ schemas/             # 入力検証（Zod）
│   ├─ server/
│   │   ├─ services/        # 業務ロジック
│   │   ├─ dal.ts           # ログイン中のユーザーを取り出す入口
│   │   └─ db.ts            # DB接続
│   ├─ auth.ts              # 認証の設定
│   └─ proxy.ts             # 未ログインの人をログイン画面へ送る
├─ tests/integration/       # DBを使う結合テスト
├─ scripts/                 # バックアップ・デプロイなどのバッチ
├─ docs/                    # 企画書・機能定義書・設計書
├─ Dockerfile
├─ docker-compose.yml       # 本番（Raspberry Pi）
├─ docker-compose.dev.yml   # 開発用DB
└─ Caddyfile
```

## 設計書

| 文書 | 内容 |
|---|---|
| [企画書](docs/企画書.md)・[1シート企画書](docs/1シート企画書.xlsx) | サービスの概要・課題・解決案 |
| [機能定義書](docs/機能定義書.md) | 機能一覧（F-01〜F-16）、使用技術、本番環境 |
| [基本設計書](docs/設計書/01_基本設計書.md) | 全体構成・共通方針 |
| [画面設計書](docs/設計書/02_画面設計書.md) | 画面一覧・遷移・レイアウト |
| [テーブル設計書](docs/設計書/04_テーブル設計書.md)・[ER図](docs/設計書/05_ER図.md) | データベース |
| [API設計書](docs/設計書/06_API設計書.md) | API仕様 |
| [その他の設計書](docs/関連設計書一覧.md) | 非機能要件、インフラ、テスト、運用手順など |

## 本番環境へのデプロイ

Raspberry Pi の準備は [環境構築・デプロイ手順書](docs/設計書/13_環境構築・デプロイ手順書.md) を参照してください。準備ができたら、GitHub リポジトリの Settings → Secrets and variables → Actions で Secrets を登録し、Variables に `DEPLOY_ENABLED=true` を追加すると、`main` に入った変更が自動でデプロイされます。
