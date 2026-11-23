import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { isUuid } from "@/schemas/common";
import type { TagCreateInput, TagUpdateInput } from "@/schemas/tag";
import { db } from "@/server/db";
import { ConflictError, NotFoundError } from "@/server/errors";

// タグの業務ロジック（F-03。API設計書 4.3 T01〜T04）。タグ名はユーザーごとに一意。

export type TagItem = {
  id: string;
  name: string;
  category: string | null;
  characterCount: number;
  createdAt: Date;
  updatedAt: Date;
};

const DUPLICATE = "同じ名前のタグがあります";

const select = {
  id: true,
  name: true,
  category: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { characters: true } },
} satisfies Prisma.TagSelect;

function toItem(t: Prisma.TagGetPayload<{ select: typeof select }>): TagItem {
  const { _count, ...rest } = t;
  return { ...rest, characterCount: _count.characters };
}

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

async function findOwned(userId: string, id: string) {
  if (!isUuid(id)) throw new NotFoundError("タグが見つかりません");
  const tag = await db.tag.findFirst({ where: { id, userId }, select: { id: true } });
  if (!tag) throw new NotFoundError("タグが見つかりません");
  return tag;
}

/** T01 一覧。使っているキャラの数（削除の確認表示に使う）も返す */
export async function listTags(userId: string, category?: string): Promise<{ items: TagItem[] }> {
  const tags = await db.tag.findMany({
    where: { userId, category },
    orderBy: [{ category: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    select,
  });
  return { items: tags.map(toItem) };
}

/** T02 作成。同じ名前のタグがあれば 409 */
export async function createTag(userId: string, input: TagCreateInput): Promise<TagItem> {
  try {
    return toItem(
      await db.tag.create({ data: { userId, name: input.name, category: input.category }, select }),
    );
  } catch (e) {
    if (isUniqueViolation(e)) throw new ConflictError(DUPLICATE);
    throw e;
  }
}

/** T03 更新。名前を変えると、付いているキャラ側の表示も新しい名前になる */
export async function updateTag(userId: string, id: string, input: TagUpdateInput): Promise<TagItem> {
  await findOwned(userId, id);
  try {
    return toItem(await db.tag.update({ where: { id }, data: input, select }));
  } catch (e) {
    if (isUniqueViolation(e)) throw new ConflictError(DUPLICATE);
    throw e;
  }
}

/** T04 削除。キャラクターからの紐づけもDBのカスケードで外れる */
export async function deleteTag(userId: string, id: string): Promise<void> {
  await findOwned(userId, id);
  await db.tag.delete({ where: { id } });
}
