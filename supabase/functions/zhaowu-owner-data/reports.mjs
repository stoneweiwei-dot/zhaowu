/** Called only after the existing owner bridge has authenticated the request. */
export async function listReportPage(service, payload, select, isQaReport) {
  const limit = Math.min(50, Math.max(1, Math.trunc(Number(payload.limit) || 50)));
  const offset = Math.max(0, Math.trunc(Number(payload.offset) || 0));
  if (!Number.isSafeInteger(offset)) throw new Error('INVALID_REPORT_OFFSET');
  // Page the raw rows, not the filtered count: a page consisting entirely of QA
  // records must still allow the owner to reach older customer records.
  const { data, error } = await service.from('report_requests').select(select)
    .order('created_at', { ascending: false }).order('id', { ascending: false })
    .range(offset, offset + limit);
  if (error) throw new Error('REPORT_LIST_FAILED');
  const rows = data ?? [];
  return { ok: true, items: rows.slice(0, limit).filter(row => !isQaReport(row)),
    nextOffset: rows.length > limit ? offset + limit : null };
}

export function ownerReportRow(payload) {
  const result = payload.result;
  if (!result || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.id ?? '')
    || typeof result.question !== 'string' || !result.question.trim() || result.question.length > 400
    || !Array.isArray(result.chart?.pillars) || result.chart.pillars.length !== 4
    || typeof result.reading?.directAnswer !== 'string'
    || JSON.stringify(payload).length > 750_000) throw new Error('INVALID_REPORT');
  const sections = Array.isArray(payload.sections) ? payload.sections.slice(0, 24) : [];
  return {
    id: result.id, user_id: null, alias: result.question.slice(0, 80), record_kind: 'analysis',
    access_mode: 'member', status: 'report_ready', payment_tier: 'free', payment_status: 'not_required',
    context: { question: result.question, cityLabel: result.chart.cityLabel, source: 'owner-console',
      dayMaster: result.chart.dayMaster, ganZhiLine: result.chart.pillars.map(p => p.ganZhi).join(' ') },
    engine_snapshot: result, mother_draft: { reportSections: sections },
  };
}
