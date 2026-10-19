import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Artリーブ", template: "%s | Artリーブ" },
  description: "オリジナルキャラクターの設定とイラストをまとめる、自分だけのキャラクター図鑑",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // テーマ切替（F-12）を実装するまではダークテーマ固定
    <html lang="ja" data-theme="dark" className="h-full">
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
