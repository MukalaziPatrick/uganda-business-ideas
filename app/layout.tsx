// app/layout.tsx
//
// Root layout — wraps every page on the site.
// WhatsAppFloat is imported here so it appears everywhere
// without needing to add it to each page manually.

import type { Metadata } from "next";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import WhatsAppFloat from "../components/WhatsAppFloat";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const defaultTitle = `${SITE_NAME} — Business Ideas & Directory for Uganda`;
const defaultDescription =
  "Discover profitable business ideas, step-by-step startup guides, and find real local businesses across Uganda. Free, beginner-friendly, and built for Ugandans.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  keywords: ["business ideas Uganda", "start a business Uganda", "Uganda entrepreneur", "small business Uganda", "Business Yoo"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "Y9d7o39Src2xSuPnkQs3a1SKd71MvXphThEY83L6-gI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">
            <a href="/" className="font-bold text-[#2d6a4f] text-sm shrink-0 mr-3">Business Yoo</a>
            {[
              { href: '/ideas', label: 'Ideas' },
              { href: '/businesses', label: 'Businesses' },
              { href: '/jobs', label: 'Jobs' },
              { href: '/salons', label: 'Salons' },
              { href: '/travel', label: 'Travel' },
              { href: '/land', label: 'Land', highlight: true },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`shrink-0 text-sm px-3 py-1.5 rounded-full transition-colors ${
                  item.highlight
                    ? 'bg-[#2d6a4f] text-white font-medium hover:bg-[#1e4d38]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}