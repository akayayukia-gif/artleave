import { z } from "zod";
import { optionalText } from "@/schemas/common";

// タグの入力検証（API設計書 4.3、テーブル設計書 T05）

const fields = {
  name: z
    .string()
    .trim()
    .transform((v) => v.replace(/^#/, "").trim()) // 先頭の「#」は付けずに保存する
    .pipe(z.string().min(1, "タグ名を入力してください").max(50, "50文字以内で入力してください")),
  category: optionalText(50),
};

export const tagCreateSchema = z.object(fields);
export const tagUpdateSchema = z.object(fields).partial();
export const tagListQuerySchema = z.object({
  category: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
});

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;
