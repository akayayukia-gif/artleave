# API設計書

| 項目 | 内容 |
|---|---|
| システム名 | Artリーブ |
| 文書番号 | C101-06 |
| 版 | ver1.0 |
| 関連文書 | 04_テーブル設計書、01_基本設計書 |

---

## 1. 概要

Next.jsのRoute Handlersで提供するREST APIを定義する。画面からの更新はServer Actionsも使うが、Server Actionsは本書のAPIと同じドメイン層サービスを呼ぶため、入力・出力・エラーの仕様は本書に従う。

---

## 2. 共通仕様

### 2.1 基本事項

| 項目 | 内容 |
|---|---|
| ベースURL | `https://<ドメイン>/api/v1` |
| 形式 | JSON（UTF-8）。画像アップロードのみ`multipart/form-data` |
| 認証 | Auth.jsのセッションCookie。「認証」欄が○のAPIは未ログイン時に401 |
| 認可 | 他ユーザーのデータを指定した場合は存在しないものとして404を返す |
| 日時 | ISO 8601（UTC）例：`2026-10-07T03:05:00Z` |
| ID | UUID文字列 |
| 命名 | JSONのキーはキャメルケース（例：`storyOrder`） |

### 2.2 ページング

一覧APIは`?page=1&perPage=30`（perPage上限100）を受け付け、次の形式で返す。

```json
{
  "items": [],
  "page": 1,
  "perPage": 30,
  "total": 128
}
```

### 2.3 ステータスコード

| コード | 意味 |
|---|---|
| 200 | 成功（取得・更新） |
| 201 | 作成成功 |
| 204 | 成功（削除。本文なし） |
| 400 | 入力検証エラー |
| 401 | 未ログイン |
| 404 | 対象が存在しない（他ユーザーのデータを含む） |
| 409 | 一意制約違反、子を持つ用語の削除など競合 |
| 413 | ファイルサイズ超過 |
| 415 | 対応していないファイル形式 |
| 429 | リクエスト回数制限超過（ログイン・再設定） |
| 500 | サーバー内部エラー |

