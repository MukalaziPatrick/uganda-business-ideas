// app/land/guides/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLandContent } from '@/lib/land/queries';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Land Guides & Articles | SafeLands UG',
  description: 'Guides on buying land in Uganda — title checking, planting seasons, district spotlights, and more.',
};

const TYPE_LABELS: Record<string, string> = {
  guide: '📖 Guide',
  spotlight: '📍 District Spotlight',
  seasonal: '🌱 Seasonal',
  explainer: '💡 Explainer',
};

export default async function LandGuidesPage() {
  const articles = await getLandContent(12);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#2d6a4f] text-white px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Land Guides
          </h1>
          <p className="text-green-100">Everything you need to know about buying land safely in Uganda.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Guides are being generated. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/land/guides/${article.slug}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow block"
              >
                <span className="text-xs font-medium text-gray-500 mb-2 block">
                  {TYPE_LABELS[article.content_type ?? ''] ?? '📄 Article'}
                  {article.district ? ` · ${article.district}` : ''}
                </span>
                <h2 className="font-semibold text-gray-900 text-sm leading-snug">{article.title}</h2>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(article.published_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
