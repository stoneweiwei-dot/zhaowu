import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { AnalyzeInput, CityHit } from "@/lib/bazi/types";
import { useI18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { updateBirthData } from "@/lib/supabase-rest";
import { UNKNOWN_TIME_COPY } from "@/lib/bazi/presentation";
import {
  formatSharedBirthRecord,
  readSharedBirthRecord,
  sharedBirthFromUnknown,
  writeSharedBirthRecord,
  type SharedBirthRecord,
} from "@/lib/shared-birth";
import { CityPicker } from "@/components/city-picker";

export function AnalysisForm() {
  const { t, locale } = useI18n();
  const { user, session } = useCurrentUserState();
  const reset = useAppStore((s) => s.reset);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [gender, setGender] = useState<AnalyzeInput["gender"]>("unspecified");
  const [relation, setRelation] = useState<AnalyzeInput["relation"]>("unset");
  const [birthCity, setBirthCity] = useState<CityHit | null>(null);
  const [liveCity, setLiveCity] = useState<CityHit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberedRecord, setRememberedRecord] = useState<SharedBirthRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const copy = locale === "en"
    ? {
        customerKicker: "SHARED RECORD",
        customerTitle: "Client details",
        customerLead: "Enter the birth record once on this phone. Every personal reading reuses it, including after sign-in.",
        birthReady: "Client record saved",
        birthReadyLead: "The other personal readings will reuse this record.",
        edit: "Edit details",
        useRecord: "This phone already has a birth record. Open any personal reading to use it.",
        submit: "Save birth record",
        busy: "Saving…",
        birthData: "Birth record",
        saved: "Birth record saved on this phone.",
      }
    : locale === "zh-Hans"
      ? {
          customerKicker: "共用资料",
          customerTitle: "客人资料",
          customerLead: "生辰在这台手机填写一次即可。各命理专卷会共用，登录后也不会清空。",
          birthReady: "资料已保存",
          birthReadyLead: "其他命理专卷将沿用这份资料。",
          edit: "修改",
          useRecord: "这台手机已有生辰。打开任一命理专卷即可沿用。",
          submit: "保存生辰",
          busy: "正在保存…",
          birthData: "出生资料",
          saved: "生辰已保存在这台手机。",
        }
      : {
          customerKicker: "共用資料",
          customerTitle: "客人資料",
          customerLead: "生辰在這台手機填寫一次即可。各命理專卷會共用，登入後也不會清空。",
          birthReady: "資料已保存",
          birthReadyLead: "其他命理專卷將沿用這份資料。",
          edit: "修改",
          useRecord: "這台手機已有生辰。打開任一命理專卷即可沿用。",
          submit: "保存生辰",
          busy: "正在保存…",
          birthData: "出生資料",
          saved: "生辰已保存在這台手機。",
        };

  function applyBirth(record: SharedBirthRecord) {
    setYear(String(record.year));
    setMonth(String(record.month));
    setDay(String(record.day));
    setHour(record.timeUnknown ? "" : String(record.hour));
    setMinute(record.timeUnknown ? "" : String(record.minute));
    setTimeUnknown(record.timeUnknown);
    setGender(record.gender);
    setRelation(record.relation);
    setBirthCity(record.city);
    setLiveCity(record.liveCity ?? null);
  }

  useEffect(() => {
    reset();
    const clear = () => reset();
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, [reset]);

  useEffect(() => {
    const serverRecord = sharedBirthFromUnknown(user?.birthData);
    const localRecord = readSharedBirthRecord();
    const record = localRecord ?? serverRecord;
    if (!record) return;
    applyBirth(record);
    setRememberedRecord(record);
    setDetailsOpen(false);
    if (!localRecord && serverRecord) writeSharedBirthRecord(serverRecord);
  }, [user?.id, user?.birthData]);

  const draftBirth = useMemo(() => sharedBirthFromUnknown({
    year,
    month,
    day,
    hour: timeUnknown ? 12 : hour,
    minute: timeUnknown ? 0 : minute || 0,
    timeUnknown,
    gender,
    relation,
    city: birthCity,
    liveCity,
    ziPolicy: "midnight",
    useTrueSolar: true,
  }), [year, month, day, hour, minute, timeUnknown, gender, relation, birthCity, liveCity]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!birthCity || !draftBirth) {
      setError(t("errCity"));
      setDetailsOpen(true);
      return;
    }

    writeSharedBirthRecord(draftBirth);
    setRememberedRecord(draftBirth);
    setDetailsOpen(false);
    setBusy(true);

    try {
      if (session) {
        void updateBirthData(session, draftBirth as unknown as Record<string, unknown>)
          .then(() => window.dispatchEvent(new Event("zhaowu-auth-change")));
      }
      window.setTimeout(() => document.getElementById("analysis-reports")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    } catch (err) {
      setError(locale === "en" ? "Could not save the birth record." : err instanceof Error ? err.message : copy.saved);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form id="analysisForm" className="zhaowu-analysis-flow" onSubmit={(event) => void submit(event)}>
      <section id="customer-record" className="zhaowu-customer-record" aria-labelledby="zhaowu-customer-title">
        <header className="zhaowu-customer-head">
          <div>
            <p className="zhaowu-section-kicker">{copy.customerKicker}</p>
            <h2 id="zhaowu-customer-title">{copy.customerTitle}</h2>
            <p className="zhaowu-section-lead">{copy.customerLead}</p>
          </div>
          {rememberedRecord && !detailsOpen ? (
            <button type="button" className="zhaowu-birth-edit" onClick={() => setDetailsOpen(true)}>{copy.edit}</button>
          ) : null}
        </header>

        {rememberedRecord && !detailsOpen ? (
          <div className="zhaowu-birth-summary" aria-label={copy.birthReady}>
            <span>{copy.birthReady}</span>
            <strong>{formatSharedBirthRecord(rememberedRecord, locale)}</strong>
            <p>{copy.birthReadyLead}</p>
          </div>
        ) : (
          <div className="zhaowu-birth-fields">
            <p className="zhaowu-birth-fields-title">{copy.birthData}</p>
            <div className="zhaowu-birth-date-grid">
              {[
                { id: "birth-year", label: t("year"), value: year, set: setYear, min: 1900, max: 2100 },
                { id: "birth-month", label: t("month"), value: month, set: setMonth, min: 1, max: 12 },
                { id: "birth-day", label: t("day"), value: day, set: setDay, min: 1, max: 31 },
              ].map((field) => (
                <label htmlFor={field.id} key={field.id}>
                  <span>{field.label}</span>
                  <input id={field.id} type="number" inputMode="numeric" min={field.min} max={field.max} required value={field.value} onChange={(event) => field.set(event.target.value)} />
                </label>
              ))}
            </div>

            <div className="zhaowu-birth-time-block">
              <div className="zhaowu-birth-time-line">
                <span>{t("time")}</span>
                <label htmlFor="time-unknown">
                  <input id="time-unknown" aria-describedby="time-importance" type="checkbox" checked={timeUnknown} onChange={(event) => setTimeUnknown(event.target.checked)} />
                  {t("timeUnknown")}
                </label>
              </div>
              <p id="time-importance" className="zhaowu-time-warning">{UNKNOWN_TIME_COPY[locale]}</p>
              <div className="zhaowu-birth-time-grid">
                <input id="birth-hour" aria-label={t("hourPh")} type="number" inputMode="numeric" min={0} max={23} required={!timeUnknown} disabled={timeUnknown} value={hour} placeholder={t("hourPh")} onChange={(event) => setHour(event.target.value)} />
                <input id="birth-minute" aria-label={t("minutePh")} type="number" inputMode="numeric" min={0} max={59} disabled={timeUnknown} value={minute} placeholder={t("minutePh")} onChange={(event) => setMinute(event.target.value)} />
              </div>
            </div>

            <div className="zhaowu-birth-select-grid">
              <label htmlFor="birth-gender">
                <span>{t("gender")}</span>
                <select id="birth-gender" value={gender} onChange={(event) => setGender(event.target.value as AnalyzeInput["gender"])}>
                  <option value="unspecified">{t("unset")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </label>
              <label htmlFor="relationship-preference">
                <span>{t("relation")}</span>
                <select id="relationship-preference" value={relation} onChange={(event) => setRelation(event.target.value as AnalyzeInput["relation"])}>
                  <option value="unset">{t("unset")}</option>
                  <option value="any">{t("relAny")}</option>
                  <option value="hetero">{t("relHet")}</option>
                  <option value="same">{t("relSame")}</option>
                </select>
                <small>{t("relHint")}</small>
              </label>
            </div>

            <div className="zhaowu-birth-cities">
              <CityPicker id="birth-city" label={t("city")} placeholder={t("cityPh")} optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={birthCity} onSelect={setBirthCity} />
              <CityPicker id="current-city" label={t("liveCity")} placeholder={t("liveCity")} optional optionalLabel={t("optional")} popularLabel={t("popularCities")} locale={locale} value={liveCity} onSelect={setLiveCity} />
              <p>{t("liveHint")}</p>
            </div>
          </div>
        )}

      </section>

      {error ? <p role="alert" className="zhaowu-analysis-error">{error}</p> : null}
      <div id="bazi" className="zhaowu-bazi-hub zhaowu-analysis-submit-wrap">
        <p>{rememberedRecord ? copy.useRecord : copy.customerLead}</p>
        <button type="submit" disabled={busy}>{busy ? copy.busy : copy.submit}</button>
      </div>
    </form>
  );
}
