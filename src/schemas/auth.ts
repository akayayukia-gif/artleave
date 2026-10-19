import { z } from "zod";

// 入力検証のルール（API設計書 4.1 A01）。画面とサーバーの両方でこのスキーマを使う。

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "メールアドレスを入力してください")
  .max(255, "255文字以内で入力してください")
  .pipe(z.email("メールアドレスの形式が正しくありません"));

export const passwordSchema = z
  .string()
  .min(8, "8文字以上で入力してください")
  .max(72, "72文字以内で入力してください")
  .regex(/[A-Za-z]/, "英字を1文字以上含めてください")
  .regex(/[0-9]/, "数字を1文字以上含めてください");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "表示名を入力してください")
  .max(50, "50文字以内で入力してください");

export const signupSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "パスワードが一致しません",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください").max(72),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
