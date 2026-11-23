import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "ログイン" };

// SC-01 ログイン
export default function LoginPage() {
  return (
    <>
      <h1 className="font-serif text-2xl font-bold">ログイン</h1>
      <p className="mt-1 mb-6 text-xs tracking-wider text-ink-muted">No. 001 ── あなたの図鑑をひらく</p>
      {/* ログイン後の戻り先（?callbackUrl=）を読むためリクエスト時に描画する */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
