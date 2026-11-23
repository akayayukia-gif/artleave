import { logout } from "@/app/(auth)/actions";
import { getCurrentUser } from "@/server/dal";

// ヘッダー右上のユーザー表示。ログイン情報を読むため <Suspense> の内側で使う。
export async function UserMenu() {
  const user = await getCurrentUser();
  return (
    <div className="flex items-center gap-4 text-sm whitespace-nowrap">
      <span className="hidden text-muted sm:inline">{user.displayName}</span>
      <form action={logout}>
        <button
          type="submit"
          className="text-muted underline decoration-1 underline-offset-4 transition hover:text-text"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
