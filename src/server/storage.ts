import "server-only";
import { rm } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

// 画像ファイルの保存先（UPLOAD_DIR）を扱う。アップロード処理は F-09 で追加する。

/** UPLOAD_DIR からの相対パスを絶対パスにする。UPLOAD_DIR の外を指すパスは拒否する */
export function resolveUploadPath(relative: string): string {
  const root = path.resolve(env.UPLOAD_DIR);
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error(`保存先の外を指すパスです: ${relative}`);
  }
  return full;
}

/**
 * ファイルを削除する。DBの削除が終わった後に呼ぶ。
 * 失敗しても例外にはせずログに残す（残ったファイルは週1回のバッチ B-04 が掃除する）。
 */
export async function removeFiles(relativePaths: string[]): Promise<void> {
  await Promise.all(
    relativePaths.map(async (p) => {
      try {
        await rm(resolveUploadPath(p), { force: true });
      } catch (e) {
        console.warn("[storage] ファイルを削除できませんでした", p, e);
      }
    }),
  );
}
