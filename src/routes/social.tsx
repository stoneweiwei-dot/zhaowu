import { createFileRoute, Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/i18n";
export const Route = createFileRoute("/social")({ component: SocialPublisherPage });
/** Legacy link retained without the broken in-site OAuth/publisher. */
export function SocialPublisherPage({ embedded = false }: { embedded?: boolean }) {
  const { locale } = useI18n();
  const { user, isPending } = useCurrentUserState();
  const title = locale === "en" ? "Social publishing" : locale === "zh-Hans" ? "社群发布" : "社群發佈";
  const body = locale === "en" ? "Publishing and scheduling are now managed in Metricool." : locale === "zh-Hans" ? "发布与排程已改由 Metricool 管理。" : "發佈與排程已改由 Metricool 管理。";
  if (isPending) return <main className="mx-auto max-w-xl p-5" role="status">Loading…</main>;
  if (!user?.isOwner) return <main className="mx-auto max-w-xl space-y-3 p-5"><h1 className="font-display text-2xl">{title}</h1><p>{locale === "en" ? "Owner access required." : locale === "zh-Hans" ? "仅供站主使用。" : "僅供站主使用。"}</p><Link to="/login" className="underline">{locale === "en" ? "Sign in" : "站主登入"}</Link></main>;
  const Container = embedded ? "div" : "main";
  return <Container className="mx-auto max-w-xl space-y-4 p-5" data-external-social-handoff>
    <h1 className="font-display text-2xl">{title}</h1>
    <p className="text-sm leading-7 text-ink-soft">{body}</p>
    <a href="https://app.metricool.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-md border border-line bg-cream px-5 text-sm text-ink">{locale === "en" ? "Open Metricool" : "前往 Metricool 排程"}</a>
    <Link to="/account" className="block text-sm underline">{locale === "en" ? "Back to account" : locale === "zh-Hans" ? "返回后台" : "返回後台"}</Link>
  </Container>;
}
