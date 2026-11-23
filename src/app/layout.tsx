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
      <head>
        {/* 見出しの明朝と本文のゴシック。読み込めない環境では端末のフォントで表示する */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;600;700&display=swap"
        />
      </head>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  );
}
