import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "パスワード再設定" };

// SC-03 パスワード再設定（Phase 1 で実装予定）
export default function PasswordResetPage() {
  return (
    <>
      <h1 className="mb-4 font-serif text-xl">パスワード再設定</h1>
      <p className="text-sm text-muted">この機能は準備中です。</p>
      <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">
        ログイン画面へ戻る
      </Link>
    </>
  );
}
