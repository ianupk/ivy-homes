'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Building,
  Compass,
  Car,
  Layers,
  Calendar,
  Phone,
  ShieldCheck,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { formatPriceINR, formatArea, formatDate } from '@/lib/utils';
import { useFavourites } from '@/context/FavouritesContext';
import { PropertyCard } from '@/components/PropertyCard';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [comparables, setComparables] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavourite, toggleFavourite } = useFavourites();

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getListingById(id);
        if (!data) {
          setError(`Listing with ID "${id}" could not be found.`);
          return;
        }
        setListing(data);

        const comps = await api.getSimilarListings(id);
        setComparables(comps.filter((c) => c.listing_id !== id));
      } catch (err: any) {
        setError(err.message || 'Failed to load listing detail');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Property Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'The requested listing does not exist.'}</p>
        <Link
          href="/listings"
          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Listings
        </Link>
      </div>
    );
  }

  const fav = isFavourite(listing.listing_id);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to listings
        </button>

        <button
          onClick={() => toggleFavourite(listing)}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition ${
            fav
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{fav ? 'Saved in Favourites' : 'Save Listing'}</span>
        </button>
      </div>

      {/* Main Listing Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {listing.is_verified && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Property
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 capitalize">
                {listing.property_type || 'Apartment'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {listing.apartment_name || `${listing.bedroom} BHK in ${listing.locality}`}
            </h1>

            <p className="text-sm text-slate-300 flex items-center capitalize">
              <MapPin className="w-4 h-4 mr-1 text-emerald-400 shrink-0" />
              {listing.locality}
            </p>
          </div>

          <div className="md:text-right shrink-0">
            <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Total Price</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">
              {formatPriceINR(Math.abs(listing.price || 0))}
            </div>
            {listing.carpet_area !== 0 && (
              <div className="text-xs text-slate-300 mt-1">
                ₹{Math.round(Math.abs(listing.price || 0) / Math.abs(listing.carpet_area || 1)).toLocaleString('en-IN')} / sq.ft carpet
              </div>
            )}
          </div>
        </div>

        {/* Property Highlights Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
              <BedDouble className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Bedrooms</span>
                <span className="font-bold text-slate-900">{listing.bedroom} BHK</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
              <Bath className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Bathrooms</span>
                <span className="font-bold text-slate-900">{listing.bathroom ?? listing.bedroom}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
              <Maximize2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Carpet Area</span>
                <span className="font-bold text-slate-900">{formatArea(listing.carpet_area)}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center space-x-3">
              <Layers className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs text-slate-500 block">Floor</span>
                <span className="font-bold text-slate-900">
                  {listing.floor ?? 'N/A'} of {listing.total_floors ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">About this Property</h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {listing.description}
              </p>
            </div>
          )}

          {/* Detailed Specifications Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">Detailed Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Furnishing</span>
                <span className="font-semibold text-slate-900 capitalize">{listing.furnishing || 'Unspecified'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Facing Direction</span>
                <span className="font-semibold text-slate-900 capitalize">{listing.facing_direction || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Covered Parking</span>
                <span className="font-semibold text-slate-900">{listing.covered_parking ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Super Built-up Area</span>
                <span className="font-semibold text-slate-900">
                  {listing.super_built_up_area ? formatArea(listing.super_built_up_area) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Posted On</span>
                <span className="font-semibold text-slate-900">{formatDate(listing.posted_at)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Property Type</span>
                {listing.project_id ? (
                  <span className="font-semibold text-emerald-700">Gated Society Project</span>
                ) : (
                  <span className="text-slate-600 font-semibold">Independent / Standalone</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Verification Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Posted By: {listing.posted_by || 'Agent'}
              </span>
              <h4 className="text-lg font-bold text-slate-900">{listing.posted_by_name || 'Verified Representative'}</h4>
              <p className="text-xs text-slate-500">Authorized contact number verified by operations team.</p>
            </div>

            {listing.posted_by_contact && (
              <a
                href={`tel:${listing.posted_by_contact}`}
                className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
              >
                <Phone className="w-4 h-4 mr-2" />
                {listing.posted_by_contact}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Comparable Listings Strip */}
      {comparables.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">You May Also Like</h2>
              <p className="text-xs text-slate-500">Similar properties in {listing.locality} within ±15% price range.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparables.slice(0, 3).map((comp) => (
              <PropertyCard key={comp.listing_id} listing={comp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
