import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "タグ管理" };

export default function Page() {
  return <ComingSoon title="タグ管理" screen="SC-20" feature="F-03" />;
}
