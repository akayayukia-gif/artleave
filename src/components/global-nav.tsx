"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// グローバルナビ（画面設計書 2. 共通レイアウト）
export const NAV_ITEMS = [
  { href: "/", label: "図鑑" },
  { href: "/terms", label: "世界観" },
  { href: "/episodes", label: "エピソード" },
  { href: "/relationships", label: "相関図" },
  { href: "/tags", label: "タグ" },
  { href: "/histories", label: "履歴" },
  { href: "/settings", label: "設定" },
] as const;

export function GlobalNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="メインメニュー">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="block whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface-raised hover:text-text aria-[current=page]:bg-surface-raised aria-[current=page]:text-accent"
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
