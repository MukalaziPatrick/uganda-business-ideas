export const SALON_TYPES = ['salon', 'mobile'] as const;
export const SALON_GENDERS = ['men', 'women', 'unisex'] as const;

export const SALON_TYPE_LABELS: Record<string, string> = {
  salon: '🏠 Salon',
  mobile: '🚗 Mobile Stylist',
};

export const SALON_GENDER_LABELS: Record<string, string> = {
  men: '👨 Men',
  women: '👩 Women',
  unisex: '✂️ Unisex',
};

export const SALON_AMENITY_OPTIONS = [
  'Walk-ins welcome',
  'Appointment only',
  'Home visits available',
  'Air conditioned',
  'Parking available',
  'WiFi',
] as const;

export function formatPrice(from: number | null, to: number | null): string {
  if (!from && !to) return 'Price on request';
  if (from && to && from !== to) return `UGX ${from.toLocaleString()} – ${to.toLocaleString()}`;
  if (from) return `From UGX ${from.toLocaleString()}`;
  if (to) return `Up to UGX ${to.toLocaleString()}`;
  return 'Price on request';
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr${hrs > 1 ? 's' : ''}`;
}
