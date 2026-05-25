import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GATEKEEPERS } from '@/app/data/gatekeepers';
import { SITE_URL } from '@/lib/site';
import PitchGeneratorClient from './PitchGeneratorClient';

export function generateStaticParams() {
  return GATEKEEPERS.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const gatekeeper = GATEKEEPERS.find((g) => g.id === id);
  if (!gatekeeper) return {};
  return {
    title: `Pitch to ${gatekeeper.name} | SoundPitch`,
    description: `Generate a professional pitch letter for ${gatekeeper.name}. Free AI pitch tool for Ugandan artists.`,
    alternates: { canonical: `${SITE_URL}/pitch/${id}` },
  };
}

export default async function PitchGeneratorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gatekeeper = GATEKEEPERS.find((g) => g.id === id);
  if (!gatekeeper) notFound();
  return <PitchGeneratorClient gatekeeper={gatekeeper} />;
}
