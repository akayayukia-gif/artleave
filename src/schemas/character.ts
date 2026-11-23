import { z } from "zod";
import { idCsvSchema, idListSchema, optionalText, pagingSchema } from "@/schemas/common";

// キャラクターの入力検証（API設計書 4.2 C01〜C04、テーブル設計書 T04）。画面とサーバーの両方で使う。

const LONG_TEXT = 10000; // 性格・プロフィール文（text 型）の上限。極端に大きな入力を防ぐための目安

const name = z.string().trim().min(1, "名前を入力してください").max(100, "100文字以内で入力してください");

const fields = {
  name,
  nameKana: optionalText(100),
  personality: optionalText(LONG_TEXT),
  age: optionalText(50),
  species: optionalText(100),
  faction: optionalText(100),
  profile: optionalText(LONG_TEXT),
  tagIds: idListSchema(50),
  termIds: idListSchema(100),
};

/** C02 作成：名前のみ必須 */
export const characterCreateSchema = z.object({
  ...fields,
  tagIds: fields.tagIds.default([]),
  termIds: fields.termIds.default([]),
});

/** C04 更新：変更する項目だけを送る。tagIds・termIds を送った場合は紐づけをその内容で置き換える */
export const characterUpdateSchema = z
  .object({
    ...fields,
    mainIllustrationId: z.uuid("IDの形式が正しくありません").nullable(),
  })
  .partial();

/** C01 一覧・検索 */
export const characterListQuerySchema = pagingSchema.extend({
  q: z
    .string()
    .trim()
    .max(100, "100文字以内で入力してください")
    .optional()
    .transform((v) => v || undefined),
  tagIds: idCsvSchema,
  species: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
  faction: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
  sort: z
    .enum(["updatedAt", "name", "createdAt"], "updatedAt・name・createdAt のいずれかです")
    .default("updatedAt"),
});

export type CharacterCreateInput = z.infer<typeof characterCreateSchema>;
export type CharacterUpdateInput = z.infer<typeof characterUpdateSchema>;
export type CharacterListQuery = z.infer<typeof characterListQuerySchema>;
