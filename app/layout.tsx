import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Best Business Ideas in Uganda (2026) | Start with Low Capital",
  description:
    "Discover practical business ideas in Uganda you can start with low capital. Includes poultry, liquid soap, chapati, pig farming and more with step-by-step guides.",
 verification: {
  google: "Y9d7o39Src2xSuPnkQs3a1SKd71MvXphThEY83L6-gI",
},
    keywords: [
    "business ideas Uganda",
    "small business Uganda",
    "start business Uganda",
    "low capital business Uganda",
    "how to start business Uganda",
  ],
  openGraph: {
    title: "Best Business Ideas in Uganda",
    description:
      "Explore real business ideas in Uganda with guides, capital requirements, and steps.",
    url: "https://uganda-business-ideas.vercel.app",
    siteName: "Uganda Business Ideas",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}