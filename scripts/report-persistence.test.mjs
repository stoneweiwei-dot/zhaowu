import test from "node:test";
import assert from "node:assert/strict";
import { saveReportRecord } from "../src/lib/supabase-rest.ts";

test("durable report save creates engine record then patches the same id to full_ready", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);
    const method = init.method ?? "GET";
    const payload = typeof init.body === "string" ? JSON.parse(init.body) : {};
    calls.push({ url, method, payload, headers: init.headers });
    return new Response(JSON.stringify([{
      id: payload.id ?? "report-contract-1",
      ...payload,
      created_at: "2026-09-05T00:00:00.000Z",
      updated_at: "2026-09-05T00:00:00.000Z",
    }]), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const session = {
      access_token: "contract-token",
      refresh_token: "contract-refresh",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: { id: "contract-user", email: "contract@example.test", user_metadata: { name: "Contract" } },
    };
    const profile = {
      id: "contract-user",
      email: "contract@example.test",
      display_name: "Contract",
      is_owner: false,
      owner_archive_id: null,
      birth_data: null,
    };
    const result = {
      id: "report-contract-1",
      question: "我現在最應該先處理什麼？",
      createdAt: "2026-09-05T00:00:00.000Z",
      locale: "zh-Hant",
      chart: {
        cityLabel: "Sydney",
        dayMaster: "壬",
        pillars: [
          { ganZhi: "戊辰" },
          { ganZhi: "辛酉" },
          { ganZhi: "壬辰" },
          { ganZhi: "壬寅" },
        ],
      },
      reading: {},
    };

    const saved = await saveReportRecord({
      session,
      profile,
      result,
      fullReport: "完整報告",
      ninePages: [],
    });

    assert.equal(calls.length, 2);
    assert.equal(calls[0].method, "POST");
    assert.match(calls[0].url, /\/rest\/v1\/report_requests\?on_conflict=id$/);
    assert.equal(calls[0].payload.id, result.id);
    assert.equal(calls[0].payload.status, "engine_ready");

    assert.equal(calls[1].method, "PATCH");
    assert.match(calls[1].url, new RegExp(`/rest/v1/report_requests\\?id=eq\\.${result.id}$`));
    assert.equal(calls[1].payload.status, "full_ready");
    assert.equal(calls[1].payload.payment_tier, "full");
    assert.deepEqual(calls[1].payload.paid_report, { text: "完整報告" });
    assert.equal(saved?.id, result.id);
  } finally {
    globalThis.fetch = originalFetch;
  }
});