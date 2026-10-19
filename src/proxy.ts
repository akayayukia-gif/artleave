import { type NextRequest, NextResponse } from "next/server";

// ログインしていない人を、画面を表示する前にログイン画面へ送る（Next.js 16 の Proxy）。
// ここでは Cookie の有無だけを見る簡易チェックで、本当の確認は src/server/dal.ts で行う。

const PUBLIC_PATHS = ["/login", "/signup", "/password-reset", "/api/auth", "/api/v1/health"];
const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "ログインしてください" } },
      { status: 401 },
    );
  }
  const loginUrl = new URL("/login", request.url);
  if (pathname !== "/") loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // 画像・CSS などの静的ファイルは対象外
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