### 2.4 エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      { "field": "name", "message": "100文字以内で入力してください" }
    ]
  }
}
```

| code | 対応ステータス |
|---|---|
| VALIDATION_ERROR | 400 |
| UNAUTHORIZED | 401 |
| NOT_FOUND | 404 |
| CONFLICT | 409 |
| FILE_TOO_LARGE | 413 |
| UNSUPPORTED_MEDIA_TYPE | 415 |
| RATE_LIMITED | 429 |
| INTERNAL_ERROR | 500 |

---

## 3. API一覧

| No | メソッド | パス | 概要 | 機能 | 認証 |
|---|---|---|---|---|---|
| A01 | POST | /auth/signup | 新規登録 | F-01 | |
| A02 | POST | /api/auth/callback/credentials ※ | ログイン（Auth.js標準） | F-01 | |
| A03 | POST | /api/auth/signout ※ | ログアウト（Auth.js標準） | F-01 | ○ |
| A04 | POST | /auth/password-reset/request | 再設定メール送信 | F-01 | |
| A05 | POST | /auth/password-reset/confirm | 新パスワード設定 | F-01 | |
| C01 | GET | /characters | キャラクター一覧・検索 | F-02、F-04 | ○ |
| C02 | POST | /characters | キャラクター作成 | F-02 | ○ |
| C03 | GET | /characters/{id} | キャラクター詳細 | F-02 | ○ |
| C04 | PATCH | /characters/{id} | キャラクター更新 | F-02 | ○ |
| C05 | DELETE | /characters/{id} | キャラクター削除 | F-02 | ○ |
| C06 | GET | /characters/{id}/reference | サイドバー用資料一式 | F-08 | ○ |
| T01 | GET | /tags | タグ一覧 | F-03 | ○ |
| T02 | POST | /tags | タグ作成 | F-03 | ○ |
| T03 | PATCH | /tags/{id} | タグ更新 | F-03 | ○ |
| T04 | DELETE | /tags/{id} | タグ削除 | F-03 | ○ |
| W01 | GET | /terms | 用語ツリー取得 | F-05 | ○ |
| W02 | POST | /terms | 用語作成 | F-05 | ○ |
| W03 | GET | /terms/{id} | 用語詳細 | F-05 | ○ |
| W04 | PATCH | /terms/{id} | 用語更新（親・並び順変更を含む） | F-05 | ○ |
| W05 | DELETE | /terms/{id} | 用語削除 | F-05 | ○ |
| E01 | GET | /episodes | エピソード一覧 | F-06 | ○ |
| E02 | POST | /episodes | エピソード作成 | F-06 | ○ |
| E03 | GET | /episodes/{id} | エピソード詳細 | F-06 | ○ |
| E04 | PATCH | /episodes/{id} | エピソード更新 | F-06 | ○ |
| E05 | DELETE | /episodes/{id} | エピソード削除 | F-06 | ○ |
| R01 | GET | /relationship-map | 相関図データ（ノード＋エッジ） | F-07 | ○ |
| R02 | POST | /relationships | 関係の追加 | F-07 | ○ |
| R03 | PATCH | /relationships/{id} | 関係の更新 | F-07 | ○ |
| R04 | DELETE | /relationships/{id} | 関係の削除 | F-07 | ○ |
| R05 | PUT | /relationship-map/positions | ノード位置の保存 | F-07 | ○ |
| I01 | GET | /characters/{id}/illustrations | イラスト一覧 | F-09 | ○ |
| I02 | POST | /characters/{id}/illustrations | イラストアップロード | F-09 | ○ |
| I03 | PATCH | /illustrations/{id} | ラベル・キャプション・並び順の更新 | F-09 | ○ |
| I04 | PUT | /illustrations/{id}/file | 画像の差し替え | F-09 | ○ |
| I05 | DELETE | /illustrations/{id} | イラスト削除 | F-09 | ○ |
| I06 | GET | /illustrations/{id}/file | 画像ファイル取得 | F-09 | ○ |
| P01 | GET | /characters/{id}/palette-colors | パレット取得 | F-10 | ○ |
| P02 | POST | /characters/{id}/palette-colors | 色の追加 | F-10 | ○ |
| P03 | PATCH | /palette-colors/{id} | 色の更新 | F-10 | ○ |
| P04 | DELETE | /palette-colors/{id} | 色の削除 | F-10 | ○ |
| P05 | PUT | /characters/{id}/palette-colors/order | 並び順の一括更新 | F-10 | ○ |
| M01 | GET | /poses | ポーズ一覧 | F-11 | ○ |
| M02 | GET | /characters/{id}/mannequin | マネキン取得 | F-11 | ○ |
| M03 | PUT | /characters/{id}/mannequin | マネキン作成・更新 | F-11 | ○ |
| M04 | POST | /characters/{id}/mannequin/copy | 別キャラへ複製 | F-11 | ○ |
| S01 | GET | /settings | ユーザー設定取得 | F-12 | ○ |
| S02 | PATCH | /settings | ユーザー設定更新 | F-12 | ○ |
| H01 | GET | /histories | 変更履歴一覧 | F-13 | ○ |
| H02 | GET | /histories/{id} | 履歴詳細（差分） | F-13 | ○ |
| H03 | POST | /histories/{id}/restore | この時点の内容に戻す | F-13 | ○ |
| X01 | POST | /exports | PDF／画像の書き出し | F-14 | ○ |
| O01 | GET | /public-settings | 公開設定取得（将来） | F-15 | ○ |
| O02 | PUT | /public-settings | 公開設定更新（将来） | F-15 | ○ |
| O03 | GET | /public/{slug} | 公開ページデータ（将来） | F-15 | |
| O04 | POST | /public/{slug}/unlock | 限定公開のパスワード認証（将来） | F-15 | |
| Q01 | POST | /consistency-checks | 矛盾チェック実行（ルールは即時、AIは任意で非同期）（将来） | F-16 | ○ |
| Q02 | GET | /consistency-checks/{id} | 矛盾チェック結果取得（将来） | F-16 | ○ |
| Z01 | GET | /health | 稼働確認（外部監視用） | — | |

※A02・A03はAuth.jsが提供するエンドポイントのため`/api/v1`の外にある。

---

## 4. API詳細

### 4.1 認証（F-01）

#### A01 POST /auth/signup

リクエスト
```json
{ "email": "user@example.com", "password": "********", "displayName": "あかや" }
```

| 項目 | 必須 | 検証 |
|---|---|---|
| email | ○ | メール形式、255文字以内、未登録であること（登録済みなら409） |
| password | ○ | 8〜72文字、英字と数字を各1文字以上 |
| displayName | ○ | 1〜50文字 |

レスポンス 201
```json
{ "id": "6f1c...", "email": "user@example.com", "displayName": "あかや" }
```
作成と同時に`user_settings`（theme=dark）を作成し、ログイン状態にする。

#### A04 POST /auth/password-reset/request

リクエスト：`{ "email": "user@example.com" }`
レスポンス 200：`{ "ok": true }`
- メールアドレスが未登録でも同じレスポンスを返す（登録有無を外部に知らせないため）。
- 同一メールアドレスへの送信は10分に1回まで。超えた場合も200を返し、送信しない。

#### A05 POST /auth/password-reset/confirm

リクエスト：`{ "token": "<メール内のトークン>", "password": "********" }`
レスポンス 200：`{ "ok": true }`
- トークンが無効・期限切れ・使用済みの場合は400。成功時にトークンを使用済みにする。

---

### 4.2 キャラクター（F-02、F-04、F-08）

#### C01 GET /characters

| クエリ | 説明 |
|---|---|
| q | 名前・プロフィール文の部分一致 |
| tagIds | タグIDのカンマ区切り。指定したすべてのタグを持つキャラ（AND） |
| species | 種族の完全一致 |
| faction | 所属陣営の完全一致 |
| sort | `updatedAt`（既定）／`name`／`createdAt` |
| page、perPage | ページング |

レスポンス 200
```json
{
  "items": [
    {
      "id": "c1...",
      "name": "リリア",
      "species": "エルフ",
      "faction": "白銀騎士団",
      "thumbnailUrl": "/api/v1/illustrations/i1.../file?size=thumb",
      "tags": [{ "id": "t1...", "name": "主人公" }],
      "updatedAt": "2026-10-07T03:05:00Z"
    }
  ],
  "page": 1, "perPage": 30, "total": 12
}
```

#### C02 POST /characters

リクエスト
```json
{
  "name": "リリア",
  "nameKana": "りりあ",
  "personality": "負けず嫌いだが面倒見がよい",
  "age": "17",
  "species": "エルフ",
  "faction": "白銀騎士団",
  "profile": "……",
  "tagIds": ["t1..."],
  "termIds": ["w1..."]
}
```
- `name`のみ必須。各項目の桁数はテーブル設計書T04に従う。
- 作成と同時に`change_histories`へ`action=create`を記録する。

レスポンス 201：C03と同じ形式

#### C03 GET /characters/{id}

レスポンス 200
```json
{
  "id": "c1...",
  "name": "リリア",
  "nameKana": "りりあ",
  "personality": "……",
  "age": "17",
  "species": "エルフ",
  "faction": "白銀騎士団",
  "profile": "……",
  "mainIllustrationId": "i1...",
  "tags": [{ "id": "t1...", "name": "主人公" }],
  "terms": [{ "id": "w1...", "name": "白銀騎士団" }],
  "illustrations": [
    { "id": "i1...", "kindLabel": "立ち絵", "caption": null,
      "thumbUrl": "...?size=thumb", "displayUrl": "...?size=display" }
  ],
  "paletteColors": [{ "id": "p1...", "name": "髪", "hex": "#C9D6FF", "usage": "hair" }],
  "hasMannequin": true,
  "episodeCount": 4,
  "createdAt": "...", "updatedAt": "..."
}
```

#### C04 PATCH /characters/{id}

変更する項目だけを送る。`tagIds`・`termIds`を送った場合は紐づけをその内容で置き換える。`mainIllustrationId`には自分のキャラクターのイラストのみ指定可。
変更前後の内容を`change_histories`へ`action=update`で記録する。

#### C05 DELETE /characters/{id}

レスポンス 204。イラスト・パレット・マネキン・関係・紐づけはカスケード削除される。イラストの実ファイルは削除処理の後にストレージから削除する。削除前の内容（関連データ含む）を`action=delete`で記録する。

#### C06 GET /characters/{id}/reference

サイドバー（F-08）表示用に、必要な情報だけをまとめて返す。

```json
{
  "id": "c1...",
  "name": "リリア",
  "costumes": [
    { "illustrationId": "i2...", "kindLabel": "衣装違い", "caption": "騎士団の正装",
      "displayUrl": "...?size=display" }
  ],
  "paletteColors": [{ "name": "髪", "hex": "#C9D6FF", "usage": "hair" }],
  "mannequin": { "heightCm": 158, "headRatio": 6.5, "bodyType": "slim",
                 "skinColor": "#F6DCCB", "poseCode": "standing" }
}
```
呼び出し時に`user_settings.sidebar_character_id`を更新し、次回サイドバーを開いたときに同じキャラを表示する。

---

### 4.3 タグ（F-03）

| API | リクエスト | 補足 |
|---|---|---|
| T01 GET /tags | `?category=` | 各タグの使用キャラ数（`characterCount`）を含めて返す |
| T02 POST /tags | `{ "name": "主人公", "category": "役割" }` | 同名タグがあれば409 |
| T03 PATCH /tags/{id} | `{ "name": "…", "category": "…" }` | 同名タグがあれば409 |
| T04 DELETE /tags/{id} | — | 204。キャラクターからの紐づけも解除される |

---

### 4.4 世界観・用語集（F-05）

#### W01 GET /terms

ツリー構造で返す。
```json
{
  "items": [
    { "id": "w1...", "name": "アルディア王国", "sortOrder": 0, "children": [
      { "id": "w2...", "name": "王都セレス", "sortOrder": 0, "children": [] }
    ]}
  ]
}
```

#### W02 POST /terms ／ W04 PATCH /terms/{id}

```json
{ "name": "王都セレス", "description": "……", "parentId": "w1...", "sortOrder": 0, "characterIds": ["c1..."] }
```
- `parentId`に自分自身や自分の子孫を指定した場合は400（循環防止）。

#### W03 GET /terms/{id}

用語の内容に加え、`parent`（パンくず表示用の祖先一覧）、`children`、`characters`（関連キャラ）、`episodes`（関連エピソード）を返す。

#### W05 DELETE /terms/{id}

子用語がある場合は409（`message`：「下の階層に用語があるため削除できません」）。

---

### 4.5 エピソード（F-06）

#### E01 GET /episodes

| クエリ | 説明 |
|---|---|
| characterId | このキャラが関わるエピソードのみ |
| termId | この用語が関わるエピソードのみ |
| order | `story`（作中時系列順、既定）／`created`（作成順） |

#### E02 POST /episodes ／ E04 PATCH /episodes/{id}

```json
{
  "title": "騎士団入団試験",
  "body": "……",
  "storyTimeLabel": "王国暦312年 春",
  "storyOrder": 312010,
  "characterIds": ["c1...", "c2..."],
  "termIds": ["w3..."]
}
```

---

### 4.6 相関図（F-07）

#### R01 GET /relationship-map

| クエリ | 説明 |
|---|---|
| characterIds | 表示するキャラを限定（省略時は全キャラ） |
| tagId | このタグのキャラだけを表示 |

```json
{
  "nodes": [
    { "id": "c1...", "name": "リリア", "thumbnailUrl": "...", "position": { "x": 120, "y": 80 } },
    { "id": "c2...", "name": "ガイ", "thumbnailUrl": "...", "position": null }
  ],
  "edges": [
    { "id": "r1...", "from": "c1...", "to": "c2...", "relationType": "rival",
      "label": "ライバル", "isBidirectional": true }
  ]
}
```
`position`がnullのノードは画面側で自動レイアウトする。

#### R02 POST /relationships

```json
{ "fromCharacterId": "c1...", "toCharacterId": "c2...", "relationType": "rival",
  "label": "ライバル", "isBidirectional": true, "note": "" }
