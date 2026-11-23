import "server-only";
import { auth } from "@/auth";
import { ApiError, toErrorResponse } from "@/server/api-response";
import { db } from "@/server/db";

// Route Handler（/api/v1/...）の共通処理：ログイン確認とエラーの変換をまとめる。
// 使い方： export const GET = apiRoute(async ({ userId, request, params }) => Response.json(...));

type Ctx<P> = { request: Request; userId: string; params: P };

/** ログイン中のユーザーIDを返す。未ログイン・削除済みユーザーは 401 */
async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new ApiError(401, "UNAUTHORIZED", "ログインしてください");
  const exists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) throw new ApiError(401, "UNAUTHORIZED", "ログインしてください");
  return userId;
}

export function apiRoute<P extends Record<string, string> = Record<string, never>>(
  handler: (ctx: Ctx<P>) => Promise<Response>,
) {
  return async (request: Request, context?: { params?: Promise<P> }): Promise<Response> => {
    try {
      const userId = await requireUserId();
      const params = ((await context?.params) ?? {}) as P;
      return await handler({ request, userId, params });
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}
