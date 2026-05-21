export type SalonStatus = 'pending' | 'active' | 'featured';
export type SalonType = 'salon' | 'mobile';
export type SalonGender = 'men' | 'women' | 'unisex';

export interface Salon {
  id: string;
  name: string;
  slug: string;
  type: SalonType;
  gender: SalonGender;
  district: string;
  town: string | null;
  region: string;
  service_area: string | null;
  whatsapp: string;
  phone: string | null;
  opening_hours: string;
  walkin: boolean;
  about: string | null;
  cover_photo_url: string | null;
  status: SalonStatus;
  created_at: string;
}

export interface SalonService {
  id: string;
  salon_id: string;
  name: string;
  gender: SalonGender;
  price_from: number | null;
  price_to: number | null;
  duration_minutes: number | null;
  photo_url: string | null;
  sort_order: number;
}

export interface SalonPortfolio {
  id: string;
  salon_id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
}

export type SalonInsert = Omit<Salon, 'id' | 'created_at' | 'status'>;
export type SalonServiceInsert = Omit<SalonService, 'id'>;
export type SalonPortfolioInsert = Omit<SalonPortfolio, 'id'>;
