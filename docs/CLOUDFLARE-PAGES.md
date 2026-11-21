# Cloudflare Pages deployment notes

GitHub Actions builds the app and uploads the prebuilt `dist/` directly to the separate `zhaowu-prod` Pages project. This avoids consuming the Git-integrated `zhaowu` project's 500 monthly Git-build allowance. Preview builds remain disabled on `zhaowu`; production Git builds there stay enabled until the owner approves the cutover.

## Runtime bindings to configure after the project cutover

Add runtime secrets/variables in the `zhaowu-prod` Pages project (or Wrangler secrets) before relying on the owner and Mingshu API routes:

- `ZHAOWU_OWNER_ACCOUNT_SHA256`
- `ZHAOWU_OWNER_BRIDGE_SECRET`
- `MINGSHU_API_ORIGIN`
- `CRON_SECRET` only if a mapped handler requires it
- Any additional non-public `process.env` names discovered in `api/` and its imported `lib/` modules during deployment validation

Do not add Stripe secrets, Supabase service-role/secret keys, database credentials, Meta/Threads secrets, or cron secrets to client build variables. Checkout and webhook continue to run as Supabase Edge Functions. Set the Supabase Edge Function `PUBLIC_SITE_ORIGINS` to include `https://zhao-wu.com` if needed; the Stripe checkout function already explicitly allows that origin. `www.zhao-wu.com` is not in that function's explicit allowlist; add it only if the www host is made a supported origin.

The Pages Functions reuse Vercel handlers with Workers Node compatibility. Validate the runtime bindings and Node API compatibility on `zhaowu-prod` preview before attaching either custom domain. Host-based redirects from the legacy Vercel alias remain Vercel-only. Pages does not need them to serve `zhao-wu.com`.
