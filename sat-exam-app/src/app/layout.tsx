import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'SAT Exam Platform',
  description: 'Giao diện thi trực tuyến cho giáo viên và học sinh',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
