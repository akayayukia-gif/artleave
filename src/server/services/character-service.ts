import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import type { CharacterCreateInput, CharacterListQuery, CharacterUpdateInput } from "@/schemas/character";
import { isUuid, type Page } from "@/schemas/common";
import { db } from "@/server/db";
import { InvalidInputError, NotFoundError } from "@/server/errors";
import { recordHistory } from "@/server/services/history";

// キャラクターの業務ロジック（F-02 キャラ管理、F-04 検索。API設計書 4.2 C01〜C05）。
// すべての処理でログイン中のユーザーIDを受け取り、他ユーザーのデータは「存在しない」として扱う。

type Tx = Prisma.TransactionClient;

const illustrationUrl = (id: string, size: "thumb" | "display") =>
  `/api/v1/illustrations/${id}/file?size=${size}`;

// ---------- 返す形 ----------

export type TagRef = { id: string; name: string };

export type CharacterListItem = {
  id: string;
  name: string;
  species: string | null;
  faction: string | null;
  thumbnailUrl: string | null;
  tags: TagRef[];
  updatedAt: Date;
};

export type CharacterDetail = {
  id: string;
  name: string;
  nameKana: string | null;
  personality: string | null;
  age: string | null;
  species: string | null;
  faction: string | null;
  profile: string | null;
  mainIllustrationId: string | null;
  tags: TagRef[];
  terms: { id: string; name: string }[];
  illustrations: {
    id: string;
    kindLabel: string;
    caption: string | null;
    thumbUrl: string;
    displayUrl: string;
  }[];
  paletteColors: { id: string; name: string | null; hex: string; usage: string }[];
  hasMannequin: boolean;
  episodeCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "ja");

const detailInclude = {
  tags: { select: { tag: { select: { id: true, name: true } } } },
  terms: { select: { term: { select: { id: true, name: true } } } },
  illustrations: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, kindLabel: true, caption: true },
  },
  paletteColors: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, hex: true, usage: true },
  },
  mannequin: { select: { id: true } },
  _count: { select: { episodes: true } },
} satisfies Prisma.CharacterInclude;

type CharacterWithDetail = Prisma.CharacterGetPayload<{ include: typeof detailInclude }>;

function toDetail(c: CharacterWithDetail): CharacterDetail {
  return {
    id: c.id,
    name: c.name,
    nameKana: c.nameKana,
    personality: c.personality,
    age: c.age,
    species: c.species,
    faction: c.faction,
    profile: c.profile,
    mainIllustrationId: c.mainIllustrationId,
    tags: c.tags.map((t) => t.tag).sort(byName),
    terms: c.terms.map((t) => t.term).sort(byName),
    illustrations: c.illustrations.map((i) => ({
      ...i,
      thumbUrl: illustrationUrl(i.id, "thumb"),
      displayUrl: illustrationUrl(i.id, "display"),
    })),
    paletteColors: c.paletteColors,
    hasMannequin: c.mannequin !== null,
    episodeCount: c._count.episodes,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/** 変更履歴に残す内容。比較できるよう、キーの順番と配列の並びを毎回そろえる */
function snapshot(c: {
  name: string;
  nameKana: string | null;
  personality: string | null;
  age: string | null;
  species: string | null;
  faction: string | null;
  profile: string | null;
  mainIllustrationId: string | null;
  tags: TagRef[];
  terms: { id: string; name: string }[];
}) {
  return {
    name: c.name,
    nameKana: c.nameKana,
    personality: c.personality,
    age: c.age,
    species: c.species,
    faction: c.faction,
    profile: c.profile,
    mainIllustrationId: c.mainIllustrationId,
    tags: [...c.tags].sort(byName).map(({ id, name }) => ({ id, name })),
    terms: [...c.terms].sort(byName).map(({ id, name }) => ({ id, name })),
  };
}

// ---------- 内部の確認処理 ----------

async function findOwned(tx: Tx, userId: string, id: string): Promise<CharacterWithDetail> {
  if (!isUuid(id)) throw new NotFoundError("キャラクターが見つかりません");
  const c = await tx.character.findFirst({ where: { id, userId }, include: detailInclude });
  if (!c) throw new NotFoundError("キャラクターが見つかりません");
  return c;
}

/** 指定されたタグがすべて自分のものか確認し、名前つきで返す */
async function ownedTags(tx: Tx, userId: string, ids: string[]): Promise<TagRef[]> {
  if (ids.length === 0) return [];
  const tags = await tx.tag.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true, name: true },
  });
  if (tags.length !== ids.length) throw new InvalidInputError("tagIds", "存在しないタグが含まれています");
  return tags;
}

