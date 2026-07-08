import Link from "next/link";
import GetHelp from "../../components/GetHelp";

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

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 md:px-10">
      <header className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest text-[10px] font-black text-brand-gold">
            UBI
          </div>
          <span className="text-[14px] font-semibold text-brand-forest">
            Business Yoo
          </span>
        </Link>
        <div className="h-8 w-8 rounded-full bg-brand-beige flex items-center justify-center text-brand-forest font-bold text-xs">
          {user.name.charAt(0)}
        </div>
      </header>

      {/* Welcome */}
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-forest">
          Good morning, {user.name}!
        </h1>
        <p className="mt-1 text-[15px] text-brand-green">
          Let&apos;s build your <span className="font-semibold text-brand-forest">{user.interest}</span> business.
        </p>
      </section>

      {/* Context Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-3 py-1 text-[12px] font-semibold text-brand-forest border border-brand-beige">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {user.location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold px-3 py-1 text-[12px] font-semibold text-brand-forest border border-brand-gold">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {user.budget}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-[12px] font-semibold text-brand-green border border-brand-beige">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {user.challenge}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-3 py-1 text-[12px] font-semibold text-brand-forest border border-brand-green/20">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {user.stage}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Next Step Card */}
        <div className="sm:col-span-2 lg:col-span-2 rounded-2xl bg-brand-forest p-5 sm:p-6 text-brand-cream shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
             <svg className="w-48 h-48 -mr-10 -mt-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-gold mb-2">Next Step</p>
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Read the {user.interest} Startup Guide</h2>
            <Link href="/guides/poultry-starter-guide" className="inline-flex items-center gap-2 rounded-xl bg-brand-gold px-5 py-2.5 text-[14px] font-bold text-brand-forest transition hover:bg-brand-beige active:scale-95">
              Read Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Readiness Progress */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
             <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green/75">Readiness</h3>
             <span className="text-lg font-black text-brand-forest">{user.readiness}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-brand-beige/50">
            <div className="h-full rounded-full bg-brand-gold" style={{ width: `${user.readiness}%` }}></div>
          </div>
          <p className="mt-3 text-[13px] text-brand-green/75">You are just getting started. Complete tasks to increase your score.</p>
        </div>

        {/* Financial Estimate */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green mb-1">Estimated Capital Needed</h3>
          <p className="text-2xl sm:text-3xl font-black text-brand-forest">UGX 1,500,000</p>
          <p className="mt-2 text-[12px] text-brand-green font-medium">Based on a typical setup in {user.location}.</p>
        </div>

        {/* Action Checklist */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green/75 mb-4">Quick Checklist</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-brand-beige text-transparent">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <span className="text-[14px] text-brand-green leading-snug">Calculate exact costs</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-brand-beige text-transparent">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <span className="text-[14px] text-brand-green leading-snug">Identify 3 local buyers in {user.location}</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-brand-beige text-transparent">
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <span className="text-[14px] text-brand-green leading-snug">Find a secure location</span>
            </li>
          </ul>
        </div>

        {/* Tools & Calculators */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green/75 mb-4">Tools</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <span className="text-[14px] text-brand-green/50 cursor-not-allowed">Startup Cost Calculator</span>
              <span className="rounded bg-brand-beige px-1.5 py-0.5 text-[9px] font-black uppercase text-brand-green/75">Soon</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-[14px] text-brand-green/50 cursor-not-allowed">Pricing Tool</span>
              <span className="rounded bg-brand-beige px-1.5 py-0.5 text-[9px] font-black uppercase text-brand-green/75">Soon</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-[14px] text-brand-green/50 cursor-not-allowed">Profit Margins</span>
              <span className="rounded bg-brand-beige px-1.5 py-0.5 text-[9px] font-black uppercase text-brand-green/75">Soon</span>
            </li>
          </ul>
        </div>

        {/* Business Plan Snippet */}
        <div className="rounded-2xl border border-brand-beige bg-brand-surface p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green/75 mb-2">Your Business Plan</h3>
            <p className="text-[14px] text-brand-green mb-4">A personalized roadmap for your {user.interest} business.</p>
          </div>
          <div className="relative w-full">
            <button disabled className="inline-flex w-full justify-center rounded-xl border border-brand-beige bg-brand-cream px-4 py-2.5 text-[13px] font-semibold text-brand-green/50 cursor-not-allowed">
              View Full Report
            </button>
            <span className="absolute -top-2 -right-2 rounded bg-brand-beige px-1.5 py-0.5 text-[9px] font-black uppercase text-brand-green/75">Soon</span>
          </div>
        </div>

        {/* Opportunities (Placeholder) */}
        <div className="rounded-2xl border border-brand-gold/50 bg-brand-gold/15 p-5 shadow-sm sm:col-span-2 lg:col-span-2 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-brand-green">Opportunities</h3>
               <span className="rounded bg-brand-gold px-1.5 py-0.5 text-[9px] font-black uppercase text-brand-forest">Coming Soon</span>
            </div>
            <p className="text-[15px] font-medium text-brand-forest mb-1">
              2 Government Tenders matching {user.interest} in {user.location}.
            </p>
            <p className="text-[13px] text-brand-green">
              Soon, you&apos;ll be able to see real contracts and leads here.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
             <svg className="w-32 h-32 -mr-6 -mb-6" fill="currentColor" viewBox="0 0 24 24">
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
