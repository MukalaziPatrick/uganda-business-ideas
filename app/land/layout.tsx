// app/land/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Find Land in Uganda | Business Yoo', template: '%s | SafeLands UG' },
  description: 'Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.',
};

export default function LandLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ '--sl-green': '#2d6a4f', '--sl-green-light': '#f0faf4' } as React.CSSProperties}>
      {children}
    </div>
  );
}
