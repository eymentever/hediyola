import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

// Premium type pairing per PRD §3: Playfair Display headers + Inter body.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://hediyola.com'),
  title: {
    default: 'Hediyola — Düğün Hediye Listesi',
    template: '%s · Hediyola',
  },
  description:
    'Hediyola ile düğününüz için zarif bir hediye listesi oluşturun: katalog hediyeleri, balayı fonları ve nakit katkılar tek bir yerde.',
  openGraph: {
    title: 'Hediyola',
    description: 'Premium düğün hediye listesi platformu.',
    url: 'https://hediyola.com',
    siteName: 'Hediyola',
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
