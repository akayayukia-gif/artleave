"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// グローバルナビ（画面設計書 2. 共通レイアウト）。ヘッダーの中に横並びで置き、選んでいる項目に緑の下線を引く。
export const NAV_ITEMS = [
  { href: "/", label: "図鑑" },
  { href: "/terms", label: "世界観" },
  { href: "/episodes", label: "エピソード" },
  { href: "/relationships", label: "相関図" },
  { href: "/tags", label: "タグ" },
  { href: "/histories", label: "履歴" },
  { href: "/settings", label: "設定" },
] as const;

/** static は事前描画用（どの項目も選択していない状態で表示する） */
export function GlobalNav({ static: isStatic = false }: { static?: boolean }) {
  return isStatic ? <NavList pathname={null} /> : <CurrentNav />;
}

function CurrentNav() {
  return <NavList pathname={usePathname()} />;
}

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav aria-label="メインメニュー" className="min-w-0 flex-1">
      <ul className="flex gap-6 overflow-x-auto [scrollbar-width:none]">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname !== null &&
            (item.href === "/"
              ? pathname === "/" || pathname.startsWith("/characters")
              : pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="block border-b-2 border-transparent py-1 text-sm whitespace-nowrap text-muted transition hover:text-text aria-[current=page]:border-green aria-[current=page]:font-bold aria-[current=page]:text-text"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