```
起点と終点が同じなら400、同じ組み合わせ・同じラベルの関係があれば409。

#### R05 PUT /relationship-map/positions

```json
{ "positions": [ { "characterId": "c1...", "x": 120, "y": 80 } ] }
```
ドラッグ終了時にまとめて保存する（変更履歴には記録しない）。

---

### 4.7 イラスト（F-09）

#### I02 POST /characters/{id}/illustrations

`multipart/form-data`

| 項目 | 必須 | 説明 |
|---|---|---|
| file | ○ | PNG／JPEG／WebP、20MBまで。複数送信可（最大10枚） |
| kindLabel | ○ | 例：立ち絵／表情差分／衣装違い |
| caption | | 200文字以内 |

処理：形式判定 → 原本保存 → 表示用（長辺1600px）とサムネイル（長辺400px）をWebPで生成 → DB登録。キャラにメインイラストがなければ最初の1枚を自動で設定する。

レスポンス 201：作成したイラストの配列

#### I04 PUT /illustrations/{id}/file

差し替える画像を`file`として送る。3種類のファイルを作り直し、古いファイルは削除する。

#### I06 GET /illustrations/{id}/file

| クエリ | 説明 |
|---|---|
| size | `thumb`／`display`（既定）／`original` |

画像バイナリを返す。`Cache-Control: private, max-age=86400`。ログインユーザー本人のイラストのみ取得可（将来の公開モードでは公開中のものも可）。

---

### 4.8 カラーパレット（F-10）

| API | リクエスト例 | 補足 |
|---|---|---|
| P02 POST | `{ "name": "瞳", "hex": "#4A7BD0", "usage": "eye" }` | hexは`#RRGGBB`形式 |
| P03 PATCH | `{ "hex": "#3F6FC4" }` | |
| P05 PUT order | `{ "ids": ["p3...", "p1...", "p2..."] }` | 配列の順で`sort_order`を振り直す |

