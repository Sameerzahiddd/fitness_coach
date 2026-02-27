import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans, Space_Mono } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FitCoach AI — Your Coach Sees Every Rep',
  description:
    'Real-time AI fitness coaching powered by Tavus Raven-1 vision. Get personalized form correction, rep counting, and fatigue detection.',
  keywords: ['AI fitness coach', 'workout', 'form correction', 'Tavus', 'personal trainer'],
  openGraph: {
    title: 'FitCoach AI',
    description: 'The only AI coach that can actually see you.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} ${spaceMono.variable} antialiased bg-bg text-white`}
      >
        {children}
      </body>
    </html>
  );
}
