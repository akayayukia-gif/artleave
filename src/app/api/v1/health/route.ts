import { connection } from "next/server";
import { db } from "@/server/db";

// 稼働確認（API設計書 Z01）。外部の監視サービス（UptimeRobot）から5分ごとに呼ばれる。
export async function GET() {
  // ビルド時に事前生成せず、毎回DBに問い合わせる
  await connection();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}
