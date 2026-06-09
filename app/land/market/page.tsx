import type { Metadata } from 'next';
import { getMarketListings, sortListings, type MarketFilters } from '@/lib/land/market-queries';
import MarketClient from './MarketClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Open Market Land Radar — Uganda | Business Yoo',
  description: 'Daily-updated land listings scraped from OLX and Lamudi Uganda. Search by district, price, size and type.',
};

type Props = {
  searchParams: {
    q?: string;
    district?: string;
    land_type?: string;
    has_title?: string;
    price_min?: string;
    price_max?: string;
    size_min?: string;
    size_max?: string;
    source_site?: string;
  };
};

export default async function LandMarketPage({ searchParams }: Props) {
  const filters: MarketFilters = {
    q: searchParams.q,
    district: searchParams.district,
    land_type: searchParams.land_type,
    has_title: searchParams.has_title === 'true' ? true : searchParams.has_title === 'false' ? false : undefined,
    price_min: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    price_max: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    size_min: searchParams.size_min ? Number(searchParams.size_min) : undefined,
    size_max: searchParams.size_max ? Number(searchParams.size_max) : undefined,
    source_site: searchParams.source_site,
  };

  const raw = await getMarketListings(filters, 48);
  const listings = sortListings(raw);

  return <MarketClient listings={listings} total={listings.length} />;
}
