# ROOT CAUSE LOCK — 2026-08-24

This document records the systemic fixes required to stop ZHAOWU from being maintained as an endless sequence of one-off patches.

## Single sources of truth

1. **Owner authorization**: `public.owner_email_aliases` is the only source of truth. UI `profiles.is_owner` is only a read-only cache. RLS and owner-sensitive triggers must not trust a user-editable profile flag.
2. **Answer generation**: one canonical finalized reading is generated once, persisted, and reused by customer/report/admin views. No screen may silently reclassify or recalculate the same question independently.
3. **Report image generation**: one versioned image generator. Existing `image_path` may be reused only when its `imageStyleVersion` matches the current generator contract.
4. **Production**: only `stoneweiwei-dot/zhaowu` `main` -> Vercel project `stone-zhaowu-official`. Preview deployments are not production truth.
5. **Visual system**: no new ad-hoc CSS hotfix layer or random ornament scatter unless an existing active style path is first consolidated or explicitly superseded.

## Permission root fix applied in Supabase production

Migration: `unify_owner_authorization_and_backend_permissions`

It:
- derives owner authority from `owner_email_aliases` instead of hard-coded emails / mutable `profiles.is_owner`;
- makes `profiles.is_owner` and `owner_archive_id` non-user-editable;
- rewires owner RLS for reports, backgrounds, owner sessions, visit stats and storage writes to one owner check;
- adds the previously missing owner write policies for `site_settings`;
- adds owner insert/update policies for `owner_sessions`;
- changes the public visit RPC from `SECURITY DEFINER` to `SECURITY INVOKER`;
- resynchronizes both existing owner profiles from the alias table.

Validation performed:
- real owner session simulation: owner=true; all 11 reports, all 3 settings rows and all 43 background assets visible;
- non-owner simulation: owner=false; 0 reports visible; only public settings/backgrounds visible;
- Supabase security advisor no longer reports the executable SECURITY DEFINER visit-RPC warnings.

## Maintenance rule

When a new defect is found, first ask which invariant was violated. Fix that invariant and add a regression test. Do not add another parallel answer path, auth path, permission flag, CSS override layer, deployment target or image-generation fallback just to make one screenshot pass.
