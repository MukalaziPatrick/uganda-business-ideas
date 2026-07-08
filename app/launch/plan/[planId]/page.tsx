import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Your Launch Plan — Founder OS | Business Yoo",
  robots: { index: false, follow: false },
};

type PlanPageProps = {
  params: Promise<{ planId: string }>;
};

const KIND_LABELS: Record<string, string> = {
  content_idea: "Content ideas",
  post_draft: "Ready-to-post drafts",
  headline: "Headlines",
  email_cta: "Email capture CTA",
};

const WEEK_LABELS = ["Week 1 — Clarity & offer", "Week 2 — Visibility", "Week 3 — Outreach", "Week 4 — First sales"];

export default async function PlanPage({ params }: PlanPageProps) {
  const { planId } = await params;
  const supabase = createSupabaseAdminClient();
  if (!supabase) notFound();

  const { data: plan } = await supabase
    .from("fos_launch_plans")
    .select("id, offer_statement, lead_magnet_idea, readiness_summary")
    .eq("id", planId)
    .single();

  if (!plan) notFound();

  const { data: tasks } = await supabase
    .from("fos_plan_tasks")
    .select("day_number, title, detail")
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true });

  const { data: contentItems } = await supabase
    .from("fos_content_items")
    .select("kind, body")
    .eq("plan_id", planId)
    .order("sort_order", { ascending: true });

  const weeks = WEEK_LABELS.map((label, weekIndex) => ({
    label,
    items: (tasks ?? []).filter((task) => {
      const week = Math.min(Math.ceil(task.day_number / 7), 4);
      return week === weekIndex + 1;
    }),
  }));

  const contentGroups = Object.entries(KIND_LABELS)
    .map(([kind, label]) => ({
      label,
      items: (contentItems ?? []).filter((item) => item.kind === kind),
    }))
    .filter((group) => group.items.length > 0);

  const whatsAppUrl = buildWhatsAppUrl({
    message: "Hi Founder OS — I just got my launch plan and I want to talk about the Assisted Launch package.",
  });

  return (
    <main className="min-h-screen bg-brand-surface text-brand-forest">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-10 flex items-center justify-between">
          <Link href="/launch" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest text-[11px] font-black text-brand-gold">
              FO
            </div>
            <span className="text-[15px] font-bold">Founder OS</span>
          </Link>
          <span className="rounded-full bg-brand-gold/25 px-3 py-1 text-[11px] font-black uppercase tracking-wide">
            Your launch plan
          </span>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Your readiness snapshot
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-brand-forest/80">
            {plan.readiness_summary}
          </p>
        </section>

        <section className="mt-6 rounded-2xl bg-brand-forest p-6 text-brand-surface shadow-md sm:p-8">
          <h2 className="text-[13px] font-black uppercase tracking-wide text-brand-gold">
            Your one-sentence offer
          </h2>
          <p className="mt-3 text-xl font-bold leading-snug">{plan.offer_statement}</p>
          <h2 className="mt-6 text-[13px] font-black uppercase tracking-wide text-brand-gold">
            Your lead magnet
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-brand-surface/85">
            {plan.lead_magnet_idea}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black tracking-tight">Your 30-day launch checklist</h2>
          {weeks.map((week) => (
            <div key={week.label} className="mt-6">
              <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-forest">
                {week.label}
              </h3>
              <ul className="mt-3 space-y-3">
                {week.items.map((task) => (
                  <li key={task.day_number} className="flex gap-4 rounded-xl bg-white p-4 shadow-sm">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold/25 text-[13px] font-black">
                      {task.day_number}
                    </span>
                    <div>
                      <p className="text-[15px] font-bold">{task.title}</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-brand-forest/70">
                        {task.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black tracking-tight">Content starters</h2>
          {contentGroups.map((group) => (
            <div key={group.label} className="mt-6">
              <h3 className="text-[13px] font-black uppercase tracking-wide text-brand-forest">
                {group.label}
              </h3>
              <ul className="mt-3 space-y-3">
                {group.items.map((item, index) => (
                  <li
                    key={`${group.label}-${index}`}
                    className="whitespace-pre-line rounded-xl bg-white p-4 text-[14px] leading-relaxed text-brand-forest/85 shadow-sm"
                  >
                    {item.body}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-3xl bg-brand-forest px-6 py-10 text-center">
          <h2 className="text-xl font-black text-brand-surface sm:text-2xl">
            Want an operator working this plan with you?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-brand-surface/70">
            The Assisted Launch package pairs you with a real human until you launch.
            Reach us on any channel:
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsAppUrl}
              className="rounded-xl bg-brand-gold px-6 py-3 text-[14px] font-black text-brand-forest"
            >
              WhatsApp us
            </a>
            <a
              href="tel:+256781799221"
              className="rounded-xl border border-brand-surface/30 px-6 py-3 text-[14px] font-bold text-brand-surface"
            >
              Call us
            </a>
            <a
              href="mailto:patricktwin1@gmail.com?subject=Assisted%20Launch"
              className="rounded-xl border border-brand-surface/30 px-6 py-3 text-[14px] font-bold text-brand-surface"
            >
              Email us
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
