# Migration smoke

PR 修改 `supabase/**` 或 workflow 本身時，GitHub Actions 在 job 的私有容器網路建立一次性 PostgreSQL 16。資料庫埠只在該網路可用。兩個容器均使用 Docker Official Image 的 `postgres:16`，無需正式服務憑證。

從空資料庫建立三個角色、模擬使用者及 `auth.uid()`，以 `storage.buckets` 的單筆測試資料承接三份 bucket 更新。內建 contrib 的 pgcrypto 裝在 extensions schema，提供真正的 digest 與 hmac。

每個 SQL 檔依 C locale 檔名順序交給 psql，啟用 ON_ERROR_STOP。20261030120000 的排程區塊依 migration 自身的條件，只在已安裝 pg_cron 時執行。20261030120100 的 Vault 查詢位於函式內，該函式自帶無 Vault 的 fallback。此 smoke 驗證角色權限，未測排程或 Vault 功能。所有 migration 均納入，包括 38844c0a 的十一表撤權。

角色測試在同一筆交易中切換身分，結束時回滾。預期的拒絕只接受 SQLSTATE 42501。CI 的 PostgreSQL 執行紀錄才是套用及權限結果。
