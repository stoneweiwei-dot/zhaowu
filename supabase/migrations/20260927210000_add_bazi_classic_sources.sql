-- 2026-09-27 最後一次收口 Task 3: register 4 canonical BaZi classical sources.
-- This migration adds classic_sources rows ONLY. It does not insert any
-- classic_passages rows, so the existing passage verification counts
-- (verified=38, not_applicable=15, pending=0, rejected=0) are left untouched.
--
-- Provenance rule for this batch: only a source with an independently
-- verifiable, publicly reachable edition is added. No source is force-marked
-- verified; passage-level ingestion (if it happens later) still goes through
-- the normal classic_passages verification_status workflow.
--
-- 滴天髓 and 三命通會 are registered against their bare classical text
-- (原文), not later annotated recensions. 子平真詮 has no confirmed
-- unannotated machine-readable edition at authoring time, so it is
-- registered against the National Library of China archival scan of the
-- original printed edition (影印原本), and its verification_note explicitly
-- warns that the commonly circulated 徐樂吾《子平真詮評注》 is a SEPARATE
-- 注文／後世整理 edition that must not be ingested under this source_id.

insert into public.classic_sources
  (slug, title_zh_hant, title_zh_hans, title_en, tradition, canon_code, edition_name, source_url, source_nature, verification_note, is_active)
values
  (
    'ditianshu-ziping',
    '滴天髓',
    '滴天髓',
    'Di Tian Sui (Drops of Heavenly Essence)',
    'other',
    'WIKISRC-DITIANSUI',
    '維基文庫｜滴天髓（原文，不含任瓞、徐樂吾等後世闡微注本）',
    'https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93',
    'classic',
    '相傳明初劉伯溫著，一說清代京圖原本；本條僅登記原文本身。坊間流通的《滴天髓闡微》（任鐵樵注）、徐樂吾補注屬後世注文／後世整理，須另立 source_id 登記，不得與本條原文混用於直引驗證。段落須逐條核對維基文庫原文後才可標記 verified；未核對前一律 pending，不得先行 force-verified。',
    true
  ),
  (
    'sanmingtonghui',
    '三命通會',
    '三命通会',
    'San Ming Tong Hui (Comprehensive Treatise on the Three Fates)',
    'other',
    'WIKISRC-SANMING-SKQS',
    '維基文庫｜三命通會（四庫全書本）',
    'https://zh.wikisource.org/zh-hant/%E4%B8%89%E5%91%BD%E9%80%9A%E6%9C%83_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)',
    'classic',
    '明代萬民英著；本條採四庫全書本原文，屬清代官修文淵閣底本，非後世坊間刪節或改編版本。段落須逐卷核對後才可標記 verified；未核對前一律 pending。',
    true
  ),
  (
    'zipingzhenquan',
    '子平真詮',
    '子平真诠',
    'Zi Ping Zhen Quan (True Explanation of Zi Ping)',
    'other',
    'NLC-SCAN-ZPZQ',
    '中國國家圖書館｜子平真詮 影印原本掃描（Wikimedia Commons 存檔）',
    'https://upload.wikimedia.org/wikipedia/commons/f/fe/NLC416-11jh010455-35296_%E5%AD%90%E5%B9%B3%E7%9C%9F%E8%A9%AE.pdf',
    'classic',
    '清代沈孝瞻原著。本條登記中國國家圖書館原刻影印掃描本（圖像掃描，非逐段可定位之電子文本），只作原文版本存在性與版本可靠性依據。徐樂吾《子平真詮評注》是另一部清末民初後世整理注本，屬 注文／後世整理，若日後入庫須另立獨立 source_id 並標 source_nature 反映其評注性質，不得與本條原文登記混為一談。掃描影印本尚無法逐段程式化核對，任何段落在完成人工核校前一律 pending，不得 force-verified。',
    true
  ),
  (
    'qiongtongbaojian',
    '窮通寶鑑',
    '穷通宝鉴',
    'Qiong Tong Bao Jian (Precious Mirror of Fortune and Adversity)',
    'other',
    'WIKISRC-QIONGTONG',
    '維基文庫｜窮通寶鑑（原文；坊間亦稱《欄江網》／徐樂吾改編本《造化元鑰》為另一系統版本）',
    'https://zh.wikisource.org/zh-hant/%E7%A9%B7%E9%80%9A%E5%AF%B6%E9%91%92',
    'classic',
    '成書年代與作者尚有爭議（一說明清間累積成書）；本條登記維基文庫所收原文版本，另可與中國哲學書電子化計劃（ctext.org 窮通寶鑑條目）互相校對。徐樂吾改編／重編的《造化元鑰》屬另一部後世整理著作，不得與本條原文版本混同引用。段落須逐條核對後才可標記 verified；未核對前一律 pending。',
    true
  )
on conflict (slug) do nothing;

comment on table public.classic_sources is
  'Classical/reference text sources for classic_passages. source_nature separates provenance class (classic / screenshot_transcription / modern_compilation / other_reference) from per-passage verification_status. Registering a source here never auto-verifies its passages.';
