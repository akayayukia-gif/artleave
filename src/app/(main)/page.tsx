import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Polaroid } from "@/components/polaroid";
import { characterListQuerySchema } from "@/schemas/character";
import { getCurrentUser } from "@/server/dal";
import { db } from "@/server/db";
import { listCharacters } from "@/server/services/character-service";
import { listTags } from "@/server/services/tag-service";

export const metadata: Metadata = { title: "図鑑" };

// SC-10 キャラクター図鑑（一覧）。キャラを物干しの糸に吊るしたポラロイドとして並べる（Figma 案A／図鑑）。
// 検索条件は URL（?q=&tags=&sort=&page=）に持たせ、詳細から戻っても条件が残るようにする（テスト仕様書 04-05）。

const PER_PAGE = 48;
const ROTATIONS = [-4, 3, -2, 5, 2, -3, 4, -5];
const SORTS = [
  { value: "updatedAt", label: "更新日順" },
  { value: "name", label: "名前順" },
  { value: "createdAt", label: "登録日順" },
] as const;

type Search = { q?: string; tags: string[]; sort: string; page: number };

function href(s: Search, change: Partial<Search>) {
  const next = { ...s, page: 1, ...change };
  const p = new URLSearchParams();
  if (next.q) p.set("q", next.q);
  if (next.tags.length) p.set("tags", next.tags.join(","));
  if (next.sort !== "updatedAt") p.set("sort", next.sort);
  if (next.page > 1) p.set("page", String(next.page));
  const qs = p.toString();
  return qs ? `/?${qs}` : "/";
}

