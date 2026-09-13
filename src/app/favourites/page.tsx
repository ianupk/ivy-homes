'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Home, ArrowLeft, Loader2 } from 'lucide-react';
import { useFavourites } from '@/context/FavouritesContext';
import { useAuth } from '@/context/AuthContext';
import { PropertyCard } from '@/components/PropertyCard';

export default function FavouritesPage() {
  const { favourites, isLoading } = useFavourites();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-2">
          <Heart className="w-3.5 h-3.5 fill-red-500" />
          <span>Saved Collections</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Saved Properties
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {user ? (
            <span>
              Saved properties synced with Ivy Homes cloud for account{' '}
              <strong className="text-slate-700 font-semibold">{user.email}</strong>.
            </span>
          ) : (
            <span>
              Saved properties stored in guest mode. <Link href="/login" className="text-emerald-700 underline font-semibold">Log in</Link> to sync across your devices.
            </span>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Syncing saved properties...</p>
        </div>
      ) : favourites.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No saved listings yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the heart icon on any property card while browsing to save it to your personalized collection.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Browse Available Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((listing) => (
            <PropertyCard key={listing.listing_id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
