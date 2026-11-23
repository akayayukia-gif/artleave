import Link from "next/link";
import { Suspense } from "react";
import { GlobalNav } from "@/components/global-nav";
import { UserMenu } from "@/components/user-menu";

// ログイン後の画面の共通レイアウト（画面設計書 2. 共通レイアウト、Figma 案A）
// ヘッダー・ナビは事前に描画しておき、ログイン情報が必要な部分だけ <Suspense> で後から表示する。
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-gold/20 bg-[rgb(21_36_31/0.75)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-8">
          <Link href="/" className="font-serif text-2xl font-bold tracking-wider whitespace-nowrap text-text">
            Artリーブ
          </Link>
          {/* 現在のURLを読むので、URLが決まらない画面（/characters/[id] など）でも事前描画できるよう囲む */}
          <Suspense fallback={<GlobalNav static />}>
            <GlobalNav />
          </Suspense>
          <Suspense fallback={<span className="h-5 w-24 animate-pulse bg-white/10" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-8">{children}</main>
    </div>
  );
}