export default function CharacterIndexPage({ searchParams }: PageProps<"/">) {
  return (
    <section className="fade-in pb-20">
      <Suspense fallback={<ZukanSkeleton />}>
        <Zukan searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Zukan({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const raw = {
    q: one(sp.q),
    tagIds: one(sp.tags),
    sort: one(sp.sort),
    page: one(sp.page),
    perPage: PER_PAGE,
  };
  // URL を手で書き換えられて形が崩れていても、エラーにせず条件なしの一覧を出す
  const parsed = characterListQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : characterListQuerySchema.parse({ perPage: PER_PAGE });

  const user = await getCurrentUser();
  const [page, { items: tags }, totalAll] = await Promise.all([
    listCharacters(user.id, query),
    listTags(user.id),
    db.character.count({ where: { userId: user.id } }),
  ]);

  const s: Search = { q: query.q, tags: query.tagIds, sort: query.sort, page: query.page };
  const filtered = Boolean(s.q || s.tags.length);
  const pages = Math.max(1, Math.ceil(page.total / page.perPage));

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3 pt-10 pb-2">
        <h1 className="heading-film text-6xl sm:text-7xl">図鑑</h1>
        <p className="order-last basis-full text-sm tracking-wide text-muted sm:order-none sm:basis-0 sm:flex-1">
          {totalAll}人のキャラクター ── 糸に吊るした写真から、図鑑のページをひらく。
        </p>
        <Link
          href="/characters/new"
          className="ml-auto bg-paper px-5 py-3 text-sm font-bold tracking-widest whitespace-nowrap text-ink transition hover:-translate-y-px sm:ml-0"
        >
          ＋ 新しいキャラ
        </Link>
      </div>

      {totalAll > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4">
          <form action="/" className="flex w-full items-center border-b border-gold/50 sm:w-80">
            <label htmlFor="q" className="sr-only">
              キャラを探す
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={s.q}
              placeholder="名前・プロフィールで探す"
              className="w-full bg-transparent px-1 py-2 text-text outline-none placeholder:text-muted/70"
            />
            {s.tags.length > 0 && <input type="hidden" name="tags" value={s.tags.join(",")} />}
            {s.sort !== "updatedAt" && <input type="hidden" name="sort" value={s.sort} />}
            <button
              type="submit"
              className="shrink-0 px-2 text-sm whitespace-nowrap text-gold hover:text-text"
            >
              探す
            </button>
          </form>
          {tags.length > 0 && (
            <nav className="flex min-w-0 flex-1 flex-wrap gap-1.5" aria-label="タグで絞り込む">
              {tags.map((t) => {
                const on = s.tags.includes(t.id);
                return (
                  <Link
                    key={t.id}
                    href={href(s, { tags: on ? s.tags.filter((x) => x !== t.id) : [...s.tags, t.id] })}
                    aria-pressed={on}
                    className="border border-gold/45 px-2.5 py-0.5 text-xs whitespace-nowrap text-text transition hover:border-gold aria-pressed:border-paper aria-pressed:bg-paper aria-pressed:font-bold aria-pressed:text-ink"
                  >
                    #{t.name}
                  </Link>
                );
              })}
            </nav>
          )}
          <nav className="flex gap-3 text-xs whitespace-nowrap" aria-label="並び替え">
            {SORTS.map((o) => (
              <Link
                key={o.value}
                href={href(s, { sort: o.value })}
                aria-current={s.sort === o.value ? "true" : undefined}
                className="text-muted hover:text-text aria-[current=true]:font-bold aria-[current=true]:text-text"
              >
                {o.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {filtered && (
        <p className="pt-4 text-sm text-muted">
          {page.total}人が見つかりました。
          <Link
            href={href(s, { q: undefined, tags: [] })}
            className="ml-3 text-gold underline underline-offset-4"
          >
            条件をクリア
          </Link>
        </p>
      )}

      {totalAll === 0 ? (
        <EmptyAlbum />
      ) : page.items.length === 0 ? (
        <div className="paper-card relative mx-auto mt-16 max-w-md -rotate-1 px-8 py-7 text-center">
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-3" />
          <p className="font-serif text-lg">条件に合うキャラがいません</p>
          <p className="mt-1 text-sm text-ink-muted">検索語やタグを変えてみてください。</p>
          <Link href="/" className="mt-4 inline-block bg-ink px-5 py-2.5 text-sm font-bold text-paper">
            条件をクリア
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-14 pt-12 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-x-10">
          {page.items.map((c, i) => (
            <li key={c.id} className="hung relative">
              <Link href={`/characters/${c.id}`} className="group relative block focus-visible:outline-none">
                <span className="hung-clip" style={{ rotate: `${ROTATIONS[i % ROTATIONS.length]}deg` }} />
                <div
                  className="relative z-[1] transition duration-300 group-hover:-translate-y-1.5 group-hover:rotate-0! group-focus-visible:-translate-y-1.5 group-focus-visible:outline-2 group-focus-visible:outline-green"
                  style={{ rotate: `${ROTATIONS[i % ROTATIONS.length]}deg` }}
                >
                  <Polaroid
                    seed={c.id}
                    name={c.name}
                    imageUrl={c.thumbnailUrl}
                    caption={
                      <p className="truncate text-xs text-ink-muted">
                        {[c.species, c.faction].filter(Boolean).join("／") || "　"}
                      </p>
                    }
                  />
                </div>
              </Link>
            </li>
          ))}
          <li className="hung relative">
            <Link
              href="/characters/new"
              className="relative z-[1] grid aspect-[4/5.6] place-items-center border-[1.5px] border-dashed border-gold/60 text-center text-gold transition hover:bg-gold/10"
            >
              <span>
                ＋ 写真を吊るす
                <span className="mt-1 block text-xs text-muted">新しいキャラを追加</span>
              </span>
            </Link>
          </li>
        </ul>
      )}

      {pages > 1 && (
        <nav className="flex justify-center gap-6 pt-14 text-sm" aria-label="ページ">
          {s.page > 1 ? (
            <Link href={href(s, { page: s.page - 1 })} className="text-gold hover:text-text">
              ‹ 前のページ
            </Link>
          ) : (
            <span className="text-muted/40">‹ 前のページ</span>
          )}
          <span className="text-muted">
            {s.page} / {pages}
          </span>
          {s.page < pages ? (
            <Link href={href(s, { page: s.page + 1 })} className="text-gold hover:text-text">
              次のページ ›
            </Link>
          ) : (
            <span className="text-muted/40">次のページ ›</span>
          )}
        </nav>
      )}
    </>
  );
}

/** キャラが1人もいないとき（新しいアルバムの1ページ目） */
function EmptyAlbum() {
  return (
    <div className="mx-auto mt-14 flex max-w-xl flex-col items-center text-center">
      <div className="w-56 rotate-2 bg-paper p-3 pb-14 shadow-[0_16px_30px_rgb(0_0_0/0.5)]">
        <div className="aspect-[4/5] bg-linear-to-br from-[#3d4a44] via-[#5b6e64] to-[#8fa597]" />
        <p className="mt-3 text-left font-serif text-ink-muted">No.001 ── ？？？</p>
      </div>
      <p className="mt-8 font-serif text-xl">最初のキャラは、まだ写っていない。</p>
      <Link
        href="/characters/new"
        className="mt-5 bg-paper px-6 py-3 text-sm font-bold tracking-widest text-ink"
      >
        ＋ 最初のキャラを登録する
      </Link>
    </div>
  );
}

function ZukanSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="pt-10 pb-2">
        <h1 className="heading-film text-6xl sm:text-7xl">図鑑</h1>
      </div>
      <ul className="grid grid-cols-2 gap-x-5 gap-y-14 pt-16 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-x-10">
        {ROTATIONS.slice(0, 4).map((r) => (
          <li key={r} className="hung relative">
            <div
              className="relative z-[1] aspect-[4/5.6] animate-pulse bg-paper/20"
              style={{ rotate: `${r}deg` }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
