import { describe, expect, it } from "vitest";
import { loginSchema, passwordSchema, signupSchema } from "./auth";

// テスト仕様書 F-01 のうち、入力検証に関するもの

describe("passwordSchema", () => {
  it.each([
    ["abcd1234", true],
    ["abcdefgh", false], // 01-03 数字なし
    ["12345678", false], // 英字なし
    ["abc123", false], // 8文字未満
    [`a1${"x".repeat(71)}`, false], // 72文字超
  ])("%s → %s", (value, ok) => {
    expect(passwordSchema.safeParse(value).success).toBe(ok);
  });
});

describe("signupSchema", () => {
  const base = {
    displayName: "テスト",
    email: "User@Example.com ",
    password: "abcd1234",
    passwordConfirm: "abcd1234",
  };

  it("メールアドレスは前後の空白を除き、小文字にそろえる", () => {
    const r = signupSchema.parse(base);
    expect(r.email).toBe("user@example.com");
  });

  it("確認用パスワードが違うとエラー", () => {
    const r = signupSchema.safeParse({ ...base, passwordConfirm: "abcd9999" });
    expect(r.success).toBe(false);
    expect(r.error?.flatten().fieldErrors.passwordConfirm?.[0]).toBe("パスワードが一致しません");
  });

  it("表示名は50文字まで", () => {
    expect(signupSchema.safeParse({ ...base, displayName: "あ".repeat(50) }).success).toBe(true);
    expect(signupSchema.safeParse({ ...base, displayName: "あ".repeat(51) }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("形式が正しくないメールアドレスはエラー", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
  });
});
