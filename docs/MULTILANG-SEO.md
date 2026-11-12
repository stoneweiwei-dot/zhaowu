# Ten-language URL SEO — staged PR, not Production

Default `zh-Hant` remains `/about`; the other URL prefixes are `/zh-hans`, `/en`, `/ja`, `/ko`, `/hi`, `/th`, `/id`, `/vi`, `/fil`. Tags use BCP 47 (`zh-Hans`, not `zh-hans`). The URL controls display language, even with an old stored preference or an English browser. There is no language redirect or first-visit prompt.

`scripts/build-route-html.mjs` writes all 33 metadata routes in all ten languages (330 documents, including homepages). Each document contains its own title, description, html language, canonical and eleven alternate links before JavaScript executes. Canonicals and alternates deliberately use `https://zhao-wu.com`, including on Preview. Existing rich default homepage and three-language true-solar-time content remain. Four specified pages have localized editorial title/lead/two-paragraph summaries in `route-static-summaries.json`; these do not claim that every interactive article has a full new translation.

`route-meta.json` is the shared runtime/build metadata source. `language-routing.js` is the common URL contract. TanStack's in/out rewrite strips known prefixes before route matching and restores them for `Link` and `navigate()`. It retains the existing route tree and all calculation components. Language selection navigates the whole document using a URL object, retaining its search and hash. A bridge prefixes legacy native document anchors, including links opened in new tabs; media, API, downloads, external links and auth callbacks are outside that bridge.

Only nine exact prefixes are stripped. `/ziwei`, `/qizheng`, and every other real route remain ordinary unprefixed routes; `/xx/about` remains `/xx/about`, not `/about`. The host has neither a file nor a rewrite for `/xx/*` or `/zh-hant/*`, so those requests return a real 404. Known language prefixes rewrite to their own static index file; unknown children such as `/en/not-a-page` do not get the homepage. Restricted client-only routes keep the existing SPA bootstrap via language-scoped rewrites. Existing asset rules, redirects, headers, Git deployment policy and ignoreCommand are unchanged.

Sitemap method **B**: `public/sitemap.xml` contains all 330 URLs and reciprocal ten-language plus x-default alternates. Run `node scripts/build-sitemap.mjs` after changing public route metadata. The generator preserves existing lastmod dates. The route-presence gate normalizes only recognized prefixes and still rejects ghost routes.

Validation:

```sh
npm run check
npm run build
node --import tsx --test scripts/multilang-seo.test.mjs scripts/route-meta.test.mjs scripts/final-performance-a11y-seo.test.mjs scripts/vercel-deployment.test.mjs scripts/vercel-deployment-policy.test.mjs scripts/sample-report-page.test.mjs scripts/seo-timing-guide.test.mjs scripts/display-language-r102.test.mjs scripts/fil-autodetect.test.mjs scripts/true-solar-time-page.test.mjs scripts/empty-state-gate.test.mjs scripts/site-ten-language-guide.test.mjs scripts/customer-i18n-coverage.test.mjs scripts/fil-locale-coverage.test.mjs scripts/manifest-locale-guide.test.mjs
node scripts/serve-route-html.mjs 4174
node scripts/multilang-seo.browser.mjs http://127.0.0.1:4174
```

Preview acceptance also needs source curls: 11 hreflang lines on `/en/about`; `lang=en`; Japanese self-canonical; ten about URLs 200; localized titles/descriptions; sitemap alternates; original root routes 200; `/xx/about`, `/zh-hant/about` and `/en/not-a-page` 404; root with `Accept-Language: en` stays 200; four static summaries visible without JS in zh-Hant and English. Do not use Vite's SPA fallback to claim host 404 acceptance.

Cost/rollback: only static HTML/XML and existing build/storage resources, no new runtime request service, package or subscription. Approximate HTML increase is a few MB per deployment and no new media binaries. Use the existing host and its current allowances; missing JavaScript leaves crawlable summaries and navigable links. Revert this PR to restore the old URL policy without database or customer-data changes. Stone must approve merge and release separately. This PR does not publish or promote Production.
