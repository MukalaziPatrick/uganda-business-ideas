import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPostBySlug } from "../../data/blogPosts";
import { guides } from "../../data/guides";
import { SITE_URL } from "@/lib/site";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Business Yoo",
      description: "The requested Uganda business article could not be found.",
    };
  }

  return {
    title: `${post.title} | Business Yoo`,
    description: post.description,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const relatedGuide = post.guideSlug
    ? guides.find((guide) => guide.slug === post.guideSlug)
    : undefined;
  const relatedPosts = blogPosts
    .filter(
      (candidate) =>
        candidate.slug !== post.slug &&
        (candidate.category === post.category || candidate.category === "Planning")
    )
    .slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "Business Yoo",
    },
    publisher: {
      "@type": "Organization",
      name: "Business Yoo",
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <main className="min-h-screen bg-brand-cream text-brand-forest">
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:px-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <header className="flex flex-col gap-4 border-b border-brand-beige pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest text-[11px] font-black text-brand-gold">
              UBI
            </div>
            <span className="text-[15px] font-semibold text-brand-forest">
              Business Yoo
            </span>
          </Link>
          <Link
            href="/blog"
            className="inline-flex w-fit rounded-xl border border-brand-beige bg-brand-surface px-4 py-2 text-[13px] font-semibold text-brand-green shadow-sm hover:bg-brand-beige/40"
          >
            All articles
          </Link>
        </header>

        <article>
          <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-forest via-brand-green to-brand-forest px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-bold text-brand-cream/90">
                {post.category}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-brand-cream/80">
                {post.readingTime}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1 text-[11px] font-semibold text-brand-cream/80">
                Updated {post.updatedAt}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-brand-cream/75">
              {post.heroSummary}
            </p>
            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-gold">
              Best for: {post.audience}
            </p>
          </section>

          <section className="mt-6 space-y-5">
            {post.sections.map((section) => (
              <div
                key={section.heading}
                className="rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm"
              >
                <h2 className="text-xl font-black tracking-tight text-brand-forest">
                  {section.heading}
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-brand-green">
                  {section.body}
                </p>
                {section.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex gap-3 text-[13.5px] text-brand-green">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        </article>

        <section className="mt-6 grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-brand-forest">
              Related next steps
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-brand-beige bg-brand-cream px-3 py-1.5 text-[12.5px] font-semibold text-brand-green hover:bg-brand-beige/40"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-beige bg-brand-surface p-6">
            <h2 className="text-[15px] font-bold text-brand-forest">
              Need help applying this?
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-brand-green">
              Share your budget, location, and business interest so UBI can
              understand what help you need before replying.
            </p>
            <Link
              href={`/start?interest=${encodeURIComponent(post.title)}`}
              className="mt-4 inline-flex w-full justify-center rounded-xl bg-brand-gold px-5 py-2.5 text-[13px] font-bold text-brand-forest shadow-sm hover:bg-brand-beige"
            >
              Get help starting
            </Link>
          </div>
        </section>

        {relatedGuide && (
          <section className="mt-6 rounded-2xl border border-brand-gold/50 bg-brand-gold/20 p-6">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-forest">
              Paid guide
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-brand-forest">
              {relatedGuide.title}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-brand-green">
              {relatedGuide.summary}
            </p>
            <Link
              href={`/guides/${relatedGuide.slug}`}
              className="mt-4 inline-flex rounded-xl bg-white px-5 py-2.5 text-[13px] font-bold text-brand-forest shadow-sm ring-1 ring-brand-gold/40 hover:bg-brand-gold/20"
            >
              View guide
            </Link>
          </section>
        )}

        {relatedPosts.length > 0 && (
          <section className="mt-6 rounded-2xl border border-brand-beige bg-brand-surface p-6 shadow-sm">
            <h2 className="text-[15px] font-bold text-brand-forest">
              Related articles
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="rounded-2xl border border-brand-beige bg-brand-cream p-4 transition hover:border-brand-gold hover:bg-brand-gold/10"
                >
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-brand-forest">
                    {relatedPost.category}
                  </span>
                  <h3 className="mt-2 text-[13.5px] font-bold leading-snug text-brand-forest">
                    {relatedPost.title}
                  </h3>
                  <p className="mt-2 text-[12px] font-semibold text-brand-green/70">
                    {relatedPost.readingTime}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
