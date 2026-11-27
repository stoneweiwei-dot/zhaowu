\set ON_ERROR_STOP on
BEGIN;
INSERT INTO auth.users(id, email)
VALUES ('00000000-0000-4000-8000-000000000001', 'smoke@example.invalid');
INSERT INTO public.release_history(version) VALUES ('migration-smoke');
INSERT INTO public.site_settings(key, public_read)
VALUES ('smoke-public', true), ('smoke-private', false);
INSERT INTO public.gallery_assets(category, asset_key, storage_path, enabled)
VALUES ('smoke', 'smoke-visible', 'smoke/visible', true),
       ('smoke', 'smoke-hidden', 'smoke/hidden', false);

SET LOCAL ROLE anon;
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM public.release_history WHERE version = 'migration-smoke')
     OR NOT EXISTS (SELECT FROM public.site_settings WHERE key = 'smoke-public')
     OR EXISTS (SELECT FROM public.site_settings WHERE key = 'smoke-private')
     OR NOT EXISTS (SELECT FROM public.gallery_assets WHERE asset_key = 'smoke-visible')
     OR EXISTS (SELECT FROM public.gallery_assets WHERE asset_key = 'smoke-hidden') THEN
    RAISE EXCEPTION 'unexpected public visibility';
  END IF;
  RAISE NOTICE 'PASS anon public reads';
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'FAIL anon public reads: %', SQLERRM;
END $$;

DO $$
BEGIN
  INSERT INTO public.site_visits(visitor_key) VALUES ('migration-smoke');
  RAISE NOTICE 'PASS anon visit insert';
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'FAIL anon visit insert: %', SQLERRM;
END $$;

DO $$
DECLARE
  relation text;
BEGIN
  FOREACH relation IN ARRAY ARRAY['background_assets','background_music_assets','daily_usage',
    'gallery_analysis_runs','gallery_asset_knowledge','gallery_assets','owner_sessions',
    'release_history','report_requests','site_settings','site_visits'] LOOP
    BEGIN
      EXECUTE format('TRUNCATE public.%I', relation);
      RAISE EXCEPTION 'unexpected success';
    EXCEPTION
      WHEN insufficient_privilege THEN RAISE NOTICE 'PASS anon TRUNCATE denied on %', relation;
      WHEN OTHERS THEN RAISE EXCEPTION 'FAIL anon TRUNCATE on %: %', relation, SQLERRM;
    END;
  END LOOP;
END $$;

DO $$
BEGIN
  INSERT INTO public.owner_email_aliases(email) VALUES ('owner@example.invalid');
  RAISE EXCEPTION 'unexpected success';
EXCEPTION
  WHEN insufficient_privilege THEN RAISE NOTICE 'PASS anon owner write denied';
  WHEN OTHERS THEN RAISE EXCEPTION 'FAIL anon owner write: %', SQLERRM;
END $$;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
DO $$
BEGIN
  INSERT INTO public.daily_usage(user_id, usage_date) VALUES (auth.uid(), current_date);
  RAISE NOTICE 'PASS authenticated daily_usage insert';
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'FAIL authenticated daily_usage insert: %', SQLERRM;
END $$;
DO $$
BEGIN
  INSERT INTO public.report_requests(user_id) VALUES (auth.uid());
  RAISE NOTICE 'PASS authenticated report_requests insert';
EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'FAIL authenticated report_requests insert: %', SQLERRM;
END $$;
ROLLBACK;
