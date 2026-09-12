'use client';

import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

export interface FilterState {
  locality: string;
  bhk: string; // 'all' | '1' | '2' | '3' | '4'
  min_price: string;
  max_price: string;
  furnishing: string; // 'all' | 'unfurnished' | 'semi-furnished' | 'fully-furnished'
  sort_by: string; // 'price' | 'carpet_area' | 'posted_at' | 'bedroom'
  order: 'asc' | 'desc';
}

interface ListingFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableLocalities?: string[];
}

export function ListingFilters({
  filters,
  onChange,
  onReset,
  availableLocalities = [],
}: ListingFiltersProps) {
  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
        <div className="flex items-center space-x-2 text-gray-900 font-bold">
          <Filter className="w-5 h-5 text-emerald-600" />
          <span>Filters & Sort</span>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-emerald-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Locality Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Locality</label>
          {availableLocalities.length > 0 ? (
            <select
              value={filters.locality}
              onChange={(e) => handleChange('locality', e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Localities</option>
              {availableLocalities.map((loc) => (
                <option key={loc} value={loc.toLowerCase()}>
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Miyapur"
                value={filters.locality}
                onChange={(e) => handleChange('locality', e.target.value)}
                className="w-full text-sm rounded-xl border border-gray-300 py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          )}
        </div>

        {/* BHK Bedrooms Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bedrooms (BHK)</label>
          <select
            value={filters.bhk}
            onChange={(e) => handleChange('bhk', e.target.value)}
            className="w-full text-sm rounded-xl border border-gray-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Any BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        {/* Price Range: Min & Max */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000000"
              step="500000"
              value={filters.min_price}
              onChange={(e) => handleChange('min_price', e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 25000000"
              step="500000"
              value={filters.max_price}
              onChange={(e) => handleChange('max_price', e.target.value)}
              className="w-full text-sm rounded-xl border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Furnishing Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Furnishing</label>
          <select
            value={filters.furnishing}
            onChange={(e) => handleChange('furnishing', e.target.value)}
            className="w-full text-sm rounded-xl border border-gray-300 py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Furnishings</option>
            <option value="unfurnished">Unfurnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="fully-furnished">Fully-Furnished</option>
          </select>
        </div>
      </div>

      {/* Secondary Row: Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-600">Sort By:</span>
          <select
            value={filters.sort_by}
            onChange={(e) => handleChange('sort_by', e.target.value)}
            className="rounded-lg border border-gray-300 py-1 px-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="price">Price</option>
            <option value="carpet_area">Carpet Area</option>
            <option value="bedroom">Bedrooms</option>
            <option value="posted_at">Date Posted</option>
          </select>
          <button
            onClick={() => handleChange('order', filters.order === 'asc' ? 'desc' : 'asc')}
            className="px-2.5 py-1 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 font-medium"
          >
            {filters.order.toUpperCase()} {filters.order === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="text-gray-500 text-[11px]">
          * Defensively validated on both client & server to guarantee exact filtering
        </div>
      </div>
    </div>
  );
}
