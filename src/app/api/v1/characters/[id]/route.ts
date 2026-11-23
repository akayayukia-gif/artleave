import { characterUpdateSchema } from "@/schemas/character";
import { apiRoute } from "@/server/api";
import { readJson } from "@/server/api-response";
import { deleteCharacter, getCharacter, updateCharacter } from "@/server/services/character-service";
import { removeFiles } from "@/server/storage";

// C03 詳細 ／ C04 更新 ／ C05 削除（API設計書 4.2）

type Params = { id: string };

export const GET = apiRoute<Params>(async ({ userId, params }) => {
  return Response.json(await getCharacter(userId, params.id));
});

export const PATCH = apiRoute<Params>(async ({ request, userId, params }) => {
  const input = characterUpdateSchema.parse(await readJson(request));
  return Response.json(await updateCharacter(userId, params.id, input));
});

export const DELETE = apiRoute<Params>(async ({ userId, params }) => {
  const { filePaths } = await deleteCharacter(userId, params.id);
  // DB から消えた後で画像ファイルを消す（失敗してもバッチ B-04 が後で掃除する）
  await removeFiles(filePaths);
  return new Response(null, { status: 204 });
});
