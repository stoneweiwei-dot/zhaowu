# Owner auth hardening: staged rotation

Status: prepared, not deployed. Base runtime: 35baa8d4bf0a636f4c83f24db059f9e1da5383b8.

The patch removes committed owner email/password hash defaults from the Node login, shared session helper, TypeScript server helper, and three independent Edge auth helpers. It rejects password-as-cookie authentication, refuses to issue an unencrypted session, and preserves the recovered owner secret for existing backend consumers. Valid sealed v1 sessions remain subject to the runtime verifier; changing that verifier revokes sessions containing the old secret.

## Required secure configuration before release

- Vercel Production: ZHAOWU_OWNER_ACCOUNT_SHA256 and ZHAOWU_OWNER_KEY_SHA256, each an exact SHA-256 hex digest supplied through server-only environment configuration. Keep the existing ZHAOWU_OWNER_BRIDGE_SECRET and verify it is configured on both platforms with at least 32 characters. No VITE_ prefix, credentials in PRs, or plaintext passwords in chat.
- Supabase project plgpxusmemnmzckbwtiv: set ZHAOWU_OWNER_KEY_SHA256 to the same new password digest before deploying the three owner Edge functions. Existing owner-data/promo/articles helpers intentionally remain independent.
- Generate the new high-entropy password with a password manager and retain it there. Do not reuse any credential previously disclosed in chat, source or logs.
- MUSIC / SKIN RELEASE BLOCKER: lib/owner-music-git.js decrypts lib/owner-music-ssh.json using the owner password. Rotating the password alone breaks owner music and shared-skin writes. The committed password-encrypted SSH blob also remains an offline password-checking oracle. Securely rotate the underlying SSH credential, move its material to server configuration, and retire the publicly exposed encrypted copy before declaring the incident closed. Do not decrypt or print its contents as part of a QA run.
- Supabase secret-setting is not exposed by the currently available connector. An authorized administrator must enter the value securely using the platform dashboard/CLI. Do not substitute SQL or public tables for secret management.

## Release sequence

1. Complete the music/skin credential migration and secure runtime configuration; inspect active task locks again.
2. Verify synthetic login/cookie/Edge tests and the full repository type/build checks. This focused snapshot cannot establish a complete application build.
3. Deploy the three Edge functions with unchanged authorization requirements, then merge the vetted batch to main for one Vercel Production deployment. Do not create previews.
4. Verify legitimate owner login, rejected old credentials/sessions, report/gallery/promo/articles access, music/skin write and Threads proof recovery using secure credential handling. Never claim a local test proves Production.

## Current verification

Focused tests use only synthetic credentials. The original plaintext-cookie trigger is rejected; valid sealed sessions round-trip; missing/malformed runtime credentials fail closed; wrong pairs never receive a cookie; password-digest rotation revokes old sealed sessions. No real credential was tested or rotated, no customer data changed, and no deployment performed.

Independent candidate review found no surviving plaintext-cookie path in the selected code. The pre-existing Edge behavior that omits bridge-secret enforcement when its configured value is short/missing remains unchanged and is a rollout configuration risk. The nearest bridge-forwarding test was updated to synthetic sealed-cookie authentication. Latest focused result: 33 passed, 0 failed, 1 real-credential test skipped.