async function ownedTerms(tx: Tx, userId: string, ids: string[]) {
  if (ids.length === 0) return [];
  const terms = await tx.term.findMany({
    where: { userId, id: { in: ids } },
    select: { id: true, name: true },
  });
  if (terms.length !== ids.length) throw new InvalidInputError("termIds", "存在しない用語が含まれています");
  return terms;
}

/** LIKE の特殊文字（% _ \）をそのままの文字として探せるようにする */
function escapeLike(s: string): string {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// ---------- 公開する処理 ----------

/** C01 一覧・検索。タグは指定したすべてを持つキャラ（AND） */
export async function listCharacters(
  userId: string,
  q: CharacterListQuery,
): Promise<Page<CharacterListItem>> {
  const and: Prisma.CharacterWhereInput[] = q.tagIds.map((tagId) => ({ tags: { some: { tagId } } }));
  if (q.q) {
    const keyword = escapeLike(q.q);
    and.push({
      OR: [
        { name: { contains: keyword, mode: "insensitive" } },
        { profile: { contains: keyword, mode: "insensitive" } },
      ],
    });
  }
  const where: Prisma.CharacterWhereInput = { userId, species: q.species, faction: q.faction, AND: and };
  const orderBy: Prisma.CharacterOrderByWithRelationInput[] =
    q.sort === "name"
      ? [{ name: "asc" }, { id: "asc" }]
      : q.sort === "createdAt"
        ? [{ createdAt: "desc" }, { id: "asc" }]
        : [{ updatedAt: "desc" }, { id: "asc" }];

  const [total, rows] = await Promise.all([
    db.character.count({ where }),
    db.character.findMany({
      where,
      orderBy,
      skip: (q.page - 1) * q.perPage,
      take: q.perPage,
      select: {
        id: true,
        name: true,
        species: true,
        faction: true,
        mainIllustrationId: true,
        updatedAt: true,
        tags: { select: { tag: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  return {
    items: rows.map((c) => ({
      id: c.id,
      name: c.name,
      species: c.species,
      faction: c.faction,
      thumbnailUrl: c.mainIllustrationId ? illustrationUrl(c.mainIllustrationId, "thumb") : null,
      tags: c.tags.map((t) => t.tag).sort(byName),
      updatedAt: c.updatedAt,
    })),
    page: q.page,
    perPage: q.perPage,
    total,
  };
}

/** C03 詳細 */
export async function getCharacter(userId: string, id: string): Promise<CharacterDetail> {
  return toDetail(await findOwned(db, userId, id));
}

/** C02 作成。作成と同時に変更履歴（create）を残す */
export async function createCharacter(userId: string, input: CharacterCreateInput): Promise<CharacterDetail> {
  return db.$transaction(async (tx) => {
    const tags = await ownedTags(tx, userId, input.tagIds);
    const terms = await ownedTerms(tx, userId, input.termIds);
    const created = await tx.character.create({
      data: {
        userId,
        name: input.name,
        nameKana: input.nameKana,
        personality: input.personality,
        age: input.age,
        species: input.species,
        faction: input.faction,
        profile: input.profile,
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
        terms: { create: terms.map((t) => ({ termId: t.id })) },
      },
      include: detailInclude,
    });
    await recordHistory(tx, {
      userId,
      targetType: "character",
      targetId: created.id,
      targetLabel: created.name,
      action: "create",
      after: snapshot({ ...created, tags, terms }),
    });
    return toDetail(created);
  });
}

const SCALAR_KEYS = ["name", "nameKana", "personality", "age", "species", "faction", "profile"] as const;

/**
 * C04 更新。送られた項目だけを変える。tagIds・termIds は送られた内容で置き換える。
 * 何も変わらない場合は書き込まず、履歴も残さない。
 */
export async function updateCharacter(
  userId: string,
  id: string,
  input: CharacterUpdateInput,
): Promise<CharacterDetail> {
  return db.$transaction(async (tx) => {
    const current = await findOwned(tx, userId, id);
    const before = snapshot({
      ...current,
      tags: current.tags.map((t) => t.tag),
      terms: current.terms.map((t) => t.term),
    });

    const tags = input.tagIds ? await ownedTags(tx, userId, input.tagIds) : before.tags;
    const terms = input.termIds ? await ownedTerms(tx, userId, input.termIds) : before.terms;
    if (input.mainIllustrationId) {
      const own = await tx.illustration.count({ where: { id: input.mainIllustrationId, characterId: id } });
      if (!own)
        throw new InvalidInputError("mainIllustrationId", "このキャラクターのイラストを指定してください");
    }

    // 送られなかった項目（undefined）は今の値のまま
    const pick = <K extends (typeof SCALAR_KEYS)[number] | "mainIllustrationId">(key: K) =>
      input[key] !== undefined ? input[key] : before[key];
    const after = snapshot({
      name: input.name ?? before.name,
      nameKana: pick("nameKana") ?? null,
      personality: pick("personality") ?? null,
      age: pick("age") ?? null,
      species: pick("species") ?? null,
      faction: pick("faction") ?? null,
      profile: pick("profile") ?? null,
      mainIllustrationId: pick("mainIllustrationId") ?? null,
      tags,
      terms,
    });
    if (JSON.stringify(after) === JSON.stringify(before)) return toDetail(current);

    const updated = await tx.character.update({
      where: { id },
      data: {
        name: after.name,
        nameKana: after.nameKana,
        personality: after.personality,
        age: after.age,
        species: after.species,
        faction: after.faction,
        profile: after.profile,
        mainIllustrationId: after.mainIllustrationId,
        updatedAt: new Date(), // タグだけ変えた場合も更新日時を進める
        ...(input.tagIds && { tags: { deleteMany: {}, create: tags.map((t) => ({ tagId: t.id })) } }),
        ...(input.termIds && { terms: { deleteMany: {}, create: terms.map((t) => ({ termId: t.id })) } }),
      },
      include: detailInclude,
    });
    await recordHistory(tx, {
      userId,
      targetType: "character",
      targetId: id,
      targetLabel: updated.name,
      action: "update",
      before,
      after,
    });
    return toDetail(updated);
  });
}

/**
 * C05 削除。イラスト・パレット・マネキン・関係・紐づけはDBのカスケードで消える。
 * 削除前の内容（関連データ含む）を履歴に残し、消すべき画像ファイルのパスを返す（ファイルの削除は呼び出し側で行う）。
 */
export async function deleteCharacter(userId: string, id: string): Promise<{ filePaths: string[] }> {
  return db.$transaction(async (tx) => {
    const current = await findOwned(tx, userId, id);
    // トランザクション内は1本の接続を使うため、問い合わせは並列にせず順番に行う
    const illustrations = await tx.illustration.findMany({
      where: { characterId: id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        kindLabel: true,
        caption: true,
        originalPath: true,
        displayPath: true,
        thumbPath: true,
      },
    });
    const mannequin = await tx.mannequin.findUnique({
      where: { characterId: id },
      select: { heightCm: true, headRatio: true, bodyType: true, skinColor: true, poseId: true },
    });
    const before = {
      ...snapshot({
        ...current,
        tags: current.tags.map((t) => t.tag),
        terms: current.terms.map((t) => t.term),
      }),
      paletteColors: current.paletteColors.map(({ name, hex, usage }) => ({ name, hex, usage })),
      illustrations: illustrations.map(({ kindLabel, caption }) => ({ kindLabel, caption })),
      mannequin: mannequin && { ...mannequin, headRatio: Number(mannequin.headRatio) },
    };
    await tx.character.delete({ where: { id } });
    await recordHistory(tx, {
      userId,
      targetType: "character",
      targetId: id,
      targetLabel: current.name,
      action: "delete",
      before,
    });
    return { filePaths: illustrations.flatMap((i) => [i.originalPath, i.displayPath, i.thumbPath]) };
  });
}
