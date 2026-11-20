-- Empty-preview structural baseline for the legacy schema predating repository migrations.
-- Source: zhaowu-backup-20261112-0125/schema/schema.sql (catalog reconstruction,
-- not pg_dump), SHA-256: f36e8528d615f36b425095ee13e3e696b7d2d2c17c2f4e0ec64cf80c8545d01a.
-- No row data, credentials, bucket records, auth triggers or platform objects.
-- Later migrations retain ownership of: article_editor_overrides, gallery_ingest_queue, owner_devices, paid_visual_blueprints, report_purchase_entitlements, report_section_edits, social_autopublish_settings, social_meta_accounts, social_post_queue, social_queue_gateway, social_threads_accounts, visitor_signup_attempts.
-- No extension is required: gen_random_uuid() is built into Supabase PostgreSQL.
-- Apply through the preview migration runner; never manually apply to production.
-- Existing tables are assumed structurally compatible; this is not a drift repair.

SET search_path = public, extensions;
CREATE SCHEMA IF NOT EXISTS private;

-- Legacy tables (all tables precede foreign keys and SQL functions).

CREATE TABLE IF NOT EXISTS "public"."background_assets" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "source" text DEFAULT 'upload'::text NOT NULL,
  "name" text NOT NULL,
  "storage_path" text NOT NULL,
  "content_type" text,
  "enabled" boolean DEFAULT true NOT NULL,
  "days_of_week" smallint[] DEFAULT '{}'::smallint[] NOT NULL,
  "start_date" date,
  "end_date" date,
  "theme" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "cdn_url" text,
  "cdn_provider" text,
  "cdn_verified_at" timestamp with time zone
);
CREATE TABLE IF NOT EXISTS "public"."background_music_assets" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "original_name" text,
  "storage_path" text NOT NULL,
  "content_type" text DEFAULT 'audio/mp4'::text NOT NULL,
  "codec" text DEFAULT 'aac-lc'::text NOT NULL,
  "bitrate_kbps" integer,
  "sample_rate_hz" integer,
  "channels" integer,
  "duration_seconds" numeric,
  "file_size" bigint,
  "enabled" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "fallback_storage_path" text,
  "fallback_content_type" text
);
CREATE TABLE IF NOT EXISTS "public"."classic_passage_matches" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "report_id" uuid NOT NULL,
  "slot" text DEFAULT 'free_summary'::text NOT NULL,
  "passage_id" uuid NOT NULL,
  "score" integer NOT NULL,
  "match_context" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "match_reason" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "engine_version" text DEFAULT 'classic-match-v1'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."classic_passages" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "source_id" uuid NOT NULL,
  "passage_key" text NOT NULL,
  "locator" text NOT NULL,
  "original_text" text NOT NULL,
  "simplified_text" text DEFAULT ''::text NOT NULL,
  "display_note_zh_hant" text DEFAULT ''::text NOT NULL,
  "display_note_zh_hans" text DEFAULT ''::text NOT NULL,
  "theme_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "element_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "stem_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "branch_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "question_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "life_stage_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "avoid_tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "score_bias" integer DEFAULT 0 NOT NULL,
  "verification_status" text DEFAULT 'pending'::text NOT NULL,
  "verified_against" text DEFAULT ''::text NOT NULL,
  "verified_at" timestamp with time zone,
  "is_direct_quote" boolean DEFAULT true NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."classic_sources" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title_zh_hant" text NOT NULL,
  "title_zh_hans" text NOT NULL,
  "title_en" text DEFAULT ''::text NOT NULL,
  "tradition" text NOT NULL,
  "canon_code" text DEFAULT ''::text NOT NULL,
  "edition_name" text DEFAULT ''::text NOT NULL,
  "source_url" text DEFAULT ''::text NOT NULL,
  "verification_note" text DEFAULT ''::text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."daily_usage" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "visitor_key" text,
  "user_id" uuid,
  "usage_date" date NOT NULL,
  "question_count" integer DEFAULT 0 NOT NULL,
  "report_count" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."gallery_analysis_runs" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "token_hash" text NOT NULL,
  "status" text DEFAULT 'running'::text NOT NULL,
  "processed_count" integer DEFAULT 0 NOT NULL,
  "approved_count" integer DEFAULT 0 NOT NULL,
  "review_count" integer DEFAULT 0 NOT NULL,
  "failed_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "expires_at" timestamp with time zone DEFAULT (now() + '04:00:00'::interval) NOT NULL,
  "completed_at" timestamp with time zone,
  "last_error" text,
  "invoke_token" text
);
CREATE TABLE IF NOT EXISTS "public"."gallery_asset_knowledge" (
  "asset_id" uuid NOT NULL,
  "analysis_version" text DEFAULT 'vision-consensus-v1'::text NOT NULL,
  "analysis_status" text DEFAULT 'pending'::text NOT NULL,
  "subject_labels" text[] DEFAULT '{}'::text[] NOT NULL,
  "style_labels" text[] DEFAULT '{}'::text[] NOT NULL,
  "motifs" text[] DEFAULT '{}'::text[] NOT NULL,
  "palette" text[] DEFAULT '{}'::text[] NOT NULL,
  "mood_labels" text[] DEFAULT '{}'::text[] NOT NULL,
  "element_scores" jsonb DEFAULT '{"fire": 0, "wood": 0, "earth": 0, "metal": 0, "water": 0}'::jsonb NOT NULL,
  "climate_scores" jsonb DEFAULT '{"dry": 0, "cool": 0, "warm": 0, "moist": 0}'::jsonb NOT NULL,
  "use_roles" text[] DEFAULT '{}'::text[] NOT NULL,
  "contains_text" boolean DEFAULT false NOT NULL,
  "contains_human_figure" boolean DEFAULT false NOT NULL,
  "contains_religious_figure" boolean DEFAULT false NOT NULL,
  "client_eligible" boolean DEFAULT false NOT NULL,
  "confidence" numeric(4,3) DEFAULT 0 NOT NULL,
  "summary" text DEFAULT ''::text NOT NULL,
  "rationale" text DEFAULT ''::text NOT NULL,
  "model_a" jsonb,
  "model_b" jsonb,
  "analyzed_at" timestamp with time zone,
  "reviewed_at" timestamp with time zone,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."gallery_assets" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "category" text NOT NULL,
  "asset_key" text NOT NULL,
  "title" text DEFAULT ''::text NOT NULL,
  "storage_path" text NOT NULL,
  "content_type" text,
  "tags" text[] DEFAULT '{}'::text[] NOT NULL,
  "enabled" boolean DEFAULT true NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "bucket_id" text DEFAULT 'zhaowu-gallery'::text NOT NULL,
  "cdn_url" text,
  "cdn_provider" text,
  "cdn_verified_at" timestamp with time zone
);
CREATE TABLE IF NOT EXISTS "public"."life_view_article_views" (
  "article_id" text NOT NULL,
  "view_count" bigint DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."owner_email_aliases" (
  "email" text NOT NULL,
  "owner_archive_id" text DEFAULT 'stone_owner'::text NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."owner_sessions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "token_hash" text NOT NULL,
  "email" text NOT NULL,
  "user_id" uuid,
  "source" text DEFAULT 'account'::text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."profiles" (
  "id" uuid NOT NULL,
  "email" text,
  "display_name" text,
  "is_owner" boolean DEFAULT false NOT NULL,
  "owner_archive_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "birth_data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."promo_codes" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "product_id" text NOT NULL,
  "system_id" text,
  "active" boolean DEFAULT true NOT NULL,
  "expires_at" timestamp with time zone,
  "max_redemptions" integer,
  "redeemed_count" integer DEFAULT 0 NOT NULL,
  "note" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."promo_redemptions" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "promo_code_id" uuid NOT NULL,
  "access_key" text NOT NULL,
  "product_id" text NOT NULL,
  "system_id" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."release_history" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "version" text NOT NULL,
  "update_number" integer,
  "notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "published_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."report_requests" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "public_code" text,
  "token_hash" text,
  "user_id" uuid DEFAULT auth.uid(),
  "user_email" text,
  "owner_archive_id" text,
  "archive_source_user_id" text,
  "archive_source_email" text,
  "alias" text,
  "record_kind" text DEFAULT 'customer'::text NOT NULL,
  "status" text DEFAULT 'pending'::text NOT NULL,
  "access_mode" text DEFAULT 'paid'::text NOT NULL,
  "free_access_date" date,
  "payment_tier" text,
  "payment_method" text,
  "payment_status" text DEFAULT 'unpaid'::text NOT NULL,
  "payment_amount" numeric,
  "payment_currency" text,
  "stripe_session_id" text,
  "paid_at" timestamp with time zone,
  "approved_at" timestamp with time zone,
  "delivered_at" timestamp with time zone,
  "context" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "engine_snapshot" jsonb,
  "calibration" jsonb,
  "mother_draft" jsonb,
  "paid_report" jsonb,
  "evidence_trace" jsonb,
  "error_detection" jsonb,
  "visual_profile" jsonb,
  "image_path" text,
  "image_error" text,
  "generation_attempts" integer DEFAULT 0 NOT NULL,
  "generation_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."site_settings" (
  "key" text NOT NULL,
  "value" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "public_read" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "public"."site_visits" (
  "id" bigint GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  "visitor_key" text NOT NULL,
  "visited_on" date DEFAULT CURRENT_DATE NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Constraints: preserve existing constraints without dropping/revalidating them.

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.background_assets'::regclass AND conname = 'background_assets_pkey'
  ) THEN
    ALTER TABLE "public"."background_assets" ADD CONSTRAINT "background_assets_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.background_music_assets'::regclass AND conname = 'background_music_assets_pkey'
  ) THEN
    ALTER TABLE "public"."background_music_assets" ADD CONSTRAINT "background_music_assets_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passage_matches'::regclass AND conname = 'classic_passage_matches_pkey'
  ) THEN
    ALTER TABLE "public"."classic_passage_matches" ADD CONSTRAINT "classic_passage_matches_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_pkey'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_sources'::regclass AND conname = 'classic_sources_pkey'
  ) THEN
    ALTER TABLE "public"."classic_sources" ADD CONSTRAINT "classic_sources_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.daily_usage'::regclass AND conname = 'daily_usage_pkey'
  ) THEN
    ALTER TABLE "public"."daily_usage" ADD CONSTRAINT "daily_usage_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_analysis_runs'::regclass AND conname = 'gallery_analysis_runs_pkey'
  ) THEN
    ALTER TABLE "public"."gallery_analysis_runs" ADD CONSTRAINT "gallery_analysis_runs_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_asset_knowledge'::regclass AND conname = 'gallery_asset_knowledge_pkey'
  ) THEN
    ALTER TABLE "public"."gallery_asset_knowledge" ADD CONSTRAINT "gallery_asset_knowledge_pkey" PRIMARY KEY (asset_id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_assets'::regclass AND conname = 'gallery_assets_pkey'
  ) THEN
    ALTER TABLE "public"."gallery_assets" ADD CONSTRAINT "gallery_assets_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.life_view_article_views'::regclass AND conname = 'life_view_article_views_pkey'
  ) THEN
    ALTER TABLE "public"."life_view_article_views" ADD CONSTRAINT "life_view_article_views_pkey" PRIMARY KEY (article_id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.owner_email_aliases'::regclass AND conname = 'owner_email_aliases_pkey'
  ) THEN
    ALTER TABLE "public"."owner_email_aliases" ADD CONSTRAINT "owner_email_aliases_pkey" PRIMARY KEY (email);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.owner_sessions'::regclass AND conname = 'owner_sessions_pkey'
  ) THEN
    ALTER TABLE "public"."owner_sessions" ADD CONSTRAINT "owner_sessions_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_pkey'
  ) THEN
    ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_pkey'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_redemptions'::regclass AND conname = 'promo_redemptions_pkey'
  ) THEN
    ALTER TABLE "public"."promo_redemptions" ADD CONSTRAINT "promo_redemptions_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.release_history'::regclass AND conname = 'release_history_pkey'
  ) THEN
    ALTER TABLE "public"."release_history" ADD CONSTRAINT "release_history_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_pkey'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.site_settings'::regclass AND conname = 'site_settings_pkey'
  ) THEN
    ALTER TABLE "public"."site_settings" ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY (key);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.site_visits'::regclass AND conname = 'site_visits_pkey'
  ) THEN
    ALTER TABLE "public"."site_visits" ADD CONSTRAINT "site_visits_pkey" PRIMARY KEY (id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.background_music_assets'::regclass AND conname = 'background_music_assets_storage_path_key'
  ) THEN
    ALTER TABLE "public"."background_music_assets" ADD CONSTRAINT "background_music_assets_storage_path_key" UNIQUE (storage_path);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passage_matches'::regclass AND conname = 'classic_passage_matches_report_slot_unique'
  ) THEN
    ALTER TABLE "public"."classic_passage_matches" ADD CONSTRAINT "classic_passage_matches_report_slot_unique" UNIQUE (report_id, slot);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_passage_key_key'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_passage_key_key" UNIQUE (passage_key);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_sources'::regclass AND conname = 'classic_sources_slug_key'
  ) THEN
    ALTER TABLE "public"."classic_sources" ADD CONSTRAINT "classic_sources_slug_key" UNIQUE (slug);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_analysis_runs'::regclass AND conname = 'gallery_analysis_runs_token_hash_key'
  ) THEN
    ALTER TABLE "public"."gallery_analysis_runs" ADD CONSTRAINT "gallery_analysis_runs_token_hash_key" UNIQUE (token_hash);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_assets'::regclass AND conname = 'gallery_assets_storage_path_key'
  ) THEN
    ALTER TABLE "public"."gallery_assets" ADD CONSTRAINT "gallery_assets_storage_path_key" UNIQUE (storage_path);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.owner_sessions'::regclass AND conname = 'owner_sessions_token_hash_key'
  ) THEN
    ALTER TABLE "public"."owner_sessions" ADD CONSTRAINT "owner_sessions_token_hash_key" UNIQUE (token_hash);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_code_key'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_code_key" UNIQUE (code);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_redemptions'::regclass AND conname = 'promo_redemptions_code_access_system_key'
  ) THEN
    ALTER TABLE "public"."promo_redemptions" ADD CONSTRAINT "promo_redemptions_code_access_system_key" UNIQUE (promo_code_id, access_key, system_id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.release_history'::regclass AND conname = 'release_history_version_key'
  ) THEN
    ALTER TABLE "public"."release_history" ADD CONSTRAINT "release_history_version_key" UNIQUE (version);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_public_code_key'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_public_code_key" UNIQUE (public_code);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.site_visits'::regclass AND conname = 'site_visits_visitor_key_visited_on_key'
  ) THEN
    ALTER TABLE "public"."site_visits" ADD CONSTRAINT "site_visits_visitor_key_visited_on_key" UNIQUE (visitor_key, visited_on);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.background_assets'::regclass AND conname = 'background_date_order'
  ) THEN
    ALTER TABLE "public"."background_assets" ADD CONSTRAINT "background_date_order" CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passage_matches'::regclass AND conname = 'classic_passage_matches_slot_check'
  ) THEN
    ALTER TABLE "public"."classic_passage_matches" ADD CONSTRAINT "classic_passage_matches_slot_check" CHECK (char_length(slot) >= 1 AND char_length(slot) <= 64);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_key_check'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_key_check" CHECK (passage_key ~ '^[a-z0-9][a-z0-9_-]{2,120}$'::text);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_tag_limits'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_tag_limits" CHECK (cardinality(theme_tags) <= 32 AND cardinality(element_tags) <= 8 AND cardinality(stem_tags) <= 12 AND cardinality(branch_tags) <= 14 AND cardinality(question_tags) <= 24 AND cardinality(life_stage_tags) <= 24 AND cardinality(avoid_tags) <= 24);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_verification_check'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_verification_check" CHECK (verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_verified_source_check'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_verified_source_check" CHECK (verification_status <> 'verified'::text OR char_length(verified_against) > 0 AND verified_at IS NOT NULL);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_sources'::regclass AND conname = 'classic_sources_slug_check'
  ) THEN
    ALTER TABLE "public"."classic_sources" ADD CONSTRAINT "classic_sources_slug_check" CHECK (slug ~ '^[a-z0-9][a-z0-9_-]{1,80}$'::text);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_sources'::regclass AND conname = 'classic_sources_tradition_check'
  ) THEN
    ALTER TABLE "public"."classic_sources" ADD CONSTRAINT "classic_sources_tradition_check" CHECK (tradition = ANY (ARRAY['daoist'::text, 'buddhist'::text, 'confucian'::text, 'yijing'::text, 'other'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.daily_usage'::regclass AND conname = 'daily_usage_identity'
  ) THEN
    ALTER TABLE "public"."daily_usage" ADD CONSTRAINT "daily_usage_identity" CHECK (visitor_key IS NOT NULL OR user_id IS NOT NULL);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.daily_usage'::regclass AND conname = 'daily_usage_question_count_check'
  ) THEN
    ALTER TABLE "public"."daily_usage" ADD CONSTRAINT "daily_usage_question_count_check" CHECK (question_count >= 0);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.daily_usage'::regclass AND conname = 'daily_usage_report_count_check'
  ) THEN
    ALTER TABLE "public"."daily_usage" ADD CONSTRAINT "daily_usage_report_count_check" CHECK (report_count >= 0);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_analysis_runs'::regclass AND conname = 'gallery_analysis_runs_status_check'
  ) THEN
    ALTER TABLE "public"."gallery_analysis_runs" ADD CONSTRAINT "gallery_analysis_runs_status_check" CHECK (status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text, 'cancelled'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_asset_knowledge'::regclass AND conname = 'gallery_asset_knowledge_analysis_status_check'
  ) THEN
    ALTER TABLE "public"."gallery_asset_knowledge" ADD CONSTRAINT "gallery_asset_knowledge_analysis_status_check" CHECK (analysis_status = ANY (ARRAY['pending'::text, 'analyzing'::text, 'approved'::text, 'review_required'::text, 'failed'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_asset_knowledge'::regclass AND conname = 'gallery_asset_knowledge_confidence_check'
  ) THEN
    ALTER TABLE "public"."gallery_asset_knowledge" ADD CONSTRAINT "gallery_asset_knowledge_confidence_check" CHECK (confidence >= 0::numeric AND confidence <= 1::numeric);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_assets'::regclass AND conname = 'gallery_assets_asset_key_check'
  ) THEN
    ALTER TABLE "public"."gallery_assets" ADD CONSTRAINT "gallery_assets_asset_key_check" CHECK (length(asset_key) >= 1 AND length(asset_key) <= 120);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_assets'::regclass AND conname = 'gallery_assets_category_check'
  ) THEN
    ALTER TABLE "public"."gallery_assets" ADD CONSTRAINT "gallery_assets_category_check" CHECK (length(category) >= 1 AND length(category) <= 64);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_assets'::regclass AND conname = 'gallery_assets_title_check'
  ) THEN
    ALTER TABLE "public"."gallery_assets" ADD CONSTRAINT "gallery_assets_title_check" CHECK (length(title) <= 180);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.owner_sessions'::regclass AND conname = 'owner_sessions_source_check'
  ) THEN
    ALTER TABLE "public"."owner_sessions" ADD CONSTRAINT "owner_sessions_source_check" CHECK (source = ANY (ARRAY['account'::text, 'password'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_max_redemptions_check'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_max_redemptions_check" CHECK (max_redemptions > 0);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_product_id_check'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_product_id_check" CHECK (product_id = ANY (ARRAY['system'::text, 'bundle'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_redeemed_count_check'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_redeemed_count_check" CHECK (redeemed_count >= 0);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_redemption_cap_check'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_redemption_cap_check" CHECK (max_redemptions IS NULL OR redeemed_count <= max_redemptions);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_codes'::regclass AND conname = 'promo_codes_system_id_check'
  ) THEN
    ALTER TABLE "public"."promo_codes" ADD CONSTRAINT "promo_codes_system_id_check" CHECK (system_id = ANY (ARRAY['bazi'::text, 'ziwei'::text, 'qizheng'::text, 'western'::text, 'indian'::text, 'palm'::text, 'numerology'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_redemptions'::regclass AND conname = 'promo_redemptions_product_id_check'
  ) THEN
    ALTER TABLE "public"."promo_redemptions" ADD CONSTRAINT "promo_redemptions_product_id_check" CHECK (product_id = ANY (ARRAY['system'::text, 'bundle'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_redemptions'::regclass AND conname = 'promo_redemptions_system_id_check'
  ) THEN
    ALTER TABLE "public"."promo_redemptions" ADD CONSTRAINT "promo_redemptions_system_id_check" CHECK (system_id = ANY (ARRAY['bazi'::text, 'ziwei'::text, 'qizheng'::text, 'western'::text, 'indian'::text, 'palm'::text, 'numerology'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_access_mode_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_access_mode_check" CHECK (access_mode = ANY (ARRAY['paid'::text, 'daily_free'::text, 'member'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_payment_currency_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_payment_currency_check" CHECK (payment_currency IS NULL OR (payment_currency = ANY (ARRAY['AUD'::text, 'CNY'::text])));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_payment_method_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_payment_method_check" CHECK (payment_method IS NULL OR (payment_method = ANY (ARRAY['stripe'::text, 'wechat'::text])));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_payment_status_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_payment_status_check" CHECK (payment_status = ANY (ARRAY['unpaid'::text, 'checkout_created'::text, 'awaiting_confirmation'::text, 'paid'::text, 'not_required'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_payment_tier_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_payment_tier_check" CHECK (payment_tier IS NULL OR (payment_tier = ANY (ARRAY['light'::text, 'deep'::text, 'complete'::text, 'free'::text, 'full'::text])));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_record_kind_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_record_kind_check" CHECK (record_kind = ANY (ARRAY['customer'::text, 'qa'::text, 'analysis'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_status_check'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'contacted'::text, 'approved'::text, 'declined'::text, 'ready'::text, 'delivered'::text, 'engine_ready'::text, 'report_ready'::text, 'full_ready'::text]));
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passage_matches'::regclass AND conname = 'classic_passage_matches_passage_id_fkey'
  ) THEN
    ALTER TABLE "public"."classic_passage_matches" ADD CONSTRAINT "classic_passage_matches_passage_id_fkey" FOREIGN KEY (passage_id) REFERENCES classic_passages(id) ON DELETE RESTRICT;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passage_matches'::regclass AND conname = 'classic_passage_matches_report_id_fkey'
  ) THEN
    ALTER TABLE "public"."classic_passage_matches" ADD CONSTRAINT "classic_passage_matches_report_id_fkey" FOREIGN KEY (report_id) REFERENCES report_requests(id) ON DELETE CASCADE;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.classic_passages'::regclass AND conname = 'classic_passages_source_id_fkey'
  ) THEN
    ALTER TABLE "public"."classic_passages" ADD CONSTRAINT "classic_passages_source_id_fkey" FOREIGN KEY (source_id) REFERENCES classic_sources(id) ON DELETE RESTRICT;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.daily_usage'::regclass AND conname = 'daily_usage_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."daily_usage" ADD CONSTRAINT "daily_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.gallery_asset_knowledge'::regclass AND conname = 'gallery_asset_knowledge_asset_id_fkey'
  ) THEN
    ALTER TABLE "public"."gallery_asset_knowledge" ADD CONSTRAINT "gallery_asset_knowledge_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES gallery_assets(id) ON DELETE CASCADE;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.owner_sessions'::regclass AND conname = 'owner_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."owner_sessions" ADD CONSTRAINT "owner_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.promo_redemptions'::regclass AND conname = 'promo_redemptions_promo_code_id_fkey'
  ) THEN
    ALTER TABLE "public"."promo_redemptions" ADD CONSTRAINT "promo_redemptions_promo_code_id_fkey" FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id);
  END IF;
END
$baseline$;

DO $baseline$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
    WHERE conrelid = 'public.report_requests'::regclass AND conname = 'report_requests_user_id_fkey'
  ) THEN
    ALTER TABLE "public"."report_requests" ADD CONSTRAINT "report_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END
$baseline$;

-- Legacy indexes (constraint-backed indexes are created above).

CREATE INDEX IF NOT EXISTS background_assets_updated_idx ON public.background_assets USING btree (updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS background_music_one_enabled_idx ON public.background_music_assets USING btree (enabled) WHERE (enabled = true);
CREATE INDEX IF NOT EXISTS classic_passage_matches_passage_id_idx ON public.classic_passage_matches USING btree (passage_id);
CREATE INDEX IF NOT EXISTS classic_passage_matches_report_idx ON public.classic_passage_matches USING btree (report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS classic_passages_branch_tags_gin ON public.classic_passages USING gin (branch_tags);
CREATE INDEX IF NOT EXISTS classic_passages_element_tags_gin ON public.classic_passages USING gin (element_tags);
CREATE INDEX IF NOT EXISTS classic_passages_life_stage_tags_gin ON public.classic_passages USING gin (life_stage_tags);
CREATE INDEX IF NOT EXISTS classic_passages_question_tags_gin ON public.classic_passages USING gin (question_tags);
CREATE INDEX IF NOT EXISTS classic_passages_source_idx ON public.classic_passages USING btree (source_id);
CREATE INDEX IF NOT EXISTS classic_passages_stem_tags_gin ON public.classic_passages USING gin (stem_tags);
CREATE INDEX IF NOT EXISTS classic_passages_theme_tags_gin ON public.classic_passages USING gin (theme_tags);
CREATE INDEX IF NOT EXISTS classic_passages_verified_idx ON public.classic_passages USING btree (verification_status, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS daily_usage_user_day_uq ON public.daily_usage USING btree (user_id, usage_date) WHERE (user_id IS NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS daily_usage_visitor_day_uq ON public.daily_usage USING btree (visitor_key, usage_date) WHERE (visitor_key IS NOT NULL);
CREATE INDEX IF NOT EXISTS gallery_asset_knowledge_client_idx ON public.gallery_asset_knowledge USING btree (client_eligible) WHERE (analysis_status = 'approved'::text);
CREATE INDEX IF NOT EXISTS gallery_asset_knowledge_status_idx ON public.gallery_asset_knowledge USING btree (analysis_status);
CREATE INDEX IF NOT EXISTS gallery_assets_category_key_idx ON public.gallery_assets USING btree (category, asset_key, created_at DESC);
CREATE INDEX IF NOT EXISTS gallery_assets_enabled_idx ON public.gallery_assets USING btree (enabled, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS gallery_assets_one_primary_idx ON public.gallery_assets USING btree (category, asset_key) WHERE (is_primary AND enabled);
CREATE INDEX IF NOT EXISTS owner_sessions_expires_idx ON public.owner_sessions USING btree (expires_at);
CREATE INDEX IF NOT EXISTS owner_sessions_user_id_idx ON public.owner_sessions USING btree (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_code_lower_uidx ON public.promo_codes USING btree (lower(code));
CREATE INDEX IF NOT EXISTS promo_redemptions_access_key_system_idx ON public.promo_redemptions USING btree (access_key, system_id);
CREATE INDEX IF NOT EXISTS report_requests_created_at_idx ON public.report_requests USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS report_requests_owner_archive_idx ON public.report_requests USING btree (owner_archive_id);
CREATE INDEX IF NOT EXISTS report_requests_status_idx ON public.report_requests USING btree (status);
CREATE INDEX IF NOT EXISTS report_requests_user_created_idx ON public.report_requests USING btree (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS report_requests_user_id_idx ON public.report_requests USING btree (user_id);

-- Functions: table types first, then callees before SQL-language callers.

CREATE OR REPLACE FUNCTION private.zhaowu_is_owner()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'auth'
AS $function$
  select exists (
    select 1
    from public.owner_email_aliases a
    join auth.users u on u.id = auth.uid()
    where a.active = true
      and lower(a.email) = lower(coalesce(u.email, ''))
  );
$function$;
CREATE OR REPLACE FUNCTION public.classic_jsonb_text_array(payload jsonb, key_name text)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog'
AS $function$
  select coalesce(
    array(
      select jsonb_array_elements_text(
        case
          when jsonb_typeof(coalesce(payload, '{}'::jsonb) -> key_name) = 'array'
            then coalesce(payload, '{}'::jsonb) -> key_name
          else '[]'::jsonb
        end
      )
    ),
    '{}'::text[]
  );
$function$;
CREATE OR REPLACE FUNCTION public.classic_overlap_count(left_tags text[], right_tags text[])
 RETURNS integer
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'pg_catalog'
AS $function$
  select count(*)::integer
  from (
    select distinct tag from unnest(coalesce(left_tags, '{}'::text[])) as tag
    intersect
    select distinct tag from unnest(coalesce(right_tags, '{}'::text[])) as tag
  ) overlap_rows;
$function$;
CREATE OR REPLACE FUNCTION public.match_classic_passage(p_context jsonb, p_limit integer DEFAULT 1)
 RETURNS TABLE(passage_id uuid, passage_key text, source_slug text, source_title_zh_hant text, source_title_zh_hans text, locator text, original_text text, simplified_text text, score integer, match_reason jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with ctx as (
    select
      public.classic_jsonb_text_array(p_context, 'themes') as themes,
      public.classic_jsonb_text_array(p_context, 'elements') as elements,
      public.classic_jsonb_text_array(p_context, 'stems') as stems,
      public.classic_jsonb_text_array(p_context, 'branches') as branches,
      public.classic_jsonb_text_array(p_context, 'questions') as questions,
      public.classic_jsonb_text_array(p_context, 'life_stages') as life_stages,
      public.classic_jsonb_text_array(p_context, 'avoid') as avoid_tags,
      coalesce(p_context ->> 'stable_key', '') as stable_key
  ), scored as (
    select
      p.id as passage_id,
      p.passage_key,
      s.slug as source_slug,
      s.title_zh_hant as source_title_zh_hant,
      s.title_zh_hans as source_title_zh_hans,
      p.locator,
      p.original_text,
      p.simplified_text,
      (
        p.score_bias
        + public.classic_overlap_count(p.theme_tags, ctx.themes) * 12
        + public.classic_overlap_count(p.element_tags, ctx.elements) * 8
        + public.classic_overlap_count(p.stem_tags, ctx.stems) * 8
        + public.classic_overlap_count(p.branch_tags, ctx.branches) * 6
        + public.classic_overlap_count(p.question_tags, ctx.questions) * 10
        + public.classic_overlap_count(p.life_stage_tags, ctx.life_stages) * 7
      )::integer as score,
      jsonb_build_object(
        'theme_hits', public.classic_overlap_count(p.theme_tags, ctx.themes),
        'element_hits', public.classic_overlap_count(p.element_tags, ctx.elements),
        'stem_hits', public.classic_overlap_count(p.stem_tags, ctx.stems),
        'branch_hits', public.classic_overlap_count(p.branch_tags, ctx.branches),
        'question_hits', public.classic_overlap_count(p.question_tags, ctx.questions),
        'life_stage_hits', public.classic_overlap_count(p.life_stage_tags, ctx.life_stages),
        'score_bias', p.score_bias
      ) as match_reason,
      ctx.stable_key
    from public.classic_passages p
    join public.classic_sources s on s.id = p.source_id
    cross join ctx
    where p.is_active = true
      and s.is_active = true
      and p.verification_status = 'verified'
      and p.is_direct_quote = true
      and public.classic_overlap_count(p.avoid_tags, ctx.avoid_tags) = 0
  )
  select
    passage_id,
    passage_key,
    source_slug,
    source_title_zh_hant,
    source_title_zh_hans,
    locator,
    original_text,
    simplified_text,
    score,
    match_reason
  from scored
  order by score desc, md5(stable_key || ':' || passage_key) asc
  limit least(greatest(coalesce(p_limit, 1), 1), 5);
$function$;
CREATE OR REPLACE FUNCTION public.activate_background_music(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'private'
AS $function$
begin
  if not private.zhaowu_is_owner() then
    raise exception 'owner access required';
  end if;

  if not exists (select 1 from public.background_music_assets where id = p_id) then
    raise exception 'music asset not found';
  end if;

  update public.background_music_assets
  set enabled = false, updated_at = now()
  where enabled = true and id <> p_id;

  update public.background_music_assets
  set enabled = true, updated_at = now()
  where id = p_id;
end;
$function$;
CREATE OR REPLACE FUNCTION public.claim_promo_code_slot(p_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
BEGIN
    -- One conditional UPDATE locks the row and rechecks the cap after concurrent
    -- updates, so concurrent claims cannot increment beyond max_redemptions.
    UPDATE public.promo_codes
       SET redeemed_count = redeemed_count + 1,
           updated_at = now()
     WHERE id = p_id
       AND active = true
       AND (expires_at IS NULL OR expires_at > now())
       AND (max_redemptions IS NULL OR redeemed_count < max_redemptions);

    RETURN FOUND;
END;
$function$;
CREATE OR REPLACE FUNCTION public.get_customer_classic_passage(p_context jsonb)
 RETURNS TABLE(passage_key text, source_title_zh_hant text, source_title_zh_hans text, locator text, original_text text, simplified_text text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    m.passage_key,
    m.source_title_zh_hant,
    m.source_title_zh_hans,
    m.locator,
    m.original_text,
    m.simplified_text
  from public.match_classic_passage(
    case
      when octet_length(coalesce(p_context, '{}'::jsonb)::text) <= 4096
        then coalesce(p_context, '{}'::jsonb) - 'stable_key'
      else '{}'::jsonb
    end,
    1
  ) m
  limit 1;
$function$;
CREATE OR REPLACE FUNCTION public.increment_life_view_article_view(p_article_id text)
 RETURNS bigint
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
declare
  v_count bigint;
begin
  insert into public.life_view_article_views(article_id, view_count, updated_at)
  values (p_article_id, 1, now())
  on conflict (article_id)
  do update set view_count = life_view_article_views.view_count + 1,
                updated_at = now()
  returning view_count into v_count;
  return v_count;
end;
$function$;
CREATE OR REPLACE FUNCTION public.select_classic_passage_for_report(p_report_id uuid, p_context jsonb, p_slot text DEFAULT 'free_summary'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  cached jsonb;
  chosen record;
  match_id uuid;
begin
  select jsonb_build_object(
    'match_id', m.id,
    'report_id', m.report_id,
    'slot', m.slot,
    'passage_id', p.id,
    'passage_key', p.passage_key,
    'source_slug', s.slug,
    'source_title_zh_hant', s.title_zh_hant,
    'source_title_zh_hans', s.title_zh_hans,
    'locator', p.locator,
    'original_text', p.original_text,
    'simplified_text', p.simplified_text,
    'score', m.score,
    'match_reason', m.match_reason,
    'engine_version', m.engine_version
  )
  into cached
  from public.classic_passage_matches m
  join public.classic_passages p on p.id = m.passage_id
  join public.classic_sources s on s.id = p.source_id
  where m.report_id = p_report_id and m.slot = p_slot
  limit 1;

  if cached is not null then
    return cached;
  end if;

  select * into chosen
  from public.match_classic_passage(
    coalesce(p_context, '{}'::jsonb) || jsonb_build_object('stable_key', p_report_id::text || ':' || p_slot),
    1
  )
  limit 1;

  if not found then
    return null;
  end if;

  insert into public.classic_passage_matches (
    report_id,
    slot,
    passage_id,
    score,
    match_context,
    match_reason
  ) values (
    p_report_id,
    p_slot,
    chosen.passage_id,
    chosen.score,
    coalesce(p_context, '{}'::jsonb),
    chosen.match_reason
  )
  on conflict (report_id, slot) do nothing
  returning id into match_id;

  if match_id is null then
    return public.select_classic_passage_for_report(p_report_id, p_context, p_slot);
  end if;

  return jsonb_build_object(
    'match_id', match_id,
    'report_id', p_report_id,
    'slot', p_slot,
    'passage_id', chosen.passage_id,
    'passage_key', chosen.passage_key,
    'source_slug', chosen.source_slug,
    'source_title_zh_hant', chosen.source_title_zh_hant,
    'source_title_zh_hans', chosen.source_title_zh_hans,
    'locator', chosen.locator,
    'original_text', chosen.original_text,
    'simplified_text', chosen.simplified_text,
    'score', chosen.score,
    'match_reason', chosen.match_reason,
    'engine_version', 'classic-match-v1'
  );
end;
$function$;
CREATE OR REPLACE FUNCTION public.zhaowu_consume_usage(kind text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare
  uid uuid := auth.uid();
  usage_day date := (now() at time zone 'Australia/Sydney')::date;
  q_count integer;
  r_count integer;
begin
  if uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if kind not in ('question','report') then
    raise exception 'INVALID_USAGE_KIND';
  end if;

  insert into public.daily_usage (user_id, usage_date, question_count, report_count)
  values (uid, usage_day, 0, 0)
  on conflict (user_id, usage_date) where user_id is not null do nothing;

  select question_count, report_count
    into q_count, r_count
  from public.daily_usage
  where user_id = uid and usage_date = usage_day
  for update;

  if kind = 'question' then
    if q_count >= 2 then raise exception 'QUESTION_LIMIT'; end if;
    update public.daily_usage
      set question_count = question_count + 1
      where user_id = uid and usage_date = usage_day
      returning question_count, report_count into q_count, r_count;
  else
    if r_count >= 1 then raise exception 'REPORT_LIMIT'; end if;
    update public.daily_usage
      set report_count = report_count + 1
      where user_id = uid and usage_date = usage_day
      returning question_count, report_count into q_count, r_count;
  end if;

  return jsonb_build_object(
    'usageDate', usage_day,
    'questionCount', q_count,
    'reportCount', r_count,
    'questionRemaining', greatest(0, 2 - q_count),
    'reportRemaining', greatest(0, 1 - r_count)
  );
end;
$function$;
CREATE OR REPLACE FUNCTION public.zhaowu_handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  normalized_email text := lower(coalesce(new.email, ''));
  owner_row public.owner_email_aliases%rowtype;
  owner_flag boolean := false;
begin
  select * into owner_row
  from public.owner_email_aliases
  where active = true and lower(email) = normalized_email
  limit 1;
  owner_flag := found;

  insert into public.profiles (id, email, display_name, is_owner, owner_archive_id)
  values (
    new.id,
    normalized_email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    owner_flag,
    case when owner_flag then owner_row.owner_archive_id else null end
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = case when excluded.display_name <> '' then excluded.display_name else public.profiles.display_name end,
    is_owner = excluded.is_owner,
    owner_archive_id = excluded.owner_archive_id,
    updated_at = now();
  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.zhaowu_record_visit(p_visitor_key text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  if p_visitor_key is null or length(trim(p_visitor_key)) < 8 or length(p_visitor_key) > 128 then
    return;
  end if;

  begin
    insert into public.site_visits (visitor_key) values (p_visitor_key);
  exception
    when unique_violation then
      null;
  end;
end;
$function$;
CREATE OR REPLACE FUNCTION public.zhaowu_report_owner_archive()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  owner_row public.owner_email_aliases%rowtype;
  account_email text;
begin
  if new.user_id is not null then
    select lower(email) into account_email from auth.users where id = new.user_id;
    select * into owner_row
    from public.owner_email_aliases
    where active = true and lower(email) = account_email
    limit 1;

    if found then
      new.owner_archive_id := owner_row.owner_archive_id;
      if new.user_email is null then new.user_email := account_email; end if;
    end if;
  end if;
  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.zhaowu_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.zhaowu_update_visit_counter()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  total_count bigint;
  today_count bigint;
begin
  select count(*) into total_count from public.site_visits;
  select count(*) into today_count from public.site_visits where visited_on = current_date;

  insert into public.site_settings (key, value, public_read, updated_at)
  values (
    'visitor_count',
    jsonb_build_object('total', total_count, 'today', today_count),
    true,
    now()
  )
  on conflict (key) do update
  set value = excluded.value,
      public_read = true,
      updated_at = now();

  return new;
end;
$function$;

-- Custom public triggers only; auth/storage platform triggers deliberately omitted.

DROP TRIGGER IF EXISTS background_assets_set_updated_at ON public.background_assets;
CREATE TRIGGER background_assets_set_updated_at BEFORE UPDATE ON background_assets FOR EACH ROW EXECUTE FUNCTION zhaowu_set_updated_at();
DROP TRIGGER IF EXISTS daily_usage_set_updated_at ON public.daily_usage;
CREATE TRIGGER daily_usage_set_updated_at BEFORE UPDATE ON daily_usage FOR EACH ROW EXECUTE FUNCTION zhaowu_set_updated_at();
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION zhaowu_set_updated_at();
DROP TRIGGER IF EXISTS release_history_set_updated_at ON public.release_history;
CREATE TRIGGER release_history_set_updated_at BEFORE UPDATE ON release_history FOR EACH ROW EXECUTE FUNCTION zhaowu_set_updated_at();
DROP TRIGGER IF EXISTS report_requests_owner_archive_trigger ON public.report_requests;
CREATE TRIGGER report_requests_owner_archive_trigger BEFORE INSERT OR UPDATE OF user_id, user_email ON report_requests FOR EACH ROW EXECUTE FUNCTION zhaowu_report_owner_archive();
DROP TRIGGER IF EXISTS report_requests_set_updated_at ON public.report_requests;
CREATE TRIGGER report_requests_set_updated_at BEFORE UPDATE ON report_requests FOR EACH ROW EXECUTE FUNCTION zhaowu_set_updated_at();
DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION zhaowu_set_updated_at();
DROP TRIGGER IF EXISTS site_visits_update_counter ON public.site_visits;
CREATE TRIGGER site_visits_update_counter AFTER INSERT ON site_visits FOR EACH ROW EXECUTE FUNCTION zhaowu_update_visit_counter();

-- RLS and policies; later-created tables keep their own policies.

ALTER TABLE "public"."background_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."background_music_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classic_passage_matches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classic_passages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."classic_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."daily_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gallery_analysis_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gallery_asset_knowledge" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gallery_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."life_view_article_views" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."owner_email_aliases" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."owner_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."promo_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."promo_redemptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."release_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."report_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."site_visits" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "background_assets_owner_delete" ON "public"."background_assets";
CREATE POLICY "background_assets_owner_delete" ON "public"."background_assets" AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "background_assets_owner_insert" ON "public"."background_assets";
CREATE POLICY "background_assets_owner_insert" ON "public"."background_assets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "background_assets_owner_read" ON "public"."background_assets";
CREATE POLICY "background_assets_owner_read" ON "public"."background_assets" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (enabled = true)));
DROP POLICY IF EXISTS "background_assets_owner_update" ON "public"."background_assets";
CREATE POLICY "background_assets_owner_update" ON "public"."background_assets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "background_assets_public_read" ON "public"."background_assets";
CREATE POLICY "background_assets_public_read" ON "public"."background_assets" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((enabled = true));
DROP POLICY IF EXISTS "background_music_owner_delete" ON "public"."background_music_assets";
CREATE POLICY "background_music_owner_delete" ON "public"."background_music_assets" AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "background_music_owner_insert" ON "public"."background_music_assets";
CREATE POLICY "background_music_owner_insert" ON "public"."background_music_assets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "background_music_owner_read" ON "public"."background_music_assets";
CREATE POLICY "background_music_owner_read" ON "public"."background_music_assets" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (enabled = true)));
DROP POLICY IF EXISTS "background_music_owner_update" ON "public"."background_music_assets";
CREATE POLICY "background_music_owner_update" ON "public"."background_music_assets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "background_music_public_read" ON "public"."background_music_assets";
CREATE POLICY "background_music_public_read" ON "public"."background_music_assets" AS PERMISSIVE FOR SELECT TO "anon" USING ((enabled = true));
DROP POLICY IF EXISTS "daily_usage_insert_own" ON "public"."daily_usage";
CREATE POLICY "daily_usage_insert_own" ON "public"."daily_usage" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
DROP POLICY IF EXISTS "daily_usage_select_own" ON "public"."daily_usage";
CREATE POLICY "daily_usage_select_own" ON "public"."daily_usage" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((user_id = ( SELECT auth.uid() AS uid)));
DROP POLICY IF EXISTS "daily_usage_update_own" ON "public"."daily_usage";
CREATE POLICY "daily_usage_update_own" ON "public"."daily_usage" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));
DROP POLICY IF EXISTS "gallery_analysis_runs_owner_read" ON "public"."gallery_analysis_runs";
CREATE POLICY "gallery_analysis_runs_owner_read" ON "public"."gallery_analysis_runs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "gallery_asset_knowledge_owner_read" ON "public"."gallery_asset_knowledge";
CREATE POLICY "gallery_asset_knowledge_owner_read" ON "public"."gallery_asset_knowledge" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR ((analysis_status = 'approved'::text) AND (client_eligible = true))));
DROP POLICY IF EXISTS "gallery_asset_knowledge_owner_update" ON "public"."gallery_asset_knowledge";
CREATE POLICY "gallery_asset_knowledge_owner_update" ON "public"."gallery_asset_knowledge" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "gallery_asset_knowledge_public_read" ON "public"."gallery_asset_knowledge";
CREATE POLICY "gallery_asset_knowledge_public_read" ON "public"."gallery_asset_knowledge" AS PERMISSIVE FOR SELECT TO "anon" USING (((analysis_status = 'approved'::text) AND (client_eligible = true)));
DROP POLICY IF EXISTS "gallery_assets_owner_delete" ON "public"."gallery_assets";
CREATE POLICY "gallery_assets_owner_delete" ON "public"."gallery_assets" AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "gallery_assets_owner_insert" ON "public"."gallery_assets";
CREATE POLICY "gallery_assets_owner_insert" ON "public"."gallery_assets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "gallery_assets_owner_read" ON "public"."gallery_assets";
CREATE POLICY "gallery_assets_owner_read" ON "public"."gallery_assets" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (enabled = true)));
DROP POLICY IF EXISTS "gallery_assets_owner_update" ON "public"."gallery_assets";
CREATE POLICY "gallery_assets_owner_update" ON "public"."gallery_assets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "gallery_assets_public_read" ON "public"."gallery_assets";
CREATE POLICY "gallery_assets_public_read" ON "public"."gallery_assets" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((enabled = true));
DROP POLICY IF EXISTS "life_view_counts_insert" ON "public"."life_view_article_views";
CREATE POLICY "life_view_counts_insert" ON "public"."life_view_article_views" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK ((view_count >= 0));
DROP POLICY IF EXISTS "life_view_counts_read" ON "public"."life_view_article_views";
CREATE POLICY "life_view_counts_read" ON "public"."life_view_article_views" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);
DROP POLICY IF EXISTS "life_view_counts_update" ON "public"."life_view_article_views";
CREATE POLICY "life_view_counts_update" ON "public"."life_view_article_views" AS PERMISSIVE FOR UPDATE TO "anon", "authenticated" USING (true) WITH CHECK ((view_count >= 0));
DROP POLICY IF EXISTS "owner_email_aliases_owner_read" ON "public"."owner_email_aliases";
CREATE POLICY "owner_email_aliases_owner_read" ON "public"."owner_email_aliases" AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "owner_sessions_owner_delete" ON "public"."owner_sessions";
CREATE POLICY "owner_sessions_owner_delete" ON "public"."owner_sessions" AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "owner_sessions_owner_insert" ON "public"."owner_sessions";
CREATE POLICY "owner_sessions_owner_insert" ON "public"."owner_sessions" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "owner_sessions_owner_read" ON "public"."owner_sessions";
CREATE POLICY "owner_sessions_owner_read" ON "public"."owner_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "owner_sessions_owner_update" ON "public"."owner_sessions";
CREATE POLICY "owner_sessions_owner_update" ON "public"."owner_sessions" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "profiles_select_self" ON "public"."profiles";
CREATE POLICY "profiles_select_self" ON "public"."profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((id = ( SELECT auth.uid() AS uid)));
DROP POLICY IF EXISTS "profiles_update_self" ON "public"."profiles";
CREATE POLICY "profiles_update_self" ON "public"."profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((id = ( SELECT auth.uid() AS uid))) WITH CHECK ((id = ( SELECT auth.uid() AS uid)));
DROP POLICY IF EXISTS "release_history_public_read" ON "public"."release_history";
CREATE POLICY "release_history_public_read" ON "public"."release_history" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);
DROP POLICY IF EXISTS "report_requests_delete_owner" ON "public"."report_requests";
CREATE POLICY "report_requests_delete_owner" ON "public"."report_requests" AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "report_requests_insert_access" ON "public"."report_requests";
CREATE POLICY "report_requests_insert_access" ON "public"."report_requests" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "report_requests_select_access" ON "public"."report_requests";
CREATE POLICY "report_requests_select_access" ON "public"."report_requests" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "report_requests_update_access" ON "public"."report_requests";
CREATE POLICY "report_requests_update_access" ON "public"."report_requests" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner())) WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) OR private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "site_settings_owner_delete" ON "public"."site_settings";
CREATE POLICY "site_settings_owner_delete" ON "public"."site_settings" AS PERMISSIVE FOR DELETE TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "site_settings_owner_insert" ON "public"."site_settings";
CREATE POLICY "site_settings_owner_insert" ON "public"."site_settings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "site_settings_owner_read" ON "public"."site_settings";
CREATE POLICY "site_settings_owner_read" ON "public"."site_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((private.zhaowu_is_owner() OR (public_read = true)));
DROP POLICY IF EXISTS "site_settings_owner_update" ON "public"."site_settings";
CREATE POLICY "site_settings_owner_update" ON "public"."site_settings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (private.zhaowu_is_owner()) WITH CHECK (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "site_settings_public_read" ON "public"."site_settings";
CREATE POLICY "site_settings_public_read" ON "public"."site_settings" AS PERMISSIVE FOR SELECT TO "anon" USING ((public_read = true));
DROP POLICY IF EXISTS "site_visits_insert_public" ON "public"."site_visits";
CREATE POLICY "site_visits_insert_public" ON "public"."site_visits" AS PERMISSIVE FOR INSERT TO "anon", "authenticated" WITH CHECK (true);
DROP POLICY IF EXISTS "site_visits_owner_read" ON "public"."site_visits";
CREATE POLICY "site_visits_owner_read" ON "public"."site_visits" AS PERMISSIVE FOR SELECT TO "authenticated" USING (private.zhaowu_is_owner());
DROP POLICY IF EXISTS "public_read_backgrounds" ON "storage"."objects";
CREATE POLICY "public_read_backgrounds" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((bucket_id = 'backgrounds'::text));
DROP POLICY IF EXISTS "public_read_media" ON "storage"."objects";
CREATE POLICY "public_read_media" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((bucket_id = 'media'::text));
DROP POLICY IF EXISTS "public_read_zhaowu_gallery" ON "storage"."objects";
CREATE POLICY "public_read_zhaowu_gallery" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((bucket_id = 'zhaowu-gallery'::text));
DROP POLICY IF EXISTS "zhaowu_audio_owner_delete" ON "storage"."objects";
CREATE POLICY "zhaowu_audio_owner_delete" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((bucket_id = 'zhaowu-audio'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_audio_owner_insert" ON "storage"."objects";
CREATE POLICY "zhaowu_audio_owner_insert" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((bucket_id = 'zhaowu-audio'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_audio_owner_update" ON "storage"."objects";
CREATE POLICY "zhaowu_audio_owner_update" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((bucket_id = 'zhaowu-audio'::text) AND private.zhaowu_is_owner())) WITH CHECK (((bucket_id = 'zhaowu-audio'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_backgrounds_owner_delete" ON "storage"."objects";
CREATE POLICY "zhaowu_backgrounds_owner_delete" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((bucket_id = 'zhaowu-backgrounds'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_backgrounds_owner_insert" ON "storage"."objects";
CREATE POLICY "zhaowu_backgrounds_owner_insert" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((bucket_id = 'zhaowu-backgrounds'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_backgrounds_owner_update" ON "storage"."objects";
CREATE POLICY "zhaowu_backgrounds_owner_update" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((bucket_id = 'zhaowu-backgrounds'::text) AND private.zhaowu_is_owner())) WITH CHECK (((bucket_id = 'zhaowu-backgrounds'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_backgrounds_public_read" ON "storage"."objects";
CREATE POLICY "zhaowu_backgrounds_public_read" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((bucket_id = 'zhaowu-backgrounds'::text));
DROP POLICY IF EXISTS "zhaowu_gallery_owner_delete" ON "storage"."objects";
CREATE POLICY "zhaowu_gallery_owner_delete" ON "storage"."objects" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((bucket_id = 'zhaowu-gallery'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_gallery_owner_insert" ON "storage"."objects";
CREATE POLICY "zhaowu_gallery_owner_insert" ON "storage"."objects" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((bucket_id = 'zhaowu-gallery'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_gallery_owner_update" ON "storage"."objects";
CREATE POLICY "zhaowu_gallery_owner_update" ON "storage"."objects" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (((bucket_id = 'zhaowu-gallery'::text) AND private.zhaowu_is_owner())) WITH CHECK (((bucket_id = 'zhaowu-gallery'::text) AND private.zhaowu_is_owner()));
DROP POLICY IF EXISTS "zhaowu_gallery_public_read" ON "storage"."objects";
CREATE POLICY "zhaowu_gallery_public_read" ON "storage"."objects" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING ((bucket_id = 'zhaowu-gallery'::text));

-- Catalog table grants only; do not replace Supabase system-table privileges.

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_assets" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_assets" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_assets" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_assets" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_music_assets" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_music_assets" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_music_assets" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."background_music_assets" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."classic_passage_matches" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."classic_passage_matches" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."classic_passages" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."classic_passages" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."classic_sources" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."classic_sources" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."daily_usage" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."daily_usage" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."daily_usage" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."daily_usage" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_analysis_runs" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_analysis_runs" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_analysis_runs" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_analysis_runs" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_asset_knowledge" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_asset_knowledge" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_asset_knowledge" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_asset_knowledge" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_assets" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_assets" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_assets" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."gallery_assets" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."life_view_article_views" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."life_view_article_views" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."life_view_article_views" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."life_view_article_views" TO "service_role";
GRANT SELECT ON "public"."owner_email_aliases" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."owner_email_aliases" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."owner_email_aliases" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."owner_sessions" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."owner_sessions" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."owner_sessions" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."owner_sessions" TO "service_role";
GRANT REFERENCES, SELECT, TRIGGER ON "public"."profiles" TO "anon";
GRANT REFERENCES, SELECT, TRIGGER ON "public"."profiles" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."profiles" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."profiles" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."promo_codes" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."promo_codes" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."promo_redemptions" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."promo_redemptions" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."release_history" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."release_history" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."release_history" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."release_history" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."report_requests" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."report_requests" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."report_requests" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."report_requests" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_settings" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_settings" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_settings" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_settings" TO "service_role";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_visits" TO "anon";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_visits" TO "authenticated";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_visits" TO "postgres";
GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON "public"."site_visits" TO "service_role";

-- Required by the owner predicate used in public/storage RLS.
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.zhaowu_is_owner() TO anon, authenticated, service_role;
-- A reconstructed catalog dump has no function ACLs. Fail closed for backend-only
-- SECURITY DEFINER RPCs rather than inheriting PostgreSQL's PUBLIC EXECUTE default.
REVOKE ALL ON FUNCTION public.claim_promo_code_slot(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_promo_code_slot(uuid) TO service_role;
REVOKE ALL ON FUNCTION public.match_classic_passage(jsonb, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_classic_passage(jsonb, integer) TO service_role;
REVOKE ALL ON FUNCTION public.select_classic_passage_for_report(uuid, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.select_classic_passage_for_report(uuid, jsonb, text) TO service_role;
-- get_customer_classic_passage is restricted by its existing later migration.
-- Identity sequence privilege is separate from table INSERT privilege.
GRANT USAGE, SELECT ON SEQUENCE public.site_visits_id_seq TO anon, authenticated, service_role;
