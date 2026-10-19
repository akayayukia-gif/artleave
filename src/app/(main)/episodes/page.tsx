import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "エピソード年表" };

export default function Page() {
  return <ComingSoon title="エピソード年表" screen="SC-40" feature="F-06" />;
}
