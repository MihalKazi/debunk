"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function HeroSection() {
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    partners: 0,
    newThisMonth: 0,
    loading: true
  });

  useEffect(() => {
    async function fetchStats() {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();

      const { data: allCases } = await supabase
        .from("debunks")
        .select("id, created_at, country, source");

      if (allCases) {
        const total = allCases.length;
        const newThisMonth = allCases.filter(c => c.created_at >= firstDayOfMonth).length;
        const countries = new Set(allCases.map(c => c.country).filter(Boolean)).size;
        const partners = new Set(allCases.map(c => c.source).filter(Boolean)).size;

        setStats({ total, countries, partners, newThisMonth, loading: false });
      }
    }

    fetchStats();
  }, []);

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
              <Link href="/admin" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm text-white border border-white/30 hover:bg-white/10 transition-colors">
                Staff Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="py-6 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-slate-100">
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {stats.loading ? "..." : stats.total.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">Documented Cases</p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {stats.loading ? "..." : stats.countries}
              </p>
              <p className="text-sm text-slate-500">Countries Covered</p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {stats.loading ? "..." : stats.partners}
              </p>
              <p className="text-sm text-slate-500">Partners</p>
            </div>
            <div>
              <p className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f]">
                {stats.loading ? "..." : stats.newThisMonth}
              </p>
              <p className="text-sm text-slate-500">New This Month</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}