---

### 4.9 マネキン（F-11）

#### M03 PUT /characters/{id}/mannequin

```json
{ "heightCm": 158, "headRatio": 6.5, "bodyType": "slim", "skinColor": "#F6DCCB", "poseId": "ps1..." }
```

| 項目 | 検証 |
|---|---|
| heightCm | 30〜300の整数 |
| headRatio | 2.0〜10.0、小数第1位まで |
| bodyType | slim／standard／muscular／plump |
| skinColor | `#RRGGBB` |
| poseId | ポーズマスタに存在すること |

存在しなければ作成、あれば更新する。レスポンス 200（`svg`にプレビュー用のシルエットSVGを含める）。

#### M04 POST /characters/{id}/mannequin/copy

`{ "targetCharacterId": "c2..." }` 複製先に既にマネキンがある場合は上書きする（上書き前の内容は履歴に残る）。

---

### 4.10 設定（F-12）

S02 PATCH /settings：`{ "theme": "light" }` 値は dark／light（将来追加分も同じ項目で扱う）。

将来（F-16）は`{ "aiCheckEnabled": true }`も受け付ける。trueにした時点の日時を`ai_check_consented_at`に記録し、falseにしたら以後は外部に送らない。

---

### 4.11 変更履歴（F-13）

#### H01 GET /histories

