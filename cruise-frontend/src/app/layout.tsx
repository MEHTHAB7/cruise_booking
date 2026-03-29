import React from 'react';
import AppProviders from '@/components/providers/AppProviders';

export const metadata = {
  title: 'OceanVoyage – Cruise Booking',
  description:
    'Book your dream cruise. Search routes, choose rooms, plan your onboard activities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}