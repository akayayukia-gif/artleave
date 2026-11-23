import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "新規登録" };

// SC-02 新規登録
export default function SignupPage() {
  return (
    <>
      <h1 className="font-serif text-2xl font-bold">新規登録</h1>
      <p className="mt-1 mb-6 text-xs tracking-wider text-ink-muted">No. 000 ── 最初のページを用意します</p>
      <SignupForm />
    </>
  );
}
