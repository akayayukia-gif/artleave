import "server-only";
import type { Prisma } from "@/generated/prisma/client";

// 変更履歴（F-13、テーブル設計書 change_histories）の記録。
// 対象の更新と同じトランザクションの中で呼び、更新だけ成功して履歴が残らない状態を作らない。

export type HistoryTarget =
  | "character"
  | "term"
  | "episode"
  | "relationship"
  | "palette_color"
  | "mannequin"
  | "tag";
export type HistoryAction = "create" | "update" | "delete";

export async function recordHistory(
  tx: Prisma.TransactionClient,
  entry: {
    userId: string;
    targetType: HistoryTarget;
    targetId: string;
    targetLabel: string;
    action: HistoryAction;
    before?: Prisma.InputJsonValue | null;
    after?: Prisma.InputJsonValue | null;
  },
): Promise<void> {
  await tx.changeHistory.create({
    data: {
      userId: entry.userId,
      targetType: entry.targetType,
      targetId: entry.targetId,
      targetLabel: entry.targetLabel.slice(0, 200),
      action: entry.action,
      beforeJson: entry.before ?? undefined,
      afterJson: entry.after ?? undefined,
    },
  });
}
