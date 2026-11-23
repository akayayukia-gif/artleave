import { describe, expect, it } from "vitest";
import { characterCreateSchema, characterListQuerySchema, characterUpdateSchema } from "@/schemas/character";
import { tagCreateSchema } from "@/schemas/tag";

// テスト仕様書 02-02, 02-03 と、検索条件（F-04）の読み取り

const ID1 = "11111111-1111-4111-8111-111111111111";
const ID2 = "22222222-2222-4222-8222-222222222222";

const messages = (r: { success: boolean; error?: { issues: { message: string }[] } }) =>
  r.error?.issues.map((i) => i.message) ?? [];

describe("characterCreateSchema", () => {
  it("名前だけで作成でき、空の任意項目は null、タグは空配列になる", () => {
    const v = characterCreateSchema.parse({ name: "  リリア ", species: "", age: "  " });
    expect(v).toMatchObject({ name: "リリア", species: null, age: null, tagIds: [], termIds: [] });
  });

  it("名前が空だと「名前を入力してください」（02-02）", () => {
    expect(messages(characterCreateSchema.safeParse({ name: "   " }))).toContain("名前を入力してください");
  });

  it("名前は100文字まで、101文字はエラー（02-03）", () => {
    expect(characterCreateSchema.safeParse({ name: "あ".repeat(100) }).success).toBe(true);
    expect(messages(characterCreateSchema.safeParse({ name: "あ".repeat(101) }))).toContain(
      "100文字以内で入力してください",
    );
  });

  it("年齢は「数百歳」のような文字列で、50文字まで", () => {
    expect(characterCreateSchema.parse({ name: "a", age: "数百歳" }).age).toBe("数百歳");
    expect(characterCreateSchema.safeParse({ name: "a", age: "x".repeat(51) }).success).toBe(false);
  });

  it("タグIDの重複はまとめ、UUIDでないIDは拒否する", () => {
    expect(characterCreateSchema.parse({ name: "a", tagIds: [ID1, ID1, ID2] }).tagIds).toEqual([ID1, ID2]);
    expect(characterCreateSchema.safeParse({ name: "a", tagIds: ["abc"] }).success).toBe(false);
  });
});

describe("characterUpdateSchema", () => {
  it("送った項目だけが残る（送らない項目は undefined）", () => {
    const v = characterUpdateSchema.parse({ age: "18" });
    expect(v).toEqual({ age: "18" });
    expect("name" in v).toBe(false);
  });

  it("任意項目を空にすると null（消す）になり、名前は空にできない", () => {
    expect(characterUpdateSchema.parse({ profile: "" })).toEqual({ profile: null });
    expect(characterUpdateSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("メインイラストは null で外せる", () => {
    expect(characterUpdateSchema.parse({ mainIllustrationId: null })).toEqual({ mainIllustrationId: null });
  });
});

describe("characterListQuerySchema", () => {
  it("何も指定しなければ1ページ目・30件・更新日順", () => {
    expect(characterListQuerySchema.parse({})).toEqual({
      page: 1,
      perPage: 30,
      sort: "updatedAt",
      tagIds: [],
      q: undefined,
      species: undefined,
      faction: undefined,
    });
  });

  it("タグIDはカンマ区切りで受け取る", () => {
    expect(characterListQuerySchema.parse({ tagIds: `${ID1}, ${ID2},` }).tagIds).toEqual([ID1, ID2]);
  });

  it("perPage は100まで、並び順は決まった値だけ", () => {
    expect(characterListQuerySchema.safeParse({ perPage: "101" }).success).toBe(false);
    expect(characterListQuerySchema.safeParse({ sort: "random" }).success).toBe(false);
    expect(characterListQuerySchema.parse({ page: "3", perPage: "10" })).toMatchObject({
      page: 3,
      perPage: 10,
    });
  });
});

describe("tagCreateSchema", () => {
  it("先頭の # は外し、空や51文字以上は拒否する", () => {
    expect(tagCreateSchema.parse({ name: " #主人公 " })).toEqual({ name: "主人公", category: null });
    expect(tagCreateSchema.safeParse({ name: "#" }).success).toBe(false);
    expect(tagCreateSchema.safeParse({ name: "x".repeat(51) }).success).toBe(false);
  });
});
