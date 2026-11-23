import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, readJson, toErrorResponse } from "@/server/api-response";
import { ConflictError, InvalidInputError, NotFoundError } from "@/server/errors";

// API設計書 2.3・2.4 のエラー形式

const body = async (r: Response) => ({ status: r.status, json: await r.json() });

describe("toErrorResponse", () => {
  it("入力検証エラーは 400 と項目ごとの details", async () => {
    const r = z.object({ name: z.string().min(1, "名前を入力してください") }).safeParse({ name: "" });
    expect(await body(toErrorResponse(r.error))).toEqual({
      status: 400,
      json: {
        error: {
          code: "VALIDATION_ERROR",
          message: "入力内容に誤りがあります",
          details: [{ field: "name", message: "名前を入力してください" }],
        },
      },
    });
  });

  it("業務エラーをそれぞれのステータスに変換する", async () => {
    expect((await body(toErrorResponse(new NotFoundError("ない")))).json.error).toEqual({
      code: "NOT_FOUND",
      message: "ない",
    });
    expect(toErrorResponse(new ConflictError("重複")).status).toBe(409);
    const invalid = await body(toErrorResponse(new InvalidInputError("tagIds", "存在しないタグ")));
    expect(invalid.status).toBe(400);
    expect(invalid.json.error.details).toEqual([{ field: "tagIds", message: "存在しないタグ" }]);
    expect(toErrorResponse(new ApiError(401, "UNAUTHORIZED", "ログインしてください")).status).toBe(401);
  });

  it("想定外のエラーは中身を出さずに 500", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const r = await body(toErrorResponse(new Error("connection string: postgres://secret")));
    expect(r.status).toBe(500);
    expect(JSON.stringify(r.json)).not.toContain("secret");
    spy.mockRestore();
  });
});

describe("readJson", () => {
  it("壊れたJSONは 400 の ApiError", async () => {
    const req = new Request("http://x/", { method: "POST", body: "{name:" });
    await expect(readJson(req)).rejects.toMatchObject({ status: 400, code: "VALIDATION_ERROR" });
  });
});
