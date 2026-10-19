import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/server/dal";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "図鑑" };

// SC-10 キャラクター図鑑（一覧）。一覧・検索は Phase 1 で実装する。
export default function CharacterIndexPage() {
  return (
    <section className="fade-in">
      <h1 className="font-serif text-2xl">図鑑</h1>
      <Suspense fallback={<p className="mt-6 text-muted">読み込み中…</p>}>
        <CharacterSummary />
      </Suspense>
    </section>
  );
}

async function CharacterSummary() {
  const user = await getCurrentUser();
  const count = await db.character.count({ where: { userId: user.id } });

  if (count === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-border p-10 text-center">
        <p className="font-serif text-lg">最初のキャラクターを登録しましょう</p>
        <p className="mt-2 text-sm text-muted">キャラクターの登録画面は準備中です（SC-12）。</p>
      </div>
    );
  }
  return <p className="mt-6 text-muted">{count}人のキャラクターが登録されています。</p>;
}
