import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Second Opinion | Prescription Safety Verification System (Pakistan)',
  description: 'AI & Rule-Based prescription safety verification app for Pakistan. Catch illegibility, dosage errors & dangerous drug interactions before dispensing.',
  keywords: ['prescription safety', 'Pakistan pharmacy', 'OCR drug matching', 'drug interaction checker', 'bilingual health app'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
