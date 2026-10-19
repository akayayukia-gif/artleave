import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { Prisma } from "@/generated/prisma/client";
import type { LoginInput, SignupInput } from "@/schemas/auth";
import { db } from "@/server/db";
import { loginLimiter } from "@/server/rate-limit";

// argon2id の設定（OWASP の推奨値の範囲内。Raspberry Pi でも1回0.1秒程度）
const ARGON2_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export type AuthUser = { id: string; email: string; displayName: string };

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("このメールアドレスは登録済みです");
  }
}

export class LoginLockedError extends Error {
  constructor(public readonly until: Date) {
    super("ログインに続けて失敗したため、しばらくログインできません");
  }
}

/** 新規登録（F-01）。ユーザーと初期設定（ダークテーマ）を同時に作る */
export async function registerUser(input: SignupInput): Promise<AuthUser> {
  const passwordHash = await hash(input.password, ARGON2_OPTIONS);
  try {
    const user = await db.user.create({
      data: {
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        settings: { create: { theme: "dark" } },
      },
      select: { id: true, email: true, displayName: true },
    });
    return user;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new EmailAlreadyRegisteredError();
    }
    throw e;
  }
}

// 存在しないメールアドレスでも照合と同じくらい時間をかけ、登録の有無を応答時間から推測されないようにする
let dummyHash: Promise<string> | undefined;
function getDummyHash() {
  dummyHash ??= hash("dummy-password-for-timing", ARGON2_OPTIONS);
  return dummyHash;
}

/**
 * ログインの照合（F-01）。成功ならユーザー、失敗なら null を返す。
 * 失敗理由（メールが違う／パスワードが違う）は呼び出し元に区別させない。
 * @param ip 同じIPからの連続失敗も数えるために使う（取得できない場合は省略）
 */
export async function verifyCredentials(input: LoginInput, ip?: string): Promise<AuthUser | null> {
  const keys = [`email:${input.email}`, ...(ip ? [`ip:${ip}`] : [])];
  for (const key of keys) {
    const until = loginLimiter.lockedUntil(key);
    if (until) throw new LoginLockedError(new Date(until));
  }

  const user = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, displayName: true, passwordHash: true },
  });
  let ok = false;
  if (user) {
    ok = await verify(user.passwordHash, input.password);
  } else {
    await verify(await getDummyHash(), input.password);
  }

  if (!user || !ok) {
    for (const key of keys) loginLimiter.recordFailure(key);
    return null;
  }
  for (const key of keys) loginLimiter.reset(key);
  return { id: user.id, email: user.email, displayName: user.displayName };
}
