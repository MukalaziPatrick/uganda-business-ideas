// app/layout.tsx
//
// Root layout — wraps every page on the site.
// WhatsAppFloat is imported here so it appears everywhere
// without needing to add it to each page manually.

import type { Metadata } from "next";
import "./globals.css";
import WhatsAppFloat from "../components/WhatsAppFloat";


export const metadata: Metadata = {
  title: "Uganda Business Ideas",
  description: "Practical business ideas for Ugandan entrepreneurs.",
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