// 開発・動作確認用のサンプルデータ（本番では実行しない）
// 実行: pnpm db:seed
// ログイン: demo@example.com / artleave123
import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "artleave123";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("本番環境ではサンプルデータを投入しません");
  }

  // 何度実行しても同じ状態になるよう、デモユーザーを作り直す（関連データはまとめて消える）
  await db.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await db.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash: await hash(DEMO_PASSWORD, { memoryCost: 19456, timeCost: 2, parallelism: 1 }),
      displayName: "デモユーザー",
      settings: { create: { theme: "dark" } },
    },
  });

  const [hero, knight] = await db.tag.createManyAndReturn({
    data: [
      { userId: user.id, name: "主人公", category: "役割" },
      { userId: user.id, name: "騎士団", category: "所属" },
    ],
  });

  const kingdom = await db.term.create({
    data: { userId: user.id, name: "アルディア王国", description: "物語の舞台となる王国。" },
  });
  const order = await db.term.create({
    data: {
      userId: user.id,
      parentId: kingdom.id,
      name: "白銀騎士団",
      description: "王国を守る騎士団。入団には試験がある。",
    },
  });

  const lilia = await db.character.create({
    data: {
      userId: user.id,
      name: "リリア",
      nameKana: "りりあ",
      age: "17",
      species: "エルフ",
      faction: "白銀騎士団",
      personality: "負けず嫌いだが面倒見がよい",
      profile: "青い瞳の見習い騎士。身長158cm。",
      tags: { create: [{ tagId: hero.id }, { tagId: knight.id }] },
      terms: { create: [{ termId: order.id }] },
      paletteColors: {
        create: [
          { name: "髪", hex: "#C9D6FF", usage: "hair", sortOrder: 0 },
          { name: "瞳", hex: "#4A7BD0", usage: "eye", sortOrder: 1 },
          { name: "肌", hex: "#F6DCCB", usage: "skin", sortOrder: 2 },
        ],
      },
    },
  });

  const gai = await db.character.create({
    data: {
      userId: user.id,
      name: "ガイ",
      nameKana: "がい",
      age: "18",
      species: "人間",
      faction: "白銀騎士団",
      personality: "豪快で口が悪いが仲間思い",
      tags: { create: [{ tagId: knight.id }] },
    },
  });

  const standing = await db.pose.findUniqueOrThrow({ where: { code: "standing" } });
  await db.mannequin.create({
    data: {
      characterId: lilia.id,
      heightCm: 158,
      headRatio: 6.5,
      bodyType: "slim",
      skinColor: "#F6DCCB",
      poseId: standing.id,
    },
  });

  await db.relationship.create({
    data: {
      userId: user.id,
      fromCharacterId: lilia.id,
      toCharacterId: gai.id,
      relationType: "rival",
      label: "ライバル",
      isBidirectional: true,
    },
  });

  await db.episode.create({
    data: {
      userId: user.id,
      title: "騎士団入団試験",
      body: "リリアとガイが初めて剣を交えた日。",
      storyTimeLabel: "王国暦312年 春",
      storyOrder: 312010,
      characters: { create: [{ characterId: lilia.id }, { characterId: gai.id }] },
      terms: { create: [{ termId: order.id }] },
    },
  });

  console.log(`サンプルデータを作成しました（ログイン: ${DEMO_EMAIL} / ${DEMO_PASSWORD}）`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
