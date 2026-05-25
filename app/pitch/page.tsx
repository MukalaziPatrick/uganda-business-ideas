import type { Metadata } from 'next';
import { GATEKEEPERS } from '@/app/data/gatekeepers';
import PitchDirectoryClient from './PitchDirectoryClient';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'SoundPitch — Get Your Music Heard | Business Yoo',
  description: 'Connect with Uganda and East Africa\'s top radio stations, music blogs, playlist curators, and journalists. Generate a professional pitch letter in seconds.',
  alternates: { canonical: `${SITE_URL}/pitch` },
  openGraph: {
    title: 'SoundPitch — Get Your Music Heard',
    description: 'AI-powered music pitch tool for independent Ugandan and African artists.',
    url: `${SITE_URL}/pitch`,
    siteName: 'Business Yoo',
    locale: 'en_UG',
    type: 'website',
  },
};

export default function PitchPage() {
  return <PitchDirectoryClient gatekeepers={GATEKEEPERS} />;
}
