"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { type FormState, signup } from "../actions";

export function SignupForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signup, {});

  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage message={state.message} />
      <Field
        label="表示名"
        name="displayName"
        autoComplete="nickname"
        required
        maxLength={50}
        defaultValue={state.values?.displayName}
        errors={state.fieldErrors?.displayName}
      />
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
        autoComplete="new-password"
        required
        hint="8文字以上で、英字と数字をそれぞれ1文字以上含めてください"
        errors={state.fieldErrors?.password}
      />
      <Field
        label="パスワード（確認）"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        required
        errors={state.fieldErrors?.passwordConfirm}
      />
      <SubmitButton pending={pending}>登録する</SubmitButton>
      <p className="text-center text-sm text-muted">
        登録済みの方は
        <Link href="/login" className="ml-1 text-accent hover:underline">
          ログイン
        </Link>
      </p>
    </form>
  );
}
