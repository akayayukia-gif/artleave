// ログイン試行回数の制限（非機能要件 4. セキュリティ）
// 同じキー（メールアドレス、IPアドレス）で一定回数失敗したら、一定時間ロックする。
// アプリは自宅サーバー1台で動かすため、外部のストアは使わずメモリ上で数える。

type Entry = { failures: number; lockedUntil: number | null; firstFailureAt: number };

export type RateLimiterOptions = {
  maxFailures: number;
  lockMs: number;
  /** この時間内の失敗だけを数える */
  windowMs: number;
  now?: () => number;
};

export class LoginRateLimiter {
  private readonly entries = new Map<string, Entry>();
  private readonly now: () => number;

  constructor(private readonly options: RateLimiterOptions) {
    this.now = options.now ?? Date.now;
  }

  /** ロック中ならロックが解ける時刻（ミリ秒）、ロックされていなければ null */
  lockedUntil(key: string): number | null {
    const entry = this.entries.get(key);
    if (!entry?.lockedUntil) return null;
    if (entry.lockedUntil <= this.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.lockedUntil;
  }

  recordFailure(key: string): void {
    const now = this.now();
    const entry = this.entries.get(key);
    if (!entry || now - entry.firstFailureAt > this.options.windowMs) {
      this.entries.set(key, { failures: 1, lockedUntil: null, firstFailureAt: now });
      return;
    }
    entry.failures += 1;
    if (entry.failures >= this.options.maxFailures) {
      entry.lockedUntil = now + this.options.lockMs;
    }
  }

  reset(key: string): void {
    this.entries.delete(key);
  }
}

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// アプリ全体で1つだけ使う（開発中のホットリロードでも消えないようにグローバルに置く）
const globalForLimiter = globalThis as unknown as { loginLimiter?: LoginRateLimiter };
export const loginLimiter =
  globalForLimiter.loginLimiter ??
  new LoginRateLimiter({ maxFailures: 5, lockMs: FIFTEEN_MINUTES, windowMs: FIFTEEN_MINUTES });
globalForLimiter.loginLimiter = loginLimiter;
