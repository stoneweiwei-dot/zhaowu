create or replace function public.get_customer_classic_passage(p_context jsonb)
returns table (
  passage_key text,
  source_title_zh_hant text,
  source_title_zh_hans text,
  locator text,
  original_text text,
  simplified_text text
)
language sql
stable
security definer
set search_path = public
as $$
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
$$;

revoke all on function public.get_customer_classic_passage(jsonb) from public;
grant execute on function public.get_customer_classic_passage(jsonb) to anon, authenticated, service_role;

update public.site_settings
set value = value || jsonb_build_object(
  'runtime_status', 'active',
  'runtime_binding', 'docs/METAPHYSICS-DEFAULT-PROTOCOL-v1.0.md + src/lib/core/method.ts',
  'runtime_verified_at', now()::text
), updated_at = now()
where key = 'metaphysics_default_protocol';

update public.site_settings
set value = value || jsonb_build_object(
  'runtime_status', 'active',
  'runtime_binding', 'docs/ZIWEI-INTERPRETATION-GRAMMAR-v1.0.md + src/lib/ziwei/interpretation-grammar.ts',
  'runtime_verified_at', now()::text
), updated_at = now()
where key = 'ziwei_interpretation_grammar';

update public.site_settings
set value = (value - 'page_architecture') || jsonb_build_object(
  'version', '2.0',
  'runtime_status', 'active_normalized',
  'runtime_binding', 'src/lib/report/focused-report.ts + src/components/paid-report-pages.tsx + report visual layers',
  'report_structure_status', 'continuous_summary_body',
  'current_contract', jsonb_build_object(
    'flow', jsonb_build_array('summary', 'body'),
    'direct_answer_first', true,
    'visual_layers_after_text', true,
    'image_failure_must_not_block_text', true,
    'legacy_nine_page_architecture', false
  ),
  'visual_addons', jsonb_build_array(
    '命之書、運之書與分享卡均位於文字總體概括與身體提醒之後，不改寫文字主結論',
    '瑞獸、法器、天地與環境意象只能由已計算命局證據推導，未驗證病藥不得硬判',
    '9:16 iPhone 優先；STONE 原創水印由前端/後期疊加'
  ),
  'runtime_verified_at', now()::text
), updated_at = now()
where key = 'paid_report_style';

update public.site_settings
set value = value || jsonb_build_object(
  'runtime_status', 'background_research_only',
  'runtime_binding', 'research digest / ingestion policy; never injected directly into customer conclusions',
  'runtime_verified_at', now()::text
), updated_at = now()
where key = 'classical_bazi_research_digest';

insert into public.site_settings(key, value, public_read, updated_at)
values (
  'supabase_directive_activation',
  jsonb_build_object(
    'version', '1.0',
    'activated_at', now()::text,
    'rules', jsonb_build_object(
      'metaphysics_default_protocol', 'active_runtime',
      'ziwei_interpretation_grammar', 'active_runtime',
      'paid_report_style', 'active_normalized_to_continuous_report',
      'classical_bazi_research_digest', 'background_research_only',
      'classic_passage_library', 'active_customer_report_readonly_rpc'
    ),
    'non_directives', jsonb_build_array('migration_state', 'visitor_count'),
    'safety', jsonb_build_object(
      'unverified_owner_material_not_promoted_as_classic_quote', true,
      'superseded_nine_page_contract_not_revived', true,
      'customer_classic_rpc_returns_verified_direct_quote_only', true
    )
  ),
  false,
  now()
)
on conflict (key) do update set
  value = excluded.value,
  public_read = false,
  updated_at = excluded.updated_at;
