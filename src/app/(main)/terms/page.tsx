import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "世界観・用語集" };

export default function Page() {
  return <ComingSoon title="世界観・用語集" screen="SC-30" feature="F-05" />;
}
