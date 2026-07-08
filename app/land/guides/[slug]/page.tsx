// app/land/guides/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLandContentBySlug } from '@/lib/land/queries';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getLandContentBySlug(slug);
  if (!article) return { title: 'Article not found' };
  return { title: `${article.title} | SafeLands UG` };
}

export default async function LandGuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getLandContentBySlug(slug);
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/land/guides" className="text-sm text-land-primary hover:underline">← All Guides</Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          {article.title}
        </h1>
        <p className="text-sm text-gray-400 mb-8">
          {new Date(article.published_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}
          {article.district ? ` · ${article.district}` : ''}
        </p>

        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
          {article.body}
        </div>

        <div className="mt-12 p-6 bg-land-cream/60 rounded-2xl border border-land-mint/40 text-center">
          <p className="font-semibold text-land-primary mb-2">Ready to find land?</p>
          <Link
            href="/land/browse"
            className="inline-block bg-land-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-land-forest transition-colors text-sm"
          >
            Browse Verified Listings
          </Link>
        </div>
      </div>
    </main>
  );
}
