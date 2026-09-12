'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Listing } from '@/types';
import { PropertyCard } from '@/components/PropertyCard';
import { ListingFilters, FilterState } from '@/components/ListingFilters';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    locality: '',
    bhk: 'all',
    min_price: '',
    max_price: '',
    furnishing: 'all',
    sort_by: 'price',
    order: 'asc',
  });

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        limit: pageSize,
        sort_by: filters.sort_by,
        order: filters.order,
      };

      if (filters.locality) params.locality = filters.locality.toLowerCase().trim();
      if (filters.bhk !== 'all') params.bhk = Number(filters.bhk);
      if (filters.min_price) params.min_price = Number(filters.min_price);
      if (filters.max_price) params.max_price = Number(filters.max_price);
      if (filters.furnishing !== 'all') params.furnishing = filters.furnishing;

      const data = await api.getListings(params);
      setListings(data.results || []);
      setTotalCount(data.total || data.results?.length || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, pageSize, filters.sort_by, filters.order, filters.locality]);

  // Defensive client-side filtering layer:
  // "Filters for locality, bedrooms, price range and furnishing must actually filter, whether or not the server helps you."
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Locality
      if (filters.locality) {
        const itemLoc = (item.locality || '').toLowerCase();
        const searchLoc = filters.locality.toLowerCase().trim();
        if (!itemLoc.includes(searchLoc)) return false;
      }

      // BHK
      if (filters.bhk !== 'all') {
        const targetBhk = Number(filters.bhk);
        if (targetBhk === 4) {
          if ((item.bedroom || 0) < 4) return false;
        } else {
          if (item.bedroom !== targetBhk) return false;
        }
      }

      // Min Price
      if (filters.min_price) {
        const minP = Number(filters.min_price);
        if (item.price < minP) return false;
      }

      // Max Price
      if (filters.max_price) {
        const maxP = Number(filters.max_price);
        if (item.price > maxP) return false;
      }

      // Furnishing
      if (filters.furnishing !== 'all') {
        const itemFurn = (item.furnishing || '').toLowerCase().replace(/\s+/g, '-');
        const searchFurn = filters.furnishing.toLowerCase().replace(/\s+/g, '-');
        if (itemFurn !== searchFurn) return false;
      }

      return true;
    });
  }, [listings, filters]);

  const handleReset = () => {
    setFilters({
      locality: '',
      bhk: 'all',
      min_price: '',
      max_price: '',
      furnishing: 'all',
      sort_by: 'price',
      order: 'asc',
    });
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || filteredListings.length) / pageSize));

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse Properties for Sale
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Displaying live verified properties. Showing {filteredListings.length} of {totalCount} total listings.
          </p>
        </div>
      </div>

      {/* Filters Component */}
      <ListingFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {/* Main Content Grid or Loading */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Loading listings from Property API...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No matching listings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try broadening your search filters or resetting them to view all available properties.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <PropertyCard key={listing.listing_id} listing={listing} />
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && filteredListings.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
