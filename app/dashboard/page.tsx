import Link from "next/link";
import GetHelp from "../../components/GetHelp";

const cardLabel = "text-[12px] font-bold uppercase tracking-[0.12em] text-brand-green";

const CHECKLIST_BASE = ["Calculate exact costs"];
const TOOLS = ["Startup Cost Calculator", "Pricing Tool", "Profit Margins"];

export default function DashboardPage() {
  // Mocked Data
  const user = {
    name: "Mukisa",
    interest: "Poultry Farming",
    location: "Gulu",
    budget: "UGX 500,000 - 2,000,000",
    challenge: "Finding reliable feed",
    stage: "Just starting",
    readiness: 25,
  };

  const checklist = [
    ...CHECKLIST_BASE,
    `Identify 3 local buyers in ${user.location}`,
    "Find a secure location",
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest text-[10px] font-black text-brand-gold">
            UBI
          </div>
          <span className="text-[14px] font-semibold text-brand-forest">
            Business Yoo
          </span>
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-forest text-xs font-black text-brand-gold ring-2 ring-brand-beige">
          {user.name.charAt(0)}
        </div>
      </header>

      {/* Welcome */}
      <section className="motion-page mb-5">
        <h1 className="text-2xl font-black tracking-tight text-brand-forest sm:text-3xl">
          Good morning, {user.name}!
        </h1>
        <p className="mt-1 text-[15px] text-brand-green">
          Let&apos;s build your <span className="font-semibold text-brand-forest">{user.interest}</span> business.
        </p>
      </section>

      {/* Context Tags */}
      <div className="motion-page mb-8 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-beige bg-brand-surface px-3 py-1.5 text-[12px] font-semibold text-brand-forest">
          <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {user.location}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold bg-brand-gold px-3 py-1.5 text-[12px] font-semibold text-brand-forest">
          <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {user.budget}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-beige bg-brand-cream px-3 py-1.5 text-[12px] font-semibold text-brand-green">
          <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {user.challenge}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/10 px-3 py-1.5 text-[12px] font-semibold text-brand-forest">
          <svg aria-hidden className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {user.stage}
        </span>
      </div>

      <div className="motion-page-delay grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {/* Next Step Card */}
        <div className="relative overflow-hidden rounded-2xl bg-brand-forest p-6 text-brand-cream shadow-lg sm:col-span-2 sm:p-7 lg:col-span-2">
          <div aria-hidden className="absolute right-0 top-0 opacity-10">
            <svg className="-mr-10 -mt-10 h-48 w-48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-brand-green/50 blur-3xl" />
          <div className="relative z-10">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-gold">Next Step</p>
            <h2 className="mb-5 max-w-[26ch] text-xl font-bold leading-snug sm:text-2xl">
              Read the {user.interest} Startup Guide
            </h2>
            <Link
              href="/guides/poultry-starter-guide"
              className="motion-press inline-flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2.5 text-[14px] font-bold text-brand-forest transition-colors hover:bg-brand-gold/90"
            >
              Read Now
              <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Readiness Progress */}
        <div className="flex flex-col justify-center rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h3 className={cardLabel}>Readiness</h3>
            <span className="text-2xl font-black text-brand-forest">{user.readiness}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={user.readiness}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Business readiness score"
            className="h-2.5 w-full overflow-hidden rounded-full bg-brand-beige/60"
          >
            <div className="h-full rounded-full bg-brand-gold" style={{ width: `${user.readiness}%` }} />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-brand-green">
            You are just getting started. Complete tasks to increase your score.
          </p>
        </div>

        {/* Financial Estimate */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm">
          <h3 className={`${cardLabel} mb-2`}>Estimated Capital Needed</h3>
          <p className="text-2xl font-black tracking-tight text-brand-forest sm:text-3xl">UGX 1,500,000</p>
          <p className="mt-2 text-[12px] font-medium text-brand-green">Based on a typical setup in {user.location}.</p>
        </div>

        {/* Action Checklist */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <h3 className={`${cardLabel} mb-4`}>Quick Checklist</h3>
          <ul className="space-y-3.5">
            {checklist.map(item => (
              <li key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-brand-beige text-transparent">
                  <svg aria-hidden className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px] leading-snug text-brand-green">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tools & Calculators */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <h3 className={`${cardLabel} mb-4`}>Tools</h3>
          <ul className="divide-y divide-brand-beige/60">
            {TOOLS.map(tool => (
              <li key={tool} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="cursor-not-allowed text-[14px] text-brand-green/60">{tool}</span>
                <span className="rounded-md bg-brand-beige px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-brand-forest/70">
                  Soon
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Business Plan Snippet */}
        <div className="flex flex-col justify-between rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm">
          <div>
            <h3 className={`${cardLabel} mb-2`}>Your Business Plan</h3>
            <p className="mb-4 text-[14px] leading-relaxed text-brand-green">
              A personalized roadmap for your {user.interest} business.
            </p>
          </div>
          <div className="relative w-full">
            <button
              disabled
              className="inline-flex w-full cursor-not-allowed justify-center rounded-xl border border-brand-beige bg-brand-cream px-4 py-2.5 text-[13px] font-semibold text-brand-green/60"
            >
              View Full Report
            </button>
            <span className="absolute -right-2 -top-2 rounded-md bg-brand-beige px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-brand-forest/70">
              Soon
            </span>
          </div>
        </div>

        {/* Opportunities (Placeholder) */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-gold/50 bg-brand-gold/15 p-5 shadow-sm sm:col-span-2 lg:col-span-2">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <h3 className={cardLabel}>Opportunities</h3>
              <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-brand-forest">
                Coming Soon
              </span>
            </div>
            <p className="mb-1 text-[15px] font-semibold text-brand-forest">
              2 Government Tenders matching {user.interest} in {user.location}.
            </p>
            <p className="text-[13px] leading-relaxed text-brand-green">
              Soon, you&apos;ll be able to see real contracts and leads here.
            </p>
          </div>
          <div aria-hidden className="absolute bottom-0 right-0 opacity-10">
            <svg className="-mb-6 -mr-6 h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>

        {/* Support Section */}
        <div className="sm:col-span-2 lg:col-span-1">
          <GetHelp />
        </div>
      </div>
    </main>
  );
}
