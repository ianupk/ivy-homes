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
            Find your verified home in <span className="text-emerald-400">Miyapur</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Every listing, rental, and builder project verified with authentic carpet areas, transparent prices, and direct owner connections.
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

      {/* Miyapur Market Overview Strip */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Live Market Intelligence · Miyapur</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Miyapur Real Estate Snapshot</h2>
          </div>
          <Link
            href="/insights"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center group"
          >
            Explore Full Market Analytics
            <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Miyapur Properties</span>
            <div className="text-2xl font-black text-slate-900 mt-1">435+</div>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Verified sale inventory</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Rental Units</span>
            <div className="text-2xl font-black text-slate-900 mt-1">158+</div>
            <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Zero hidden brokerage</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">RERA Projects</span>
            <div className="text-2xl font-black text-slate-900 mt-1">56+</div>
            <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">Approved communities</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-500 font-medium">Carpet Area Rate</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹10,200</div>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Average per sq.ft</span>
          </div>
        </div>
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

      {/* Trust & Features Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Why Home Seekers Choose Ivy Homes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { title: 'Verified Physical Properties', desc: 'Every listing is physically validated with genuine floor plans, dimensions, and building data.' },
            { title: 'Defensive Smart Search', desc: 'Precision filtering across prime Miyapur communities, bedroom configurations, and budgets.' },
            { title: 'Direct Owner Connect', desc: 'Seamlessly reach verified property owners and certified representatives without middlemen.' },
            { title: 'Saved Collections', desc: 'Bookmark, compare, and organize your favorite properties with persistent account sync.' },
            { title: 'Transparent Pricing', desc: 'Honest per-sq.ft carpet area calculations with zero hidden maintenance or brokerage fees.' },
            { title: 'Data-Driven Market Intelligence', desc: 'Real-time neighborhood pricing trends, inventory distributions, and locality insights.' },
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
