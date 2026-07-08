// app/layout.tsx
//
// Root layout — wraps every page on the site.
// WhatsAppFloat is imported here so it appears everywhere
// without needing to add it to each page manually.

import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import WhatsAppFloat from "../components/WhatsAppFloat";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const businessSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-business-sans",
  display: "swap",
});

const businessSerif = Lora({
  subsets: ["latin"],
  variable: "--font-business-serif",
  display: "swap",
});

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
      <body className={`${businessSans.variable} ${businessSerif.variable}`}>
        <nav className="sticky top-0 z-50 border-b border-brand-gold/20 bg-brand-forest px-4 py-3 shadow-sm shadow-brand-forest/10">
          <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/" className="motion-press mr-3 shrink-0 whitespace-nowrap text-sm font-black text-brand-cream">
              🇺🇬 Business <span className="text-brand-gold">Yoo</span>
            </Link>
            {[
              { href: '/ideas', label: 'Ideas' },
              { href: '/businesses', label: 'Businesses' },
              { href: '/jobs', label: 'Jobs' },
              { href: '/land', label: 'Land', highlight: true },
              { href: '/laundry', label: 'Laundry' },
              { href: '/salons', label: 'Salons' },
              { href: '/travel', label: 'Travel' },
              { href: '/apps', label: 'More' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`motion-press shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                  item.highlight
                    ? 'bg-brand-gold text-brand-forest font-bold hover:bg-brand-gold/90'
                    : 'text-brand-cream/80 hover:bg-brand-green hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}