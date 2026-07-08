// app/land/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Find Land in Uganda | Business Yoo', template: '%s | SafeLands UG' },
  description: 'Browse verified plots across Uganda — inspect visually, check the title, and connect with a certified agent.',
};

export default function LandLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ '--sl-green': 'var(--land-primary)', '--sl-green-light': 'var(--land-cream)' } as React.CSSProperties}>
      {children}
    </div>
  );
}
