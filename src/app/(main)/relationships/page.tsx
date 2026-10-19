import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "相関図" };

export default function Page() {
  return <ComingSoon title="相関図" screen="SC-50" feature="F-07" />;
}
