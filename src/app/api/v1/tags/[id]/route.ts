import { tagUpdateSchema } from "@/schemas/tag";
import { apiRoute } from "@/server/api";
import { readJson } from "@/server/api-response";
import { deleteTag, updateTag } from "@/server/services/tag-service";

// T03 タグ更新 ／ T04 タグ削除（API設計書 4.3）

type Params = { id: string };

export const PATCH = apiRoute<Params>(async ({ request, userId, params }) => {
  const input = tagUpdateSchema.parse(await readJson(request));
  return Response.json(await updateTag(userId, params.id, input));
});

export const DELETE = apiRoute<Params>(async ({ userId, params }) => {
  await deleteTag(userId, params.id);
  return new Response(null, { status: 204 });
});
