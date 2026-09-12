'use client';

import React from 'react';
import { Building2, Layers, Calendar, CheckCircle, Tag } from 'lucide-react';
import { Project } from '@/types';
import { formatPriceINR, formatArea } from '@/lib/utils';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between">
      <div>
        <div className="relative h-44 bg-gradient-to-tr from-slate-900 to-slate-800 p-4 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90">
              <Building2 className="w-3 h-3 mr-1" />
              Project
            </span>
            {project.project_status && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm capitalize">
                {project.project_status}
              </span>
            )}
          </div>

          <div>
            <h4 className="font-bold text-lg leading-tight line-clamp-1">
              {project.apartment_name}
            </h4>
            <p className="text-xs text-slate-300 mt-1 capitalize">
              By {project.developer_name || 'Reputed Builder'} · {project.locality}
            </p>
          </div>
        </div>

        <div className="p-5">
          {/* Price Range */}
          <div className="mb-3">
            <span className="text-xs text-gray-500 block">Price Range</span>
            <span className="text-xl font-black text-gray-900">
              {formatPriceINR(project.price_min)} - {formatPriceINR(project.price_max)}
            </span>
          </div>

          {/* Area & Unit Specs */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-xs text-gray-600">
            <div>
              <span className="text-gray-400 block">Carpet Area Range</span>
              <span className="font-semibold text-gray-800">
                {formatArea(project.min_area_sqft || 0)} - {formatArea(project.max_area_sqft || 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Total Units / Listings</span>
              <span className="font-semibold text-gray-800">
                {project.total_units || 'N/A'} units ({project.total_listings ?? 0} active)
              </span>
            </div>
          </div>

          {/* RERA & Dates */}
          <div className="mt-3 space-y-1.5 text-xs text-gray-500">
            {project.rera_number && (
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">RERA: {project.rera_number}</span>
              </div>
            )}
            {project.possession_date && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Possession: {project.possession_date}</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {project.amenities && project.amenities.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
              {project.amenities.slice(0, 4).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] capitalize"
                >
                  {amenity}
                </span>
              ))}
              {project.amenities.length > 4 && (
                <span className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-400 text-[11px]">
                  +{project.amenities.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