| クエリ | 説明 |
|---|---|
| targetType、targetId | 特定のデータの履歴だけを表示 |
| page、perPage | ページング |

```json
{
  "items": [
    { "id": "h1...", "targetType": "character", "targetId": "c1...", "targetLabel": "リリア",
      "action": "update", "changedFields": ["personality", "age"], "changedAt": "..." }
  ],
  "page": 1, "perPage": 30, "total": 54
}
```

#### H02 GET /histories/{id}

```json
{
  "id": "h1...",
  "targetType": "character",
  "targetLabel": "リリア",
  "action": "update",
  "changedAt": "...",
  "diff": [
    { "field": "age", "label": "年齢", "before": "16", "after": "17" },
    { "field": "personality", "label": "性格",
      "before": "負けず嫌い", "after": "負けず嫌いだが面倒見がよい",
      "segments": [
        { "type": "equal", "text": "負けず嫌い" },
        { "type": "added", "text": "だが面倒見がよい" }
      ] }
  ]
}
```
長文の項目は`segments`で文字単位の差分を返し、画面でハイライト表示する。

#### H03 POST /histories/{id}/restore

指定した履歴の「変更前」の状態に戻す（削除の履歴なら削除前の状態で再作成する）。復元自体も`action=restore`として新しい履歴に記録する。
- 復元先のキャラクターが既に削除されている等、関連データが欠けている場合は409を返す。

