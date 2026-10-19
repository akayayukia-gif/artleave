// まだ作っていない画面に表示する仮の内容
export function ComingSoon({ title, feature, screen }: { title: string; feature: string; screen: string }) {
  return (
    <section className="fade-in">
      <h1 className="font-serif text-2xl">{title}</h1>
      <p className="mt-4 text-muted">
        この画面は準備中です（{screen}／{feature}）。
      </p>
    </section>
  );
}
