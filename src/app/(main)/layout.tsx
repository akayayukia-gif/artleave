import Link from "next/link";
import { Suspense } from "react";
import { GlobalNav } from "@/components/global-nav";
import { UserMenu } from "@/components/user-menu";

// ログイン後の画面の共通レイアウト（画面設計書 2. 共通レイアウト）
// ヘッダー・ナビは事前に描画しておき、ログイン情報が必要な部分だけ <Suspense> で後から表示する。
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
        <Link href="/" className="font-serif text-lg tracking-widest text-accent">
          Artリーブ
        </Link>
        <Suspense fallback={<span className="h-8 w-32 animate-pulse rounded bg-surface-raised" />}>
          <UserMenu />
        </Suspense>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-border p-3 md:w-48 md:border-r md:border-b-0">
          <GlobalNav />
        </aside>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
