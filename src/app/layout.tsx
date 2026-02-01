import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Feedback Hub - Product Feedback Aggregation',
  description: 'Aggregate and analyze product feedback from multiple sources using AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
