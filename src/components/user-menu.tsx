import { logout } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/server/dal";

// ヘッダー右上のユーザー表示。ログイン情報を読むため <Suspense> の内側で使う。
export async function UserMenu() {
  const user = await getCurrentUser();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted">{user.displayName}</span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-md border border-border px-3 py-1.5 text-muted hover:text-text"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
