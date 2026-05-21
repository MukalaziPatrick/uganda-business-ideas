export type StayStatus = 'pending' | 'active' | 'featured';
export type StayType = 'hotel' | 'guesthouse' | 'lodge' | 'airbnb' | 'camping';

export interface TravelDestination {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  activities: string[];
  cover_photo_url: string | null;
  sort_order: number;
  is_featured: boolean;
}

export interface TravelStay {
  id: string;
  name: string;
  slug: string;
  destination_id: string;
  type: StayType;
  district: string;
  town: string;
  description: string;
  price_from: number;
  checkin_time: string;
  checkout_time: string;
  capacity: number;
  whatsapp: string;
  phone: string | null;
  booking_com_url: string | null;
  amenities: string[];
  cover_photo_url: string | null;
  status: StayStatus;
  created_at: string;
}

export interface TravelStayRoom {
  id: string;
  stay_id: string;
  name: string;
  price_per_night: number;
  capacity: number;
  sort_order: number;
}

export interface TravelStayPhoto {
  id: string;
  stay_id: string;
  photo_url: string;
  caption: string | null;
  sort_order: number;
}

export type TravelStayInsert = Omit<TravelStay, 'id' | 'created_at' | 'status'>;
