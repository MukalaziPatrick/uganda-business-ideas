// app/sitemap.ts
//
// ─── WHAT THIS FILE DOES ──────────────────────────────────────────────────────
//
// Next.js App Router automatically reads this file and generates a
// /sitemap.xml file that search engines (Google, Bing, etc.) use to
// discover and crawl all the pages on your website.
//
// To use it:
//   1. Save this file at:  app/sitemap.ts
//   2. Update BASE_URL below to your real domain (e.g. https://yourdomain.com)
//   3. Deploy — Next.js handles the rest automatically
//
// You can verify it works by visiting:  https://yourdomain.com/sitemap.xml
//
// ─────────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { ideas } from "./data/ideas";

// ── Your website's base URL ───────────────────────────────────────────────────
// Replace this with your actual domain before going live.
// Do NOT include a trailing slash.
const BASE_URL = "https://uganda-business-ideas.vercel.app";

// ── Sitemap function ──────────────────────────────────────────────────────────
// Next.js calls this function at build time and uses the returned array
// to produce the /sitemap.xml file automatically.
//
// Each entry in the array represents one URL on your site.
// The fields mean:
//   url          — the full page URL
//   lastModified — when the page was last updated (helps Google prioritise crawling)
//   changeFrequency — how often Google should re-check this page
//   priority     — a hint to Google on how important this page is (0.0–1.0)
//                  Note: Google treats this as advisory, not mandatory.

export default function sitemap(): MetadataRoute.Sitemap {

  // ── Static pages ─────────────────────────────────────────────────────────
  // These pages always exist and don't change based on data.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:             `${BASE_URL}/`,
      lastModified:    new Date(),
      changeFrequency: "weekly",   // homepage content updates regularly
      priority:        1.0,        // highest priority — this is your main page
    },
    {
      url:             `${BASE_URL}/about`,
      lastModified:    new Date(),
      changeFrequency: "monthly",  // about page rarely changes
      priority:        0.6,
    },
    {
      url:             `${BASE_URL}/contact`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
  ];

  // ── Dynamic idea pages ────────────────────────────────────────────────────
  // One URL per business idea, built from the ideas data array.
  // Each idea already has a `slug` field (e.g. "poultry-farming") which
  // matches the URL pattern /ideas/[slug] used in the App Router.
  const ideaPages: MetadataRoute.Sitemap = ideas.map((idea) => ({
    url:             `${BASE_URL}/ideas/${idea.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly",  // individual guides change infrequently
    priority:        0.8,        // high priority — these are your main content pages
  }));

  // ── Combine and return ────────────────────────────────────────────────────
  // Static pages come first, then all idea detail pages.
  return [...staticPages, ...ideaPages];
}