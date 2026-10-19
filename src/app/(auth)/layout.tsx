// ログイン前の画面（SC-01〜04）共通の枠。中央にカードを1枚置く。
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--surface-raised),var(--bg)_60%)] px-4 py-12">
      <div className="fade-in w-full max-w-sm">
        <p className="mb-8 text-center font-serif text-3xl tracking-widest text-accent">Artリーブ</p>
        <div className="rounded-xl border border-border bg-surface/90 p-7 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </main>
  );
}
