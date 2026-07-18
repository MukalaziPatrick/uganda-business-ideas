'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const DISTRICTS = ['Kampala','Wakiso','Mukono','Jinja','Mbale','Gulu','Mbarara','Masaka','Lira'];
const LAND_TYPES = [
  { value: 'mailo', label: 'Mailo' },
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'customary', label: 'Customary' },
];
const USES = [
  { value: 'farming', label: '🌾 Farming' },
  { value: 'residential', label: '🏠 Residential' },
  { value: 'commercial', label: '🏢 Commercial' },
];

const selectClass =
  'min-h-11 w-full rounded-xl border border-land-mint/50 bg-white px-3 text-sm text-land-ink focus:outline-none focus:border-land-primary focus:ring-2 focus:ring-land-mint/60';

export function LandFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeDistrict = searchParams.get('district') ?? '';
  const activeType = searchParams.get('land_type') ?? '';
  const activeUse = searchParams.get('intended_use') ?? '';
  const verifiedOnly = searchParams.get('verification_stage') === 'verified';
  const activeCount =
    Number(Boolean(activeDistrict)) + Number(Boolean(activeType)) +
    Number(Boolean(activeUse)) + Number(verifiedOnly) +
    Number(Boolean(searchParams.get('q')));

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-[11px] font-bold text-land-forest/85">
          District
          <select value={activeDistrict} onChange={(e) => setFilter('district', e.target.value)} className={selectClass}>
            <option value="">All districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-land-forest/85">
          Land type
          <select value={activeType} onChange={(e) => setFilter('land_type', e.target.value)} className={selectClass}>
            <option value="">All types</option>
            {LAND_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] font-bold text-land-forest/85">
          Use
          <select value={activeUse} onChange={(e) => setFilter('intended_use', e.target.value)} className={selectClass}>
            <option value="">Any use</option>
            {USES.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setFilter('verification_stage', 'verified')}
          aria-pressed={verifiedOnly}
          className={`motion-press min-h-11 rounded-xl border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-mint ${
            verifiedOnly
              ? 'border-land-primary bg-land-primary text-white'
              : 'border-land-mint/50 bg-white text-land-ink/85 hover:border-land-primary'
          }`}
        >
          ✅ Verified only
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="motion-press min-h-11 px-2 text-xs font-bold text-land-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-land-mint"
          >
            Clear filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}
