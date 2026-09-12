import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FavouritesProvider } from '@/context/FavouritesContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Ivy Homes — Verified Property Portal',
  description: 'Verified real estate listings, rentals, projects, and market analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <FavouritesProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
              © 2026 Ivy Homes · Verified Real Estate, Rentals & Builder Developments · Miyapur
            </footer>
          </FavouritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
