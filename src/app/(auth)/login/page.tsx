import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "ログイン" };

// SC-01 ログイン
export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 font-serif text-xl">ログイン</h1>
      {/* ログイン後の戻り先（?callbackUrl=）を読むためリクエスト時に描画する */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
