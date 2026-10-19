import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/server/db";

// データアクセスの入口（Data Access Layer）。
// ログイン中のユーザーを取り出す処理をここに集め、各画面・処理で書き忘れが起きないようにする。
// Cache Components が有効なため、この関数を呼ぶコンポーネントは <Suspense> の内側に置くこと。

export type CurrentUser = { id: string; displayName: string };

export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // セッションが有効でも、ユーザーが削除されていればログイン画面へ戻す
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, displayName: true },
  });
  if (!user) redirect("/login");
  return user;
}
