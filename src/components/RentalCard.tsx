'use client';

import React from 'react';
import { BedDouble, Bath, Maximize2, MapPin, KeyRound, Phone, ShieldCheck } from 'lucide-react';
import { Rental } from '@/types';
import { formatPriceINR, formatArea } from '@/lib/utils';

export function RentalCard({ rental }: { rental: Rental }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between">
      <div>
        <div className="relative h-44 bg-gradient-to-tr from-slate-800 to-emerald-950 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start z-10">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white">
              <KeyRound className="w-3 h-3 mr-1" />
              For Rent
            </span>
            {rental.furnishing && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 text-slate-200 capitalize">
                {rental.furnishing.replace('-', ' ')}
              </span>
            )}
          </div>

          <div className="z-10 text-white">
            <h4 className="font-bold text-lg leading-tight line-clamp-1">
              {rental.title || `${rental.bedroom} BHK in ${rental.locality}`}
            </h4>
            <p className="text-xs text-slate-300 capitalize flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
              {rental.locality} {rental.apartment_name ? `· ${rental.apartment_name}` : ''}
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* Price & Deposit */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-2xl font-black text-gray-900">
                {formatPriceINR(rental.price)}
              </span>
              <span className="text-xs text-gray-500 ml-1">/ month</span>
            </div>
            {rental.deposit !== undefined && (
              <div className="text-xs text-right text-gray-600">
                <span>Deposit: </span>
                <span className="font-semibold text-gray-900">{formatPriceINR(rental.deposit)}</span>
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-gray-600 text-xs">
            <div className="flex items-center space-x-1.5">
              <BedDouble className="w-4 h-4 text-emerald-600" />
              <span>{rental.bedroom} BHK</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Bath className="w-4 h-4 text-emerald-600" />
              <span>{rental.bathroom ?? rental.bedroom} Baths</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
              <span>{formatArea(rental.carpet_area)}</span>
            </div>
          </div>

          {rental.description && (
            <p className="mt-3 text-xs text-gray-500 line-clamp-2">{rental.description}</p>
          )}

          {rental.posted_by_name && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <span className="capitalize font-medium">
                {rental.posted_by || 'Owner'}: {rental.posted_by_name}
              </span>
              {rental.posted_by_contact && (
                <a
                  href={`tel:${rental.posted_by_contact}`}
                  className="inline-flex items-center text-emerald-700 font-semibold hover:underline"
                >
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
