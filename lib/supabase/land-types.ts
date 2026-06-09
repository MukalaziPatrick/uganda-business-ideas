// lib/supabase/land-types.ts

export type LandType = 'mailo' | 'freehold' | 'leasehold' | 'customary';
export type IntendedUse = 'farming' | 'residential' | 'commercial' | 'mixed';
export type TitleStatus = 'clean' | 'caution' | 'pending' | 'unknown';
export type VerificationStage = 'unverified' | 'submitted' | 'in-review' | 'verified' | 'checked' | 'self_listed';
export type PaymentMethod = 'mtn' | 'airtel' | 'whatsapp-manual';
export type PaymentStatus = 'pending' | 'paid' | 'expired';
export type ContentType = 'guide' | 'spotlight' | 'seasonal' | 'explainer';

export type LandAgent = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  photo: string | null;
  district: string | null;
  bio: string | null;
  is_verified: boolean;
  response_time_hrs: number | null;
  rating: number | null;
  safelands_agent_id: string | null;
  created_at: string;
};

export type LandListing = {
  id: string;
  title: string;
  district: string;
  parish: string | null;
  lat: number | null;
  lng: number | null;
  size_acres: number | null;
  price_ugx: number | null;
  land_type: LandType | null;
  intended_use: IntendedUse | null;
  title_status: TitleStatus;
  verification_stage: VerificationStage;
  trust_score: number;
  qr_token: string | null;
  agent_id: string | null;
  photos: string[];
  is_featured: boolean;
  safelands_id: string | null;
  created_at: string;
  verified_at: string | null;
  updated_at: string;
  // joined
  agent?: LandAgent | null;
  insight?: LandInsight | null;
};

export type LandInsight = {
  id: string;
  listing_id: string;
  farming_suitability: string | null;
  access_road_quality: string | null;
  nearby_infrastructure: string | null;
  risk_notes: string | null;
  planting_season_fit: string | null;
  generated_at: string;
  model_used: string | null;
};

export type LandPayment = {
  id: string;
  listing_id: string;
  buyer_phone: string;
  amount_ugx: number;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  access_expires_at: string | null;
  agent_id: string | null;
  flutterwave_ref: string | null;
  paid_at: string | null;
  created_at: string;
};

export type LandContent = {
  id: string;
  title: string;
  slug: string;
  body: string | null;
  content_type: ContentType | null;
  district: string | null;
  published_at: string;
  generated_by: string | null;
};

export type LandSavedSearch = {
  id: string;
  user_phone: string;
  district: string | null;
  price_max: number | null;
  size_min: number | null;
  land_type: LandType | null;
  intended_use: IntendedUse | null;
  notify_whatsapp: boolean;
  created_at: string;
  last_notified_at: string | null;
};

// Payload type from SafeLands Admin sync call
export type LandSyncPayload = {
  safelands_id: string;
  title: string;
  district: string;
  parish?: string;
  coordinates: { lat: number; lng: number };
  size_acres?: number;
  price_ugx?: number;
  land_type?: LandType;
  intended_use?: IntendedUse;
  title_status?: TitleStatus;
  verification_stage: VerificationStage;
  trust_score?: number;
  photos?: string[];
  agent: {
    safelands_agent_id: string;
    name: string;
    phone: string;
    whatsapp?: string;
    photo?: string;
    district?: string;
    bio?: string;
  };
};
