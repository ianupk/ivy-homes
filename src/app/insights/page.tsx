'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatPriceINR } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Building,
  ShieldCheck,
  CheckCircle2,
  Home,
  KeyRound,
  Building2,
  Loader2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

interface MarketStats {
  city: string;
  totalListings: number;
  activeListings?: number;
  totalRentals: number;
  totalProjects: number;
  medianPrice: number;
  medianPricePerSqft: number;
  byLocality: Array<{ name: string; medianPrice: number; count: number }>;
  byBhk: Array<{ name: string; value: number }>;
}

export default function InsightsPage() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoading(true);
      try {
        const [listingsRes, rentalsRes, projectsRes, summaryRes] = await Promise.allSettled([
          api.getListings({ limit: 200 }),
          api.getRentals({ limit: 100 }),
          api.getProjects({ limit: 100 }),
          api.getAnalyticsSummary(),
        ]);

        const listingsData = listingsRes.status === 'fulfilled' ? listingsRes.value : { total: 0, results: [] };
        const rentalsData = rentalsRes.status === 'fulfilled' ? rentalsRes.value : { total: 0, results: [] };
        const projectsData = projectsRes.status === 'fulfilled' ? projectsRes.value : { total: 0, results: [] };
        const summaryData = summaryRes.status === 'fulfilled' ? summaryRes.value : null;

        const allListings = listingsData.results || [];

        if (summaryData && summaryData.total_listings) {
          setStats({
            city: summaryData.city || 'Miyapur',
            totalListings: summaryData.total_listings,
            activeListings: summaryData.total_listings,
            totalRentals: rentalsData.total || 0,
            totalProjects: projectsData.total || 0,
            medianPrice: summaryData.median_price,
            medianPricePerSqft: summaryData.median_price_per_sqft,
            byLocality: (summaryData.by_locality || []).map((l) => ({
              name: l.locality.charAt(0).toUpperCase() + l.locality.slice(1),
              medianPrice: Math.round(l.median_price / 100000),
              count: l.count,
            })),
            byBhk: (summaryData.by_bhk || []).map((b) => ({
              name: `${b.bedroom} BHK`,
              value: b.count,
            })),
          });
        } else {
          const validPrices = allListings
            .map((l) => l.price)
            .filter((p) => typeof p === 'number' && p > 0)
            .sort((a, b) => a - b);

          const mid = Math.floor(validPrices.length / 2);
          const medianPrice =
            validPrices.length > 0
              ? validPrices.length % 2 !== 0
                ? validPrices[mid]
                : Math.round((validPrices[mid - 1] + validPrices[mid]) / 2)
              : 0;

          const validSqftRates = allListings
            .filter((l) => l.price > 0 && l.carpet_area > 0)
            .map((l) => l.price / l.carpet_area)
            .sort((a, b) => a - b);

          const sqftMid = Math.floor(validSqftRates.length / 2);
          const medianPricePerSqft =
            validSqftRates.length > 0 ? Math.round(validSqftRates[sqftMid]) : 0;

          const localityMap = new Map<string, { prices: number[]; count: number }>();
          allListings.forEach((l) => {
            if (l.locality) {
              const loc = l.locality.toLowerCase().trim();
              const existing = localityMap.get(loc) || { prices: [], count: 0 };
              existing.count += 1;
              if (l.price > 0) existing.prices.push(l.price);
              localityMap.set(loc, existing);
            }
          });

          const byLocality = Array.from(localityMap.entries())
            .map(([loc, data]) => {
              data.prices.sort((a, b) => a - b);
              const m = Math.floor(data.prices.length / 2);
              const med = data.prices.length > 0 ? data.prices[m] : 0;
              return {
                name: loc.charAt(0).toUpperCase() + loc.slice(1),
                medianPrice: Math.round(med / 100000),
                count: data.count,
              };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);

          const bhkMap = new Map<number, number>();
          allListings.forEach((l) => {
            const bhk = l.bedroom || 1;
            bhkMap.set(bhk, (bhkMap.get(bhk) || 0) + 1);
          });

          const byBhk = Array.from(bhkMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([bedroom, count]) => ({
              name: `${bedroom} BHK`,
              value: count,
            }));

          const activeCount = allListings.filter((l) => l.is_live === true).length;

          setStats({
            city: 'Hyderabad',
            totalListings: listingsData.total || allListings.length,
            activeListings: activeCount,
            totalRentals: rentalsData.total || (rentalsData.results || []).length,
            totalProjects: projectsData.total || (projectsData.results || []).length,
            medianPrice,
            medianPricePerSqft,
            byLocality,
            byBhk,
          });
        }
      } catch (e) {
        console.error('Failed to load market intelligence', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadMarketData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Analyzing live market intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{stats?.city || 'Hyderabad'} Real Estate Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Market Trends & Housing Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time aggregated valuation metrics, inventory volumes, and neighborhood pricing trends.
        </p>
      </div>

      {/* Top Aggregates KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>City Market</span>
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 capitalize">{stats?.city || 'Hyderabad'}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Live City-Wide Coverage</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Sale Listings</span>
            <Home className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {(stats?.activeListings || stats?.totalListings || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {(stats?.totalListings || 0).toLocaleString('en-IN')} total registered properties
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Market Median Price</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {formatPriceINR(stats?.medianPrice || 0)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Residential sales median</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Carpet Rate</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ₹{(stats?.medianPricePerSqft || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Average per sq.ft carpet</span>
        </div>
      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">Verified Rental Inventory</span>
              <p className="text-xs text-blue-800">Clear deposit terms & zero brokerage options</p>
            </div>
          </div>
          <div className="text-xl font-black text-blue-900">
            {(stats?.totalRentals || 0).toLocaleString('en-IN')} Units
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wider">RERA Builder Developments</span>
              <p className="text-xs text-purple-800">Approved communities & launch schedules</p>
            </div>
          </div>
          <div className="text-xl font-black text-purple-900">
            {(stats?.totalProjects || 0).toLocaleString('en-IN')} Projects
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Median Price by Locality */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Median Price by Prime Locality (in ₹ Lakhs)</h3>
            <span className="text-xs text-slate-400">Current Market</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.byLocality || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Median Price']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="medianPrice" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bedroom (BHK) Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Inventory by Bedroom Configuration (BHK)</h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.byBhk || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {(stats?.byBhk || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Properties`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Market Standards Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Ivy Homes Verification Standards
            </h2>
            <p className="text-xs text-slate-500">
              How our property evaluation engine protects home seekers across {stats?.city || 'Hyderabad'}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Authentic Carpet Area Measurements</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every property features verified interior carpet areas. We eliminate artificial loading factors so you know the exact livable space before visiting.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-blue-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Verified Seller Contacts</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              We verify owner and builder representatives directly to filter out duplicated listings and spam calls, ensuring clean communication for buyers and tenants.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-purple-800 font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>RERA Registered Communities</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              All multi-unit residential projects include active RERA tracking, validated completion timelines, and builder track records for peace of mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
