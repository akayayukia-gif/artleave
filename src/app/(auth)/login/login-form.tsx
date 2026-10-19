"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { type FormState, login } from "../actions";

export function LoginForm() {
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/";
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage message={state.message} />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Field
        label="メールアドレス"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.fieldErrors?.email}
      />
      <Field
        label="パスワード"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={state.fieldErrors?.password}
      />
      <SubmitButton pending={pending}>ログイン</SubmitButton>
      <div className="flex justify-between text-sm">
        <Link href="/signup" className="text-accent hover:underline">
          新規登録
        </Link>
        <Link href="/password-reset" className="text-muted hover:text-text">
          パスワードを忘れた方
        </Link>
      </div>
    </form>
  );
}
