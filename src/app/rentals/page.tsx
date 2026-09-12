'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Rental } from '@/types';
import { RentalCard } from '@/components/RentalCard';
import { Loader2, AlertCircle, KeyRound, Search } from 'lucide-react';

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localitySearch, setLocalitySearch] = useState(process.env.NEXT_PUBLIC_IVY_ASSIGNED_LOCALITY || 'Miyapur');
  const [bhkFilter, setBhkFilter] = useState('all');

  useEffect(() => {
    const fetchRentals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = { limit: 100 };
        if (localitySearch) {
          params.locality = localitySearch.toLowerCase().trim();
        }
        const data = await api.getRentals(params);
        setRentals(data.results || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load rental properties');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRentals();
  }, [localitySearch]);

  const filteredRentals = rentals.filter((r) => {
    if (localitySearch && !r.locality.toLowerCase().includes(localitySearch.toLowerCase().trim())) {
      return false;
    }
    if (bhkFilter !== 'all' && r.bedroom !== Number(bhkFilter)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Direct Owner Verified Rentals</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Browse Verified Rental Properties
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Showing verified rentals in {localitySearch || 'all localities'} with transparent monthly rent, deposit terms, and authentic carpet areas.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-[200px] items-center space-x-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Locality:</label>
          <select
            value={localitySearch.toLowerCase().trim()}
            onChange={(e) => setLocalitySearch(e.target.value)}
            className="w-full text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
          >
            <option value="">All Localities</option>
            {[
              'Miyapur',
              'Banjara Hills',
              'Gachibowli',
              'Jubilee Hills',
              'Kompally',
              'Kondapur',
              'Kukatpally',
              'Madhapur',
              'Manikonda',
              'Nallagandla',
            ].map((loc) => {
              const val = loc.toLowerCase();
              const isAssigned = val === 'miyapur';
              return (
                <option key={loc} value={val}>
                  {loc} {isAssigned ? '★ (Assigned)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-600">Bedrooms:</span>
          <select
            value={bhkFilter}
            onChange={(e) => setBhkFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All BHKs</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading rental properties...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No rental properties matched your filter</h3>
          <p className="text-xs text-slate-500">Try clearing the search or BHK filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRentals.map((rental) => (
            <RentalCard key={rental.listing_id} rental={rental} />
          ))}
        </div>
      )}
    </div>
  );
}
