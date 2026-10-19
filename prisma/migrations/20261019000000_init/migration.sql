-- CreateExtension（キーワード部分一致検索用。PostgreSQL 13以降は信頼済み拡張のためDB所有者で作成できる）
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "user_id" UUID NOT NULL,
    "theme" VARCHAR(20) NOT NULL DEFAULT 'dark',
    "sidebar_character_id" UUID,
    "ai_check_enabled" BOOLEAN NOT NULL DEFAULT false,
    "ai_check_consented_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "used_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_kana" VARCHAR(100),
    "personality" TEXT,
    "age" VARCHAR(50),
    "species" VARCHAR(100),
    "faction" VARCHAR(100),
    "profile" TEXT,
    "main_illustration_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_tags" (
    "character_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "character_tags_pkey" PRIMARY KEY ("character_id","tag_id")
);

-- CreateTable
CREATE TABLE "terms" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "parent_id" UUID,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_terms" (
    "character_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,

    CONSTRAINT "character_terms_pkey" PRIMARY KEY ("character_id","term_id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT,
    "story_time_label" VARCHAR(100),
    "story_order" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episode_characters" (
    "episode_id" UUID NOT NULL,
    "character_id" UUID NOT NULL,

    CONSTRAINT "episode_characters_pkey" PRIMARY KEY ("episode_id","character_id")
);

