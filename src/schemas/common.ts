import { z } from "zod";

// 複数の機能で使う入力検証の部品（API設計書 2.1・2.2）

/** 一覧APIのページング。perPage の上限は100 */
export const pagingSchema = z.object({
  page: z.coerce.number().int("整数で指定してください").min(1, "1以上で指定してください").default(1),
  perPage: z.coerce
    .number()
    .int("整数で指定してください")
    .min(1, "1以上で指定してください")
    .max(100, "100以下で指定してください")
    .default(30),
});

export type Paging = z.infer<typeof pagingSchema>;

export type Page<T> = { items: T[]; page: number; perPage: number; total: number };

/** 任意の短い文字列。前後の空白を除き、空なら null にする */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}文字以内で入力してください`)
    .nullish()
    .transform((v) => (v ? v : null));

/** UUID の配列（重複は1つにまとめる） */
export const idListSchema = (max = 50) =>
  z
    .array(z.uuid("IDの形式が正しくありません"))
    .max(max, `${max}件以内で指定してください`)
    .transform((ids) => [...new Set(ids)]);

/** "a,b,c" 形式のクエリを UUID の配列にする */
export const idCsvSchema = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  )
  .pipe(idListSchema(20));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** URL の {id} が UUID の形か。形が違うIDは「存在しない」として扱う */
export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}
