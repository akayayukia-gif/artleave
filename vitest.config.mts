import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // "server-only" は React のサーバー環境以外で読み込むとエラーになるため、テストでは空にする
      "server-only": path.resolve(import.meta.dirname, "tests/stubs/empty.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    // 結合テストは同じDBを使うため、ファイルを順番に実行する
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: ["src/server/**", "src/schemas/**"],
      exclude: ["src/generated/**"],
    },
  },
});