-- CreateTable
CREATE TABLE "episode_terms" (
    "episode_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,

    CONSTRAINT "episode_terms_pkey" PRIMARY KEY ("episode_id","term_id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "from_character_id" UUID NOT NULL,
    "to_character_id" UUID NOT NULL,
    "relation_type" VARCHAR(20) NOT NULL DEFAULT 'other',
    "label" VARCHAR(50) NOT NULL,
    "is_bidirectional" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationship_node_positions" (
    "character_id" UUID NOT NULL,
    "pos_x" DOUBLE PRECISION NOT NULL,
    "pos_y" DOUBLE PRECISION NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "relationship_node_positions_pkey" PRIMARY KEY ("character_id")
);

-- CreateTable
CREATE TABLE "illustrations" (
    "id" UUID NOT NULL,
    "character_id" UUID NOT NULL,
    "kind_label" VARCHAR(50) NOT NULL,
    "caption" VARCHAR(200),
    "original_path" VARCHAR(500) NOT NULL,
    "display_path" VARCHAR(500) NOT NULL,
    "thumb_path" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(50) NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "file_size" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "illustrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "palette_colors" (
    "id" UUID NOT NULL,
    "character_id" UUID NOT NULL,
    "name" VARCHAR(50),
    "hex" CHAR(7) NOT NULL,
    "usage" VARCHAR(20) NOT NULL DEFAULT 'other',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "palette_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poses" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "svg_template" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "poses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mannequins" (
    "id" UUID NOT NULL,
    "character_id" UUID NOT NULL,
    "height_cm" SMALLINT NOT NULL DEFAULT 160,
    "head_ratio" DECIMAL(3,1) NOT NULL DEFAULT 7.0,
    "body_type" VARCHAR(20) NOT NULL DEFAULT 'standard',
    "skin_color" CHAR(7) NOT NULL DEFAULT '#F2D3BE',
    "pose_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "mannequins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_histories" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" VARCHAR(30) NOT NULL,
    "target_id" UUID NOT NULL,
    "target_label" VARCHAR(200) NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "before_json" JSONB,
    "after_json" JSONB,
    "changed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_settings" (
    "user_id" UUID NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "visibility" VARCHAR(10) NOT NULL DEFAULT 'private',
    "password_hash" VARCHAR(255),
    "published_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "public_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "consistency_checks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "target_type" VARCHAR(30) NOT NULL,
    "target_id" UUID NOT NULL,
    "use_ai" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(10) NOT NULL DEFAULT 'pending',
    "result_json" JSONB,
    "ai_error" VARCHAR(200),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "consistency_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "characters_main_illustration_id_key" ON "characters"("main_illustration_id");

-- CreateIndex
CREATE INDEX "characters_user_id_updated_at_idx" ON "characters"("user_id", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "characters_user_id_species_idx" ON "characters"("user_id", "species");

-- CreateIndex
CREATE INDEX "characters_user_id_faction_idx" ON "characters"("user_id", "faction");

-- CreateIndex
CREATE INDEX "characters_name_trgm_idx" ON "characters" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "characters_profile_trgm_idx" ON "characters" USING GIN ("profile" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "tags"("user_id", "name");

-- CreateIndex
CREATE INDEX "character_tags_tag_id_idx" ON "character_tags"("tag_id");

-- CreateIndex
CREATE INDEX "terms_user_id_parent_id_sort_order_idx" ON "terms"("user_id", "parent_id", "sort_order");

-- CreateIndex
CREATE INDEX "character_terms_term_id_idx" ON "character_terms"("term_id");

-- CreateIndex
CREATE INDEX "episodes_user_id_story_order_idx" ON "episodes"("user_id", "story_order");

-- CreateIndex
CREATE INDEX "episode_characters_character_id_idx" ON "episode_characters"("character_id");

-- CreateIndex
CREATE INDEX "episode_terms_term_id_idx" ON "episode_terms"("term_id");

-- CreateIndex
CREATE INDEX "relationships_user_id_idx" ON "relationships"("user_id");

-- CreateIndex
CREATE INDEX "relationships_to_character_id_idx" ON "relationships"("to_character_id");

-- CreateIndex
CREATE UNIQUE INDEX "relationships_from_character_id_to_character_id_label_key" ON "relationships"("from_character_id", "to_character_id", "label");

-- CreateIndex
CREATE INDEX "illustrations_character_id_sort_order_idx" ON "illustrations"("character_id", "sort_order");

-- CreateIndex
CREATE INDEX "palette_colors_character_id_sort_order_idx" ON "palette_colors"("character_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "poses_code_key" ON "poses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "mannequins_character_id_key" ON "mannequins"("character_id");

-- CreateIndex
CREATE INDEX "mannequins_pose_id_idx" ON "mannequins"("pose_id");

-- CreateIndex
CREATE INDEX "change_histories_user_id_target_type_target_id_changed_at_idx" ON "change_histories"("user_id", "target_type", "target_id", "changed_at" DESC);

-- CreateIndex
CREATE INDEX "change_histories_user_id_changed_at_idx" ON "change_histories"("user_id", "changed_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "public_settings_slug_key" ON "public_settings"("slug");

-- CreateIndex
CREATE INDEX "consistency_checks_user_id_target_type_target_id_idx" ON "consistency_checks"("user_id", "target_type", "target_id");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_sidebar_character_id_fkey" FOREIGN KEY ("sidebar_character_id") REFERENCES "characters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_main_illustration_id_fkey" FOREIGN KEY ("main_illustration_id") REFERENCES "illustrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_tags" ADD CONSTRAINT "character_tags_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_tags" ADD CONSTRAINT "character_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terms" ADD CONSTRAINT "terms_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_terms" ADD CONSTRAINT "character_terms_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_terms" ADD CONSTRAINT "character_terms_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_characters" ADD CONSTRAINT "episode_characters_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_characters" ADD CONSTRAINT "episode_characters_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_terms" ADD CONSTRAINT "episode_terms_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episode_terms" ADD CONSTRAINT "episode_terms_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_from_character_id_fkey" FOREIGN KEY ("from_character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_to_character_id_fkey" FOREIGN KEY ("to_character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship_node_positions" ADD CONSTRAINT "relationship_node_positions_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "illustrations" ADD CONSTRAINT "illustrations_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palette_colors" ADD CONSTRAINT "palette_colors_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mannequins" ADD CONSTRAINT "mannequins_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mannequins" ADD CONSTRAINT "mannequins_pose_id_fkey" FOREIGN KEY ("pose_id") REFERENCES "poses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_histories" ADD CONSTRAINT "change_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_settings" ADD CONSTRAINT "public_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consistency_checks" ADD CONSTRAINT "consistency_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
