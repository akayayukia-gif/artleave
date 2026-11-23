import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "キャラを追加" };

// SC-12 キャラクター作成（次の段階で実装する。APIは /api/v1/characters で利用できる）
export default function Page() {
  return <ComingSoon title="キャラを追加" screen="SC-12" feature="F-02" />;
}
