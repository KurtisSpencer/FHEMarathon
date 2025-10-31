import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anonymous Marathon Registration',
  description: 'Privacy-first marathon registration using FHE technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
