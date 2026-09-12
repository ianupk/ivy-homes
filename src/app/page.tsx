import Link from 'next/link';
import { Home, KeyRound, Building2, BarChart3, ShieldCheck, Search, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Honest & Verified Real Estate Data</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Find your verified home in <span className="text-emerald-400">Bangalore</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Directly synced with the Ivy Homes Property API. Every listing, rental, and builder project verified with true carpet areas, transparent prices, and data integrity checks.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/listings"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Sale Listings
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm transition-all"
            >
              <BarChart3 className="w-4 h-4 mr-2 text-emerald-400" />
              Explore Market Insights
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
      </section>

      {/* Feature Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/listings"
          className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Home className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1 flex items-center justify-between">
            Buy Homes
            <ArrowRight className="w-4 h-4 text-emerald-600 transform group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Verified residential apartments and villas with full bedroom, bathroom, floor, and locality filters.
          </p>
        </Link>

        <Link
          href="/rentals"
          className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1 flex items-center justify-between">
            Verified Rentals
            <ArrowRight className="w-4 h-4 text-blue-600 transform group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Clear monthly rents, deposit amounts, and direct verified owner contact lines without hidden commissions.
          </p>
        </Link>

        <Link
          href="/projects"
          className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1 flex items-center justify-between">
            Builder Projects
            <ArrowRight className="w-4 h-4 text-purple-600 transform group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            RERA registered residential towers, launch dates, possession schedules, and live available units.
          </p>
        </Link>
      </section>

      {/* Six Requirements Checklist Banner */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Engineering Core Verification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { title: '1. Authentication', desc: 'Real session flow surviving reload & active after 30+ minutes.' },
            { title: '2. Browse Listings', desc: 'Defensive filtering for locality, BHK, price range, and furnishing.' },
            { title: '3. Listing Detail', desc: 'Individual listing route reachable directly by URL with comparables.' },
            { title: '4. Saved Listings', desc: 'Add/remove saved listings per user with persistent storage.' },
            { title: '5. Rentals & Projects', desc: 'Accurate units, rupees, and sqft area computations.' },
            { title: '6. Insights Screen', desc: 'Visualizes /v1/analytics/summary plus data discoveries & anomalies.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 block">{item.title}</span>
                <span className="text-xs text-slate-500 leading-normal">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