---

### 4.12 書き出し（F-14）

#### X01 POST /exports

```json
{ "characterIds": ["c1...", "c2..."], "format": "pdf", "include": ["profile", "illustrations", "palette", "mannequin"] }
```

| 項目 | 説明 |
|---|---|
| format | `pdf`（全員を1ファイルにまとめる）／`png`（1キャラ1枚、複数ならZIP） |
| include | 書き出す項目。省略時は全項目 |

レスポンス 200：ファイル本体（`Content-Disposition: attachment`）。1回の上限は20キャラ。

---

### 4.13 公開共有（F-15、将来）

| API | 内容 |
|---|---|
| O02 PUT /public-settings | `{ "slug": "my-world", "visibility": "limited", "password": "****" }`。slugが他ユーザーと重複すれば409 |
| O03 GET /public/{slug} | private→404、limited→未認証なら401、public→公開用データを返す（編集用の情報は含めない） |
| O04 POST /public/{slug}/unlock | `{ "password": "****" }` 正しければ閲覧用Cookieを発行。5回失敗で15分ロック |

### 4.14 矛盾検知（F-16、将来）

チェックは2段階で行う。ルールチェック（自作）はその場で終わるため即座に結果を返し、AIチェック（Gemini API）は利用者が設定でオンにしている場合のみ、後から非同期で実行する。

#### Q01 POST /consistency-checks

リクエスト：`{ "targetType": "character", "targetId": "c1..." }`（targetTypeは character／term／episode）

レスポンス
- AIチェックがオフ：201。ルールチェックの結果を含め、`status: "completed"`で返す
- AIチェックがオン：202。ルールチェックの結果を含め、`status: "pending"`で返す。AIの結果はQ02で取得する

```json
{
  "id": "q1...",
  "status": "pending",
  "useAi": true,
  "findings": [
    {
      "source": "rule",
      "ruleId": "R-02",
      "severity": "warning",
      "message": "プロフィールでは「青い瞳」ですが、カラーパレットの瞳の色（#C03A3A）は赤系です",
      "target": { "type": "character", "id": "c1...", "field": "profile" },
      "evidence": { "type": "palette_color", "id": "p2...", "label": "瞳" }
    }
  ]
}
```

| 制限 | 内容 |
|---|---|
| 同時実行 | 同じ対象のAIチェックが`pending`／`running`の間は、新しく依頼しても既存のIDを返す |
| AIチェックの回数 | 1ユーザーあたり1分に1回・1日50回まで（Gemini無料枠の回数制限に余裕を持たせるため）。超えた場合はルールチェックのみ実行し、`aiError`に理由を入れる |

#### Q02 GET /consistency-checks/{id}

`status`（pending／running／completed／partial）と`findings`を返す。AIの指摘は`source: "ai"`で、`ruleId`の代わりに根拠となった既存設定の引用（`quote`）を持つ。`partial`のときは`aiError`（例：「AIチェックの回数制限に達しました。時間をおいて再実行してください」）を返す。

#### AIチェックで外部に送る内容

| 送る | 送らない |
|---|---|
| 対象と、関連するキャラ・用語・エピソードの名前と文章、カラーパレットの用途と色、マネキンの数値 | 画像、メールアドレス・表示名などのアカウント情報、ほかの利用者のデータ |

Gemini APIの無料枠では送った内容がGoogleのサービス改善に使われるため、設定画面（SC-80）でこの点を説明し、同意した利用者のみAIチェックをオンにできる（S02で`aiCheckEnabled: true`を送るとき、同意日時を記録する）。

---

### 4.15 稼働確認

Z01 GET /health：DB接続を確認し、正常なら200 `{ "status": "ok" }`、異常なら503。外部監視サービス（UptimeRobot）から5分ごとに呼ばれる。
