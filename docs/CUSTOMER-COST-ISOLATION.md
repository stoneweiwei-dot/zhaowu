# Customer Cost & Secret Isolation Policy

Status: security invariant for Zhaowu customer-facing production.

## Non-owner rule

A non-owner visitor or member must never receive, read, derive, or cause use of an owner private API credential. This includes OpenAI/model keys, Supabase service-role credentials, paid translation/provider keys, deployment tokens, storage administration tokens, and future private vendor credentials.

Customer-facing behavior must use this priority:

1. deterministic/local browser or bundled rule engine when possible;
2. public/publishable client credentials only where the provider explicitly designs them for browser use, protected by JWT/RLS and least privilege;
3. a customer-owned credential (BYOK) for any future customer feature that truly requires a metered third-party AI/provider call;
4. otherwise disable/degrade the feature locally. Never fall back to an owner-funded private key.

## Current locked behavior

- BaZi analysis, follow-up analysis and full report composition remain deterministic rule-engine paths.
- Japanese/Korean presentation remains static/local and must not invoke runtime translation models.
- Site Guide is local-only. Its compatibility Edge Function is provider-free.
- Personal decree images use the existing Gallery-direct path for customers. The optional OpenAI image-edit path is server-gated to a verified `profiles.is_owner=true` actor. Supplying `force=true` as a customer cannot unlock the provider path.
- Owner/internal AI maintenance functions must be authenticated and owner-authorized; possession of a public publishable key is never sufficient.

## Credential boundary

`VITE_SUPABASE_PUBLISHABLE_KEY` / the Supabase publishable browser key is intentionally public and is not a service-role secret. Security for browser database access must come from Auth + RLS. `SUPABASE_SERVICE_ROLE_KEY` and all provider API keys are server-only and must never appear in `src/`, built browser assets, URL parameters, responses, logs exposed to customers, or localStorage.

## Billing boundary

A visitor's own mobile/Wi-Fi data transfer is naturally carried by that visitor's network connection. Zhaowu's shared Vercel/Supabase hosting, database, storage and egress remain infrastructure owned by the Zhaowu project, so those cloud-provider charges cannot literally be posted to each visitor's personal cloud account without a separate bring-your-own-hosting/database architecture.

This policy therefore guarantees the actionable boundary: non-owner users cannot spend owner AI/provider tokens or receive owner private credentials. Shared infrastructure abuse must be controlled with authentication, RLS, rate limits, quotas and owner-only administration endpoints.

## Release gate

`scripts/customer-cost-isolation.test.mjs` is part of the deployment test suite. A release must fail if browser code references private provider/service-role credentials, if Site Guide regains a remote owner-funded model fallback, or if the decree-image provider path loses its verified-owner gate.
