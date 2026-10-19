import { z } from "zod";

// 環境変数は起動時にまとめて検証し、足りない設定があればすぐに気づけるようにする。
// 値の説明は .env.example を参照。
const schema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET は32文字以上にしてください"),
  UPLOAD_DIR: z.string().min(1).default("./.uploads"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

function load() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`環境変数の設定に誤りがあります:\n${detail}`);
  }
  return parsed.data;
}

// ビルド時（next build）は DB 等に接続しないため、実際に値を使うときに初めて検証する
let cached: z.infer<typeof schema> | undefined;
export const env = new Proxy({} as z.infer<typeof schema>, {
  get(_target, key: string) {
    cached ??= load();
    return cached[key as keyof typeof cached];
  },
});
