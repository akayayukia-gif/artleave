// まだ作っていない画面に表示する仮の内容
export function ComingSoon({ title, feature, screen }: { title: string; feature: string; screen: string }) {
  return (
    <section className="fade-in py-10">
      <h1 className="heading-film text-5xl">{title}</h1>
      <div className="paper-card relative mt-10 max-w-md -rotate-1 px-7 py-6">
        <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-3" />
        <p className="font-serif">このページはまだ白紙です。</p>
        <p className="mt-1 text-sm text-ink-muted">
          準備中（{screen}／{feature}）
        </p>
      </div>
    </section>
  );
}
