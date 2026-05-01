// app/robots.ts
//
// ─── WHAT THIS FILE DOES ──────────────────────────────────────────────────────
//
// Next.js App Router automatically reads this file and generates a
// /robots.txt file. Search engine crawlers (Googlebot, Bingbot, etc.)
// read /robots.txt before crawling your site to understand which pages
// they are allowed to visit.
//
// To use it:
//   1. Save this file at:  app/robots.ts
//   2. Update BASE_URL below to your real domain (e.g. https://yourdomain.com)
//   3. Deploy — Next.js handles the rest automatically
//
// You can verify it works by visiting:  https://yourdomain.com/robots.txt
//
// ─────────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// ── Your website's base URL ───────────────────────────────────────────────────
// Must match the BASE_URL you set in app/sitemap.ts exactly.
// Do NOT include a trailing slash.
const BASE_URL = SITE_URL;

// ── Robots function ───────────────────────────────────────────────────────────
// Next.js calls this function at build time and uses the returned object
// to produce the /robots.txt file automatically.
//
// The fields mean:
//   rules       — who is allowed (or blocked) from crawling which pages
//   sitemap     — the full URL to your sitemap so Google can find all pages
//
// "userAgent: '*'" means "apply this rule to ALL search engine crawlers".
// "allow: '/'"     means "you are allowed to crawl every page on the site".

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      // Apply to all crawlers (Googlebot, Bingbot, DuckDuckBot, etc.)
      userAgent: "*",

      // Allow crawling of the entire site.
      // Every page — homepage, about, contact, and all idea detail pages —
      // will be eligible for indexing.
      allow: "/",

      // Block crawlers from any internal Next.js system routes that
      // should never appear in search results.
      // Add more paths here if you have admin pages, dashboards, etc.
      // that you want to keep out of Google.
      disallow: [
        "/api/",      // API routes — not useful as search results
        "/_next/",    // Next.js internal build files
      ],
    },

    // The full URL to your sitemap.
    // Google uses this to discover and crawl all your pages faster.
    // Must match the BASE_URL you set in app/sitemap.ts.
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
