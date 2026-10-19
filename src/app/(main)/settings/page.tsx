import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "設定" };

export default function Page() {
  return <ComingSoon title="設定" screen="SC-80" feature="F-12" />;
}
