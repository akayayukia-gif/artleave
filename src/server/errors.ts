// 業務ロジック（services）が投げるエラー。
// 画面（Server Actions）と API（Route Handlers）の両方で同じ意味に変換できるよう、HTTP には依存させない。

/** 対象が存在しない。他ユーザーのデータも「存在しない」として扱う（API設計書 2.1 認可） */
export class NotFoundError extends Error {
  constructor(message = "見つかりませんでした") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** 一意制約違反など、今の状態では実行できない（409） */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** 入力の形式は正しいが、内容がDBの状態と合わない（存在しないタグIDの指定など。400） */
export class InvalidInputError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(message);
    this.name = "InvalidInputError";
  }
}
