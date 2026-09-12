'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, KeyRound, Building2, Heart, BarChart3, User, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavourites } from '@/context/FavouritesContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loginDemo } = useAuth();
  const { favourites } = useFavourites();

  const navLinks = [
    { href: '/listings', label: 'Buy Listings', icon: Home },
    { href: '/rentals', label: 'Rentals', icon: KeyRound },
    { href: '/projects', label: 'Projects', icon: Building2 },
    { href: '/favourites', label: 'Saved', icon: Heart, count: favourites.length },
    { href: '/insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              IV
            </div>
            <div>
              <span className="font-extrabold text-xl text-gray-900 tracking-tight">Ivy Homes</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800">
                Verified Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navLinks.map(({ href, label, icon: Icon, count }) => {
              const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="ml-1.5 px-2 py-0.2 text-xs font-bold bg-emerald-600 text-white rounded-full">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 text-xs sm:text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-medium truncate max-w-[120px] sm:max-w-[160px]">{user.email}</span>
                </div>
                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex items-center space-x-1 text-xs">
                  <span className="text-gray-500">Demo Login:</span>
                  <button
                    onClick={() => loginDemo(1)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
                  >
                    User 1
                  </button>
                  <button
                    onClick={() => loginDemo(2)}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium"
                  >
                    User 2
                  </button>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="md:hidden flex border-t border-gray-200 justify-around py-2 bg-white">
        {navLinks.map(({ href, label, icon: Icon, count }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs py-1 px-2 ${
                isActive ? 'text-emerald-700 font-bold' : 'text-gray-600'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {count !== undefined && count > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 text-[10px] bg-emerald-600 text-white rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
