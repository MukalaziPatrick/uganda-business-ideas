// app/layout.tsx
//
// Root layout — wraps every page on the site.
// WhatsAppFloat is imported here so it appears everywhere
// without needing to add it to each page manually.

import type { Metadata } from "next";
import "./globals.css";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Floating WhatsApp button — visible on every page */}
        <WhatsAppFloat />
      </body>
    </html>
  );
}