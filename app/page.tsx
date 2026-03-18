// app/page.tsx
//
// ─── WHY THIS FILE EXISTS ──────────────────────────────────────────────────────
// Next.js generateMetadata only works in SERVER components.
// The homepage uses useState (client component), so we cannot export
// generateMetadata from the same file.
//
// Solution: this file is the server component. It:
//   1. Exports generateMetadata  → Next.js reads it for <head> tags
//   2. Renders <HomeClient />    → the actual interactive page
//
// You never need to touch this file unless you want to change the SEO copy.
// All page logic and UI lives in HomeClient.tsx.
// ──────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import HomeClient from "./HomeClient";

// ── Static metadata for the homepage ─────────────────────────────────────────
// Next.js merges this into the <head> automatically.
// Title template uses the pipe convention seen on the idea detail pages.
export const metadata: Metadata = {
  // Page title — shown in browser tabs and Google search results
  title: "Uganda Business Ideas | Find Practical Businesses You Can Start",

  // Meta description — shown under the title in Google search results.
  // Keep under ~155 characters so it doesn't get cut off.
  description:
    "Discover profitable business ideas in Uganda. Browse opportunities by budget and category — with real startup costs, step-by-step guides, and practical tips for beginners.",

  // Keywords — not used for ranking by Google but useful for Bing and
  // some social preview tools. Comma-separated, Uganda-specific.
  keywords: [
    "Uganda business ideas",
    "business ideas Uganda",
    "small business Uganda",
    "profitable businesses Uganda",
    "startup ideas Uganda",
    "low capital business Uganda",
    "Uganda entrepreneurship",
    "how to start a business in Uganda",
    "business opportunities Uganda 2026",
  ],

  // Open Graph — controls how the page looks when shared on WhatsApp,
  // Facebook, Twitter, LinkedIn, etc.
  openGraph: {
    title:       "Uganda Business Ideas | Practical Businesses You Can Start",
    description: "Browse profitable business ideas in Uganda filtered by budget and category. Real startup costs, step-by-step guides, and beginner-friendly advice.",
    url:         "https://ugandabusinessideas.com",         // ← update to your real domain
    siteName:    "Uganda Business Ideas",
    locale:      "en_UG",
    type:        "website",
  },

  // Twitter / X card — controls the preview card when shared on X
  twitter: {
    card:        "summary_large_image",
    title:       "Uganda Business Ideas | Practical Businesses You Can Start",
    description: "Browse profitable business ideas in Uganda filtered by budget and category. Real startup costs and step-by-step guides.",
  },

  // Canonical URL — tells Google this is the authoritative version of the page
  // (prevents duplicate-content issues if the site is accessible via www + non-www)
  alternates: {
    canonical: "https://ugandabusinessideas.com",           // ← update to your real domain
  },

  // Robots — tell search engines to index this page and follow its links
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:             true,
      follow:            true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

// ── Page component ────────────────────────────────────────────────────────────
// This is intentionally minimal — all UI is in HomeClient.
export default function Page() {
  return <HomeClient />;
}