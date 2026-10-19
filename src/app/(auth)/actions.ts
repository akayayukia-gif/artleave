"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema, signupSchema } from "@/schemas/auth";
import { EmailAlreadyRegisteredError, registerUser } from "@/server/services/auth-service";

export type FormState = {
  /** フォーム全体のエラー（画面上部に表示） */
  message?: string;
  /** 項目ごとのエラー（入力欄の下に表示） */
  fieldErrors?: Record<string, string[] | undefined>;
  /** エラー時に入力内容を残すための値（パスワードは返さない） */
  values?: Record<string, string>;
};

function text(formData: FormData, name: string) {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

// ログイン後に戻る先。外部サイトへ飛ばされないよう、同じサイト内のパスだけを許可する
function safeCallback(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const parsed = loginSchema.safeParse({ email: values.email, password: text(formData, "password") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallback(text(formData, "callbackUrl")),
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      const locked = "code" in e && e.code === "locked";
      return {
        message: locked
          ? "ログインに続けて失敗したため、15分ほどログインできません。時間をおいてお試しください。"
          : "メールアドレスまたはパスワードが違います",
        values,
      };
    }
    // ログイン成功時のページ移動（redirect）は例外として届くので、そのまま投げ直す
    throw e;
  }
}

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { displayName: text(formData, "displayName"), email: text(formData, "email") };
  const parsed = signupSchema.safeParse({
    ...values,
    password: text(formData, "password"),
    passwordConfirm: text(formData, "passwordConfirm"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  try {
    await registerUser(parsed.data);
  } catch (e) {
    if (e instanceof EmailAlreadyRegisteredError) {
      return { fieldErrors: { email: [e.message] }, values };
    }
    throw e;
  }

  // 登録できたらそのままログインして図鑑へ
  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/",
  });
  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
