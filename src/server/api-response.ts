import { ZodError } from "zod";
import { ConflictError, InvalidInputError, NotFoundError } from "@/server/errors";

// API のレスポンス形式（API設計書 2.3・2.4）。認証に依存しない部分だけを置き、単体テストできるようにしている。

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type ErrorDetail = { field: string; message: string };

/** ルートの中から投げると、そのままのステータスとコードで返る */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(status: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
  return Response.json({ error: { code, message, ...(details?.length ? { details } : {}) } }, { status });
}

/** 例外を API のエラーレスポンスに変換する。想定外の例外は中身を外に出さず 500 にする */
export function toErrorResponse(e: unknown): Response {
  if (e instanceof ApiError) return errorResponse(e.status, e.code, e.message, e.details);
  if (e instanceof ZodError) {
    const details = e.issues.map((i) => ({ field: i.path.join(".") || "(root)", message: i.message }));
    return errorResponse(400, "VALIDATION_ERROR", "入力内容に誤りがあります", details);
  }
  if (e instanceof InvalidInputError) {
    return errorResponse(400, "VALIDATION_ERROR", "入力内容に誤りがあります", [
      { field: e.field, message: e.message },
    ]);
  }
  if (e instanceof NotFoundError) return errorResponse(404, "NOT_FOUND", e.message);
  if (e instanceof ConflictError) return errorResponse(409, "CONFLICT", e.message);
  console.error("[api] 想定外のエラー", e);
  return errorResponse(
    500,
    "INTERNAL_ERROR",
    "サーバーでエラーが発生しました。時間をおいてやり直してください",
  );
}

/** リクエスト本文を JSON として読む。壊れた JSON は 400 */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "VALIDATION_ERROR", "リクエスト本文が正しいJSONではありません");
  }
}

/** URL のクエリをオブジェクトにする（同じキーが複数あれば最後の値） */
export function queryOf(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams);
}
