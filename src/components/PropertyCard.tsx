'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, BedDouble, Bath, Maximize2, MapPin, Building, ShieldCheck } from 'lucide-react';
import { Listing } from '@/types';
import { formatPriceINR, formatArea } from '@/lib/utils';
import { useFavourites } from '@/context/FavouritesContext';

export function PropertyCard({ listing }: { listing: Listing }) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const fav = isFavourite(listing.listing_id);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Card Header & Badges */}
        <div className="relative h-48 bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
          
          <div className="text-center z-10 text-white px-3">
            <Building className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-80" />
            <h4 className="font-bold text-lg leading-snug line-clamp-1">
              {listing.apartment_name || `${listing.bedroom} BHK in ${listing.locality}`}
            </h4>
            <p className="text-xs text-slate-300 capitalize flex items-center justify-center mt-1">
              <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
              {listing.locality}
            </p>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 z-20">
            {listing.is_verified && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-sm text-white shadow-sm">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-sm text-slate-200 capitalize">
              {listing.property_type || 'Apartment'}
            </span>
          </div>

          {/* Favourite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavourite(listing);
            }}
            aria-label="Save listing"
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-red-500 shadow-md backdrop-blur-sm transition z-20"
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5">
          {/* Price & Rate */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {formatPriceINR(listing.price)}
              </span>
              {listing.carpet_area > 0 && (
                <span className="text-xs text-gray-500 ml-2">
                  ₹{Math.round(listing.price / listing.carpet_area).toLocaleString('en-IN')}/sq.ft
                </span>
              )}
            </div>
            {listing.furnishing && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">
                {listing.furnishing.replace('-', ' ')}
              </span>
            )}
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-gray-600 text-xs">
            <div className="flex items-center space-x-1.5">
              <BedDouble className="w-4 h-4 text-emerald-600" />
              <span>{listing.bedroom} Bedrooms</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-emerald-600" />
              <span>{listing.bathroom ?? listing.bedroom} Baths</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>{formatArea(listing.carpet_area)}</span>
            </div>
          </div>

          {/* Description Snippet */}
          {listing.description && (
            <p className="mt-3 text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {listing.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5 pt-1">
        <Link
          href={`/listings/${listing.listing_id}`}
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
        >
          View Full Details
        </Link>
      </div>
    </div>
  );
}
