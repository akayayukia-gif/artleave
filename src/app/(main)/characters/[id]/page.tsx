import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "キャラクター詳細" };

// SC-11 キャラクター詳細（本の見開き。次の段階で実装する）
export default function Page() {
  return <ComingSoon title="キャラクター詳細" screen="SC-11" feature="F-02" />;
}
