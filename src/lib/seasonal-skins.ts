/** Display schedule only. Never used by the calendar or chart engine.
 * Dates follow the owner-approved 2026 pack; 00:01 Sydney is NOT the astronomical term instant.
 * Add a future term only after its real artwork and theme have passed acceptance.
 */
export const SEASONAL_AUTO_ID = 'solar-auto';
export const FROST_SKIN_ID = 'solar-frost-descent';
type L3 = { 'zh-Hant': string; 'zh-Hans': string; en: string };
const l3 = (hant: string, hans: string, en: string): L3 => ({ 'zh-Hant': hant, 'zh-Hans': hans, en });
const base = '/theme-skins/solar-frost-descent/';
export const FROST_PHASES = [
  { start: '2026-10-23T00:01:00+11:00', art: `${base}hero-frost-descent.webp`, name: l3('豺乃祭獸', '豺乃祭兽', 'Jackals Present Their Prey'), quote: l3('知進是勇，知止亦是智慧。', '知进是勇，知止亦是智慧。', 'Knowing when to advance takes courage; knowing when to stop takes wisdom.') },
  { start: '2026-10-28T00:01:00+11:00', art: `${base}option-falling-leaves.webp`, name: l3('草木黃落', '草木黄落', 'Leaves and Grasses Turn Yellow'), quote: l3('葉落不為失去，是把生長交還土地。', '叶落不为失去，是把生长交还土地。', 'A falling leaf is not a loss; it returns growth to the earth.') },
  { start: '2026-11-02T00:01:00+11:00', art: `${base}option-still-valley.webp`, name: l3('蟄蟲咸俯', '蛰虫咸俯', 'Hibernating Creatures Settle Down'), quote: l3('懂得收斂的人，才守得住下一次生發。', '懂得收敛的人，才守得住下一次生发。', 'Those who know when to withdraw can protect their next beginning.') },
] as const;
export const FROST_END = '2026-11-07T00:01:00+11:00';
export const FROST_SECTIONS = ['today-guide', 'deep-reading', 'report-cover', 'login-wash', 'account-wash', 'spirit-slip', 'loading-state', 'empty-state'] as const;
export function seasonalSkinId(now = new Date()): string {
  // No fabricated future pack: retain the last published, verified skin until its replacement exists.
  return now.getTime() >= Date.parse(FROST_PHASES[0].start) ? FROST_SKIN_ID : 'song-gallery-frostleaf';
}
export function frostEdition(now = new Date()) {
  const phase = [...FROST_PHASES].reverse().find(p => now.getTime() >= Date.parse(p.start)) ?? FROST_PHASES[0];
  return { ...phase, current: now.getTime() >= Date.parse(FROST_PHASES[0].start) && now.getTime() < Date.parse(FROST_END) };
}
