import { characterCreateSchema, characterListQuerySchema } from "@/schemas/character";
import { apiRoute } from "@/server/api";
import { queryOf, readJson } from "@/server/api-response";
import { createCharacter, listCharacters } from "@/server/services/character-service";

// C01 キャラクター一覧・検索 ／ C02 キャラクター作成（API設計書 4.2）

export const GET = apiRoute(async ({ request, userId }) => {
  const query = characterListQuerySchema.parse(queryOf(request));
  return Response.json(await listCharacters(userId, query));
});

export const POST = apiRoute(async ({ request, userId }) => {
  const input = characterCreateSchema.parse(await readJson(request));
  const created = await createCharacter(userId, input);
  return Response.json(created, { status: 201, headers: { Location: `/api/v1/characters/${created.id}` } });
});
