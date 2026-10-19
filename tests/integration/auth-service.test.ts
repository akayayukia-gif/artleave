import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// 結合テスト：実際の PostgreSQL を使う（DATABASE_URL が必要。CI ではサービスコンテナのDBを使う）
// テスト仕様書 01-01, 01-02, 01-05, 01-06

const hasDb = Boolean(process.env.DATABASE_URL);
const prefix = `itest-${Date.now()}`;
const email = (name: string) => `${prefix}-${name}@example.com`;

describe.skipIf(!hasDb)("auth-service（DB使用）", async () => {
  const { db } = await import("@/server/db");
  const { registerUser, verifyCredentials, EmailAlreadyRegisteredError, LoginLockedError } = await import(
    "@/server/services/auth-service"
  );

  beforeAll(async () => {
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
  });
  afterAll(async () => {
    await db.user.deleteMany({ where: { email: { startsWith: prefix } } });
  });

  it("登録するとユーザーとダークテーマの設定が作られ、パスワードはハッシュで保存される", async () => {
    const user = await registerUser({
      displayName: "テスト",
      email: email("a"),
      password: "abcd1234",
      passwordConfirm: "abcd1234",
    });
    const saved = await db.user.findUniqueOrThrow({ where: { id: user.id }, include: { settings: true } });
    expect(saved.settings?.theme).toBe("dark");
    expect(saved.passwordHash).not.toContain("abcd1234");
    expect(saved.passwordHash.startsWith("$argon2id$")).toBe(true);
  });

  it("同じメールアドレスでは登録できない", async () => {
    await expect(
      registerUser({
        displayName: "x",
        email: email("a"),
        password: "abcd1234",
        passwordConfirm: "abcd1234",
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  it("正しいパスワードならユーザーを返し、違えば null（理由は区別しない）", async () => {
    expect(await verifyCredentials({ email: email("a"), password: "abcd1234" })).toMatchObject({
      email: email("a"),
    });
    expect(await verifyCredentials({ email: email("a"), password: "wrong1234" })).toBeNull();
    expect(await verifyCredentials({ email: email("none"), password: "abcd1234" })).toBeNull();
  });

  it("5回続けて失敗すると、正しいパスワードでもロックされる", async () => {
    await registerUser({
      displayName: "x",
      email: email("lock"),
      password: "abcd1234",
      passwordConfirm: "abcd1234",
    });
    for (let i = 0; i < 5; i++) {
      await verifyCredentials({ email: email("lock"), password: "wrong1234" });
    }
    await expect(verifyCredentials({ email: email("lock"), password: "abcd1234" })).rejects.toBeInstanceOf(
      LoginLockedError,
    );
  });

  it("DBのCHECK制約：自分自身との相関関係は作れない", async () => {
    const user = await db.user.findFirstOrThrow({ where: { email: email("a") } });
    const c = await db.character.create({ data: { userId: user.id, name: "テストキャラ" } });
    await expect(
      db.relationship.create({
        data: { userId: user.id, fromCharacterId: c.id, toCharacterId: c.id, label: "自分" },
      }),
    ).rejects.toThrow();
  });
});
