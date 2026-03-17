import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Best Business Ideas in Uganda",
  description:
    "Discover profitable business ideas in Uganda based on your budget, skills, and goals.",
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