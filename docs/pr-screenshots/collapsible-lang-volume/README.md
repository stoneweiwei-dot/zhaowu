# Collapsible language switcher and in-panel volume

Local production-build preview only (`vite preview` on 127.0.0.1). Not the live site, and not a Vercel deployment.

The checks in `scripts/collapsible-lang-volume-preview.mjs` confirm:

- The homepage control is `position: fixed` in the top-right safe area at 320px and 390px.
- Collapsed state shows the globe and the current short name (繁體, then English after a choice).
- Opening it shows all nine languages, each at least 44px, with Bahasa Indonesia wider than a single column and fully on screen.
- Choosing a language, or tapping outside, collapses the list.
- After scrolling the homepage shell so the fourth block is in view, the collapsed control stays in the top safe area.
- Mute, the volume label, and the slider are hidden until Music is opened, then they sit inside the Music panel on the homepage and on the five-elements article.

| File | What it shows |
| --- | --- |
| `home-320-collapsed.jpg` | Homepage, 320px, collapsed 繁體 control |
| `home-390-collapsed.jpg` | Homepage, 390px, collapsed 繁體 control |
| `home-320-expanded.jpg` | Homepage, 320px, nine-language list |
| `home-390-expanded.jpg` | Homepage, 390px, nine-language list |
| `home-320-after-select.jpg` | Homepage, 320px, collapsed after choosing English |
| `home-390-after-select.jpg` | Homepage, 390px, collapsed after choosing English |
| `home-320-scrolled-blocks.jpg` | Homepage, 320px, four blocks scrolled, control still visible |
| `home-390-scrolled-blocks.jpg` | Homepage, 390px, four blocks scrolled, control still visible |
| `home-320-music-closed.jpg` | Homepage, volume controls not on screen |
| `home-390-music-closed.jpg` | Homepage, volume controls not on screen |
| `home-320-music-open.jpg` | Homepage, mute and slider inside the Music panel |
| `home-390-music-open.jpg` | Homepage, mute and slider inside the Music panel |
| `about-390-collapsed.jpg` | Inner page, collapsed control |
| `about-390-expanded.jpg` | Inner page, expanded nine-language list |
| `article-390-music-closed.jpg` | Article body with no floating mute/slider |
| `article-390-music-open.jpg` | Article, mute and slider inside the Music panel |
