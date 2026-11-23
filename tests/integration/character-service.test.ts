import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { characterListQuerySchema } from "@/schemas/character";

// 結合テスト：キャラクター・タグ・検索（実際の PostgreSQL を使う）
// テスト仕様書 02-04, 02-06, 03-02, 03-03, 03-04, 04-01, 04-02, 04-03

const hasDb = Boolean(process.env.DATABASE_URL);
const prefix = `itest-chr-${Date.now()}`;

describe.skipIf(!hasDb)("character-service・tag-service（DB使用）", async () => {
  const { db } = await import("@/server/db");
  const chars = await import("@/server/services/character-service");
  const tags = await import("@/server/services/tag-service");
  const { NotFoundError, ConflictError, InvalidInputError } = await import("@/server/errors");

  let userA = "";
  let userB = "";
  const list = (userId: string, query: Record<string, string> = {}) =>
    chars.listCharacters(userId, characterListQuerySchema.parse(query));
  const names = (page: { items: { name: string }[] }) => page.items.map((c) => c.name).sort();
  const blank = { nameKana: null, personality: null, age: null, species: null, faction: null, profile: null };

  beforeAll(async () => {
    const mk = (n: string) =>
      db.user.create({
        data: { email: `${prefix}-${n}@example.com`, passwordHash: "x", displayName: n },
        select: { id: true },
      });
    userA = (await mk("a")).id;
    userB = (await mk("b")).id;
  });
  afterAll(async () => {
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
  });

  describe("タグ", () => {
    it("同じユーザーで同じ名前のタグは作れない（03-02）", async () => {
      await tags.createTag(userA, { name: "主人公", category: "役割" });
      await expect(tags.createTag(userA, { name: "主人公", category: null })).rejects.toBeInstanceOf(
        ConflictError,
      );
    });

    it("別のユーザーなら同じ名前のタグを作れる（03-04）", async () => {
      await expect(tags.createTag(userB, { name: "主人公", category: null })).resolves.toMatchObject({
        name: "主人公",
      });
    });

    it("名前を変えると、キャラ側の表示も新しい名前になる", async () => {
      const t = await tags.createTag(userA, { name: "旧名", category: null });
      const c = await chars.createCharacter(userA, {
        name: "改名テスト",
        ...blank,
        tagIds: [t.id],
        termIds: [],
      });
      await tags.updateTag(userA, t.id, { name: "新名" });
      expect((await chars.getCharacter(userA, c.id)).tags.map((x) => x.name)).toEqual(["新名"]);
      await chars.deleteCharacter(userA, c.id);
    });

    it("使っているキャラの数を返し、削除するとキャラから外れる（03-03）", async () => {
      const t = await tags.createTag(userA, { name: "消すタグ", category: null });
      const ids: string[] = [];
      for (const n of ["x1", "x2", "x3"]) {
        ids.push((await chars.createCharacter(userA, { name: n, ...blank, tagIds: [t.id], termIds: [] })).id);
      }
      const listed = (await tags.listTags(userA)).items.find((x) => x.id === t.id);
      expect(listed?.characterCount).toBe(3);

      await tags.deleteTag(userA, t.id);
      for (const id of ids) {
        expect((await chars.getCharacter(userA, id)).tags).toEqual([]);
        await chars.deleteCharacter(userA, id);
      }
    });

    it("他のユーザーのタグは更新・削除できない（404）", async () => {
      const t = await tags.createTag(userA, { name: "Aのタグ", category: null });
      await expect(tags.updateTag(userB, t.id, { name: "乗っ取り" })).rejects.toBeInstanceOf(NotFoundError);
      await expect(tags.deleteTag(userB, t.id)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("キャラクター", () => {
    it("作成すると詳細が返り、履歴に create が1件残る", async () => {
      const c = await chars.createCharacter(userA, {
        name: "リリア",
        ...blank,
        age: "17",
        tagIds: [],
        termIds: [],
      });
      expect(c).toMatchObject({ name: "リリア", age: "17", tags: [], hasMannequin: false, episodeCount: 0 });
      const h = await db.changeHistory.findMany({ where: { targetId: c.id } });
      expect(h).toHaveLength(1);
      expect(h[0]).toMatchObject({ action: "create", targetType: "character", targetLabel: "リリア" });
    });

    it("編集すると反映され、変更前後が履歴に1件残る（02-04）", async () => {
      const c = await chars.createCharacter(userA, {
        name: "編集",
        ...blank,
        age: "17",
        tagIds: [],
        termIds: [],
      });
      const u = await chars.updateCharacter(userA, c.id, { personality: "負けず嫌い", age: "18" });
      expect(u).toMatchObject({ personality: "負けず嫌い", age: "18", name: "編集" });

      const h = await db.changeHistory.findMany({ where: { targetId: c.id, action: "update" } });
      expect(h).toHaveLength(1);
      expect(h[0].beforeJson).toMatchObject({ age: "17", personality: null });
      expect(h[0].afterJson).toMatchObject({ age: "18", personality: "負けず嫌い" });
    });

    it("何も変わらない更新では、書き込まず履歴も増えない", async () => {
      const c = await chars.createCharacter(userA, { name: "同じ", ...blank, tagIds: [], termIds: [] });
      await chars.updateCharacter(userA, c.id, { name: "同じ" });
      expect(await db.changeHistory.count({ where: { targetId: c.id, action: "update" } })).toBe(0);
    });

    it("タグは送った内容で置き換わり、タグだけの変更でも更新日時が進む", async () => {
      const t1 = await tags.createTag(userA, { name: "置換1", category: null });
      const t2 = await tags.createTag(userA, { name: "置換2", category: null });
      const c = await chars.createCharacter(userA, { name: "置換", ...blank, tagIds: [t1.id], termIds: [] });
      const u = await chars.updateCharacter(userA, c.id, { tagIds: [t2.id] });
      expect(u.tags.map((t) => t.name)).toEqual(["置換2"]);
      expect(u.updatedAt.getTime()).toBeGreaterThanOrEqual(c.updatedAt.getTime());
    });

    it("他のユーザーのタグや存在しないメインイラストは指定できない（400）", async () => {
      const bTag = await tags.createTag(userB, { name: "Bだけのタグ", category: null });
      await expect(
        chars.createCharacter(userA, { name: "x", ...blank, tagIds: [bTag.id], termIds: [] }),
      ).rejects.toBeInstanceOf(InvalidInputError);
      const c = await chars.createCharacter(userA, {
        name: "イラストなし",
        ...blank,
        tagIds: [],
        termIds: [],
      });
      await expect(
        chars.updateCharacter(userA, c.id, { mainIllustrationId: "33333333-3333-4333-8333-333333333333" }),
      ).rejects.toBeInstanceOf(InvalidInputError);
    });

    it("他のユーザーのキャラは、取得・更新・削除・一覧のどれでも見えない（02-06）", async () => {
      const c = await chars.createCharacter(userA, { name: "Aの秘密", ...blank, tagIds: [], termIds: [] });
      await expect(chars.getCharacter(userB, c.id)).rejects.toBeInstanceOf(NotFoundError);
      await expect(chars.updateCharacter(userB, c.id, { name: "x" })).rejects.toBeInstanceOf(NotFoundError);
      await expect(chars.deleteCharacter(userB, c.id)).rejects.toBeInstanceOf(NotFoundError);
      expect(names(await list(userB, { q: "Aの秘密" }))).toEqual([]);
      await expect(chars.getCharacter(userA, c.id)).resolves.toMatchObject({ name: "Aの秘密" });
    });

    it("IDの形が違っても500にならず「見つからない」", async () => {
      await expect(chars.getCharacter(userA, "not-a-uuid")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("削除すると一覧から消え、削除前の内容が履歴に残る", async () => {
      const c = await chars.createCharacter(userA, {
        name: "消える",
        ...blank,
        profile: "最後の記録",
        tagIds: [],
        termIds: [],
      });
      await db.paletteColor.create({
        data: { characterId: c.id, name: "髪", hex: "#C9D6FF", usage: "hair" },
      });
      expect(await chars.deleteCharacter(userA, c.id)).toEqual({ filePaths: [] });
      await expect(chars.getCharacter(userA, c.id)).rejects.toBeInstanceOf(NotFoundError);
      const h = await db.changeHistory.findFirstOrThrow({ where: { targetId: c.id, action: "delete" } });
      expect(h.beforeJson).toMatchObject({
        profile: "最後の記録",
        paletteColors: [{ name: "髪", hex: "#C9D6FF" }],
      });
    });
  });

  describe("検索（F-04）", () => {
    let tHero = "";
    let tKnight = "";
    beforeAll(async () => {
      const u = userB;
      tHero = (await tags.createTag(u, { name: "検索-主人公", category: null })).id;
      tKnight = (await tags.createTag(u, { name: "検索-騎士団", category: null })).id;
      const mk = (name: string, extra: object, tagIds: string[]) =>
        chars.createCharacter(u, { name, ...blank, ...extra, tagIds, termIds: [] });
      await mk("リリア", { species: "エルフ", faction: "白銀騎士団", profile: "青い瞳の見習い騎士" }, [
        tHero,
        tKnight,
      ]);
      await mk("ガイ", { species: "人間", faction: "白銀騎士団", profile: "副団長。勝率は50%ほど" }, [
        tKnight,
      ]);
      await mk("ミナ", { species: "エルフ", faction: "王都" }, [tHero]);
      await mk("リリィ", { species: "エルフ", faction: "白銀騎士団" }, []);
    });

    it("名前の一部（2文字）で見つかる（04-01）", async () => {
      expect(names(await list(userB, { q: "リリ" }))).toEqual(["リリア", "リリィ"]);
    });

    it("プロフィール文の一部でも見つかり、% は文字として扱う", async () => {
      expect(names(await list(userB, { q: "見習い" }))).toEqual(["リリア"]);
      expect(names(await list(userB, { q: "50%" }))).toEqual(["ガイ"]);
      expect(names(await list(userB, { q: "%" }))).toEqual(["ガイ"]);
    });

    it("タグを2つ指定すると、両方を持つキャラだけ（04-02）", async () => {
      expect(names(await list(userB, { tagIds: `${tHero},${tKnight}` }))).toEqual(["リリア"]);
      expect(names(await list(userB, { tagIds: tKnight }))).toEqual(["ガイ", "リリア"]);
    });

    it("種族＋陣営＋タグをすべて満たすキャラだけ（04-03）", async () => {
      expect(names(await list(userB, { species: "エルフ", faction: "白銀騎士団", tagIds: tKnight }))).toEqual(
        ["リリア"],
      );
      expect(names(await list(userB, { species: "エルフ", faction: "白銀騎士団" }))).toEqual([
        "リリア",
        "リリィ",
      ]);
    });

    it("ページングと合計件数", async () => {
      const p1 = await list(userB, { perPage: "2", page: "1", sort: "name" });
      const p2 = await list(userB, { perPage: "2", page: "2", sort: "name" });
      expect(p1.total).toBe(4);
      expect(p1.items).toHaveLength(2);
      expect(new Set([...p1.items, ...p2.items].map((c) => c.id)).size).toBe(4);
    });

    it("一覧にはタグの名前とサムネイルのURL（未設定なら null）が入る", async () => {
      const [lilia] = (await list(userB, { q: "リリア" })).items;
      expect(lilia.tags.map((t) => t.name).sort()).toEqual(["検索-主人公", "検索-騎士団"].sort());
      expect(lilia.thumbnailUrl).toBeNull();
    });
  });
});
