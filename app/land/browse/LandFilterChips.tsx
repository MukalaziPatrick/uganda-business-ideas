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

export function LandFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeDistrict = searchParams.get('district');
  const activeType = searchParams.get('land_type');
  const activeUse = searchParams.get('intended_use');
  const activeVerified = searchParams.get('verification_stage');

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max px-4">
        {/* Verified filter */}
        <button
          onClick={() => setFilter('verification_stage', 'verified')}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
            activeVerified === 'verified'
              ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
              : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
          }`}
        >
          ✅ Verified only
        </button>

        {/* District chips */}
        {DISTRICTS.map((d) => (
          <button
            key={d}
            onClick={() => setFilter('district', d)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeDistrict === d
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
            }`}
          >
            {d}
          </button>
        ))}

        {/* Type chips */}
        {LAND_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter('land_type', t.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeType === t.value
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Use chips */}
        {USES.map((u) => (
          <button
            key={u.value}
            onClick={() => setFilter('intended_use', u.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
              activeUse === u.value
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#2d6a4f]'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}
