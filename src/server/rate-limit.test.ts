import { describe, expect, it } from "vitest";
import { LoginRateLimiter } from "./rate-limit";

// テスト仕様書 01-06：5回失敗すると15分ログインできない

function setup() {
  let now = 0;
  const limiter = new LoginRateLimiter({
    maxFailures: 5,
    lockMs: 15 * 60_000,
    windowMs: 15 * 60_000,
    now: () => now,
  });
  return { limiter, advance: (ms: number) => (now += ms) };
}

describe("LoginRateLimiter", () => {
  it("4回までの失敗ではロックしない", () => {
    const { limiter } = setup();
    for (let i = 0; i < 4; i++) limiter.recordFailure("k");
    expect(limiter.lockedUntil("k")).toBeNull();
  });

  it("5回失敗するとロックし、15分後に解除される", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 5; i++) limiter.recordFailure("k");
    expect(limiter.lockedUntil("k")).not.toBeNull();
    advance(15 * 60_000 - 1);
    expect(limiter.lockedUntil("k")).not.toBeNull();
    advance(1);
    expect(limiter.lockedUntil("k")).toBeNull();
  });

  it("成功（reset）すると失敗回数が戻る", () => {
    const { limiter } = setup();
    for (let i = 0; i < 4; i++) limiter.recordFailure("k");
    limiter.reset("k");
    limiter.recordFailure("k");
    expect(limiter.lockedUntil("k")).toBeNull();
  });

  it("数える期間を過ぎた失敗は数えない", () => {
    const { limiter, advance } = setup();
    for (let i = 0; i < 4; i++) limiter.recordFailure("k");
    advance(15 * 60_000 + 1);
    limiter.recordFailure("k");
    expect(limiter.lockedUntil("k")).toBeNull();
  });

  it("キーごとに別々に数える", () => {
    const { limiter } = setup();
    for (let i = 0; i < 5; i++) limiter.recordFailure("a");
    expect(limiter.lockedUntil("b")).toBeNull();
  });
});
