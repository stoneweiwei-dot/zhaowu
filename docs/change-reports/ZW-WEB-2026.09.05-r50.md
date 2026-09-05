# ZW-WEB-2026.09.05-r50

## What changed
- Homepage birth details are now the first customer task; visual order places date/time and birthplace before the question.
- The specialist directory is reduced to seven non-navigating explanatory entries: Zi Ping BaZi, Classical Indian Astrology, Western Astrology, Zi Wei Dou Shu, Seven Luminaries & Four Residuals, Past & Present, and Dharma One-Palm Classic.
- Past & Present explicitly includes D60 as an optional karmic cross-check and warns that minute-level birth-time accuracy is required because D60 divisions are extremely time-sensitive.
- Daily almanac colour follows the Five-Element quality of the day stem.
- The almanac arrow is now a login-gated personal daily slip. When a signed-in user has saved birth data, the slip combines the day element with the saved BaZi profile; otherwise it asks the user to complete birth data.
- Header brand mark and language controls are larger on mobile.

## Why
The previous flow repeated specialist entry points and made the site feel fragmented. The owner requested one birth-data hub and a cleaner explanation-only method directory, while retaining the existing calculation/report engines behind the production system.

## Affected scope
Homepage composition, homepage form presentation, daily almanac presentation and personal slip, header visual sizing, release metadata.

## Protected scope
No changes to BaZi calendar/chart calculation, Zi Wei calculation truth, Qizheng calculation, Yi Zhang Jing calculation, authentication rules, payments, Supabase schema/permissions/data, or report history.

## Rollback
Revert the r50 homepage/index, daily-almanac, r50 CSS and release metadata commits; existing specialist routes remain in the repository for compatibility and can be restored as navigation without data migration.

## Verification state
Pending CI, Vercel Production deployment and iPhone Safari verification at commit time.
