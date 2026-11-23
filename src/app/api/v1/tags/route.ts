import { tagCreateSchema, tagListQuerySchema } from "@/schemas/tag";
import { apiRoute } from "@/server/api";
import { queryOf, readJson } from "@/server/api-response";
import { createTag, listTags } from "@/server/services/tag-service";

// T01 タグ一覧 ／ T02 タグ作成（API設計書 4.3）

export const GET = apiRoute(async ({ request, userId }) => {
  const { category } = tagListQuerySchema.parse(queryOf(request));
  return Response.json(await listTags(userId, category));
});

export const POST = apiRoute(async ({ request, userId }) => {
  const input = tagCreateSchema.parse(await readJson(request));
  return Response.json(await createTag(userId, input), { status: 201 });
});
