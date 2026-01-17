import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function HeroSection() {
  const date = new Date();
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

  // 1. Fetch ALL data needed for stats (ID, Created_At, Country, Source)
  const { data: allCases } = await supabase
    .from("debunks")
    .select("id, created_at, country, source");

  // 2. Calculate Stats in Javascript
  const totalCases = allCases?.length || 0;
  
  const newCases = allCases?.filter(c => c.created_at >= firstDayOfMonth).length || 0;

  // Count unique countries (ignoring nulls)
  const uniqueCountries = new Set(
    allCases?.map(c => c.country).filter(Boolean)
  ).size;

  // Count unique partners/sources (ignoring nulls)
  const uniquePartners = new Set(
    allCases?.map(c => c.source).filter(Boolean)
  ).size;

  return (
    <>
      <section className="py-12 md:py-20 border-b border-slate-700 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/15 text-white backdrop-blur-sm">
                Research Database
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/15 text-white backdrop-blur-sm">
                Fact-Checked
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-white">
              AI-Generated Fake News Repository
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white/85 font-light">
              Tracking AI images and videos used for misinformation
            </p>
            <p className="text-base mb-8 text-white/70 leading-relaxed max-w-2xl">
              This archive documents AI-generated images and videos that have been verified by recognized fact-checking organizations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/#cases" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm bg-white text-[#1e3a5f] hover:bg-slate-100 transition-colors">
                Explore Archive
              </Link>
              <Link href="/submit" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm text-white border border-white/30 hover:bg-white/10 transition-colors">
                Submit Data
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="py-6 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
            
            {/* Total Cases */}
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {totalCases.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">Documented Cases</p>
            </div>

            {/* LIVE: Countries Covered */}
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {uniqueCountries}
              </p>
              <p className="text-sm text-slate-500">Countries Covered</p>
            </div>

            {/* LIVE: Partners */}
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {uniquePartners}
              </p>
              <p className="text-sm text-slate-500">Partners</p>
            </div>

            {/* New This Month */}
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {newCases}
              </p>
              <p className="text-sm text-slate-500">New This Month</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}