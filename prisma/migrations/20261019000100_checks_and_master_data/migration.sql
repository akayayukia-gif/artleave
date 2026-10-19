-- Prisma のスキーマでは表現できない制約と、本番にも必要なマスタデータ。
-- 取りうる値はアプリ側（src/schemas の Zod）でも同じ内容で検証している。

-- ===== CHECK 制約 =====
ALTER TABLE "user_settings"
  ADD CONSTRAINT "user_settings_theme_check"
  CHECK ("theme" IN ('dark', 'light', 'fantasy', 'cyber'));

ALTER TABLE "relationships"
  ADD CONSTRAINT "relationships_not_self_check"
  CHECK ("from_character_id" <> "to_character_id"),
  ADD CONSTRAINT "relationships_relation_type_check"
  CHECK ("relation_type" IN ('enemy', 'family', 'friend', 'lover', 'rival', 'other'));

ALTER TABLE "illustrations"
  ADD CONSTRAINT "illustrations_mime_type_check"
  CHECK ("mime_type" IN ('image/png', 'image/jpeg', 'image/webp')),
  ADD CONSTRAINT "illustrations_file_size_check"
  CHECK ("file_size" BETWEEN 1 AND 20971520);

ALTER TABLE "palette_colors"
  ADD CONSTRAINT "palette_colors_hex_check"
  CHECK ("hex" ~ '^#[0-9A-Fa-f]{6}$'),
  ADD CONSTRAINT "palette_colors_usage_check"
  CHECK ("usage" IN ('skin', 'hair', 'eye', 'costume', 'other'));

ALTER TABLE "mannequins"
  ADD CONSTRAINT "mannequins_height_cm_check"
  CHECK ("height_cm" BETWEEN 30 AND 300),
  ADD CONSTRAINT "mannequins_head_ratio_check"
  CHECK ("head_ratio" BETWEEN 2.0 AND 10.0),
  ADD CONSTRAINT "mannequins_body_type_check"
  CHECK ("body_type" IN ('slim', 'standard', 'muscular', 'plump')),
  ADD CONSTRAINT "mannequins_skin_color_check"
  CHECK ("skin_color" ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE "change_histories"
  ADD CONSTRAINT "change_histories_action_check"
  CHECK ("action" IN ('create', 'update', 'delete', 'restore')),
  ADD CONSTRAINT "change_histories_target_type_check"
  CHECK ("target_type" IN ('character', 'term', 'episode', 'relationship', 'palette_color', 'mannequin', 'tag'));

ALTER TABLE "public_settings"
  ADD CONSTRAINT "public_settings_visibility_check"
  CHECK ("visibility" IN ('private', 'limited', 'public')),
  ADD CONSTRAINT "public_settings_limited_password_check"
  CHECK ("visibility" <> 'limited' OR "password_hash" IS NOT NULL),
  ADD CONSTRAINT "public_settings_slug_check"
  CHECK ("slug" ~ '^[a-z0-9-]+$');

ALTER TABLE "consistency_checks"
  ADD CONSTRAINT "consistency_checks_status_check"
  CHECK ("status" IN ('pending', 'running', 'completed', 'partial')),
  ADD CONSTRAINT "consistency_checks_target_type_check"
  CHECK ("target_type" IN ('character', 'term', 'episode'));

-- ===== ポーズマスタ（F-11）=====
-- svg_template は「頭の高さ＝1」とした座標で書いた初期版。
-- 描画時に {{SCALE}}（頭1つ分のピクセル数）・{{BODY_X}}／{{BODY_W}}（体格から計算した胴体の左端と幅）・{{SKIN}}（肌の色）を差し込む。
INSERT INTO "poses" ("id", "code", "name", "svg_template", "sort_order") VALUES
  (gen_random_uuid(), 'standing', '直立',
   '<g transform="scale({{SCALE}})" fill="{{SKIN}}"><ellipse cx="0" cy="0.5" rx="0.42" ry="0.5"/><rect x="{{BODY_X}}" y="1.1" width="{{BODY_W}}" height="2.4" rx="0.3"/><rect x="-0.6" y="3.5" width="0.5" height="3.5" rx="0.2"/><rect x="0.1" y="3.5" width="0.5" height="3.5" rx="0.2"/></g>',
   1),
  (gen_random_uuid(), 'a_pose', 'Aポーズ',
   '<g transform="scale({{SCALE}})" fill="{{SKIN}}"><ellipse cx="0" cy="0.5" rx="0.42" ry="0.5"/><rect x="{{BODY_X}}" y="1.1" width="{{BODY_W}}" height="2.4" rx="0.3"/><rect x="-1.5" y="1.3" width="0.35" height="2.6" rx="0.15" transform="rotate(25 -1.3 1.3)"/><rect x="1.15" y="1.3" width="0.35" height="2.6" rx="0.15" transform="rotate(-25 1.3 1.3)"/><rect x="-0.6" y="3.5" width="0.5" height="3.5" rx="0.2"/><rect x="0.1" y="3.5" width="0.5" height="3.5" rx="0.2"/></g>',
   2),
  (gen_random_uuid(), 'contrapposto', 'コントラポスト（片足重心）',
   '<g transform="scale({{SCALE}})" fill="{{SKIN}}"><ellipse cx="0.1" cy="0.5" rx="0.42" ry="0.5"/><rect x="{{BODY_X}}" y="1.1" width="{{BODY_W}}" height="2.4" rx="0.3" transform="rotate(-4 0 2.3)"/><rect x="-0.55" y="3.5" width="0.5" height="3.5" rx="0.2"/><rect x="0.15" y="3.5" width="0.5" height="3.4" rx="0.2" transform="rotate(8 0.4 3.5)"/></g>',
   3);
