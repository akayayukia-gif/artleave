import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/schemas/auth";
import { LoginLockedError, verifyCredentials } from "@/server/services/auth-service";

// 認証の設定（方式設計書 1. 認証方式）
// ・メールアドレスとパスワードでログイン（Credentials）
// ・セッションは JWT を Cookie に保存（DB にセッションテーブルを持たない）

class InvalidLoginError extends CredentialsSignin {
  code = "invalid";
}
class LockedLoginError extends CredentialsSignin {
  code = "locked";
}

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: THIRTY_DAYS },
  pages: { signIn: "/login" },
  // 自宅サーバーでは Caddy（リバースプロキシ）の後ろで動くため、転送されたホスト名を信頼する
  trustHost: true,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidLoginError();

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
        try {
          const user = await verifyCredentials(parsed.data, ip);
          if (!user) throw new InvalidLoginError();
          return { id: user.id, email: user.email, name: user.displayName };
        } catch (e) {
          if (e instanceof LoginLockedError) throw new LockedLoginError();
          throw e;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
