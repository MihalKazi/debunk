"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendChart from "@/components/TrendChart";
import DebunkFeed from "@/components/DebunkFeed";
import Methodology from "@/components/Methodology";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection />
      <TrendChart />
      <DebunkFeed />
      <Methodology />
      
      <footer className="py-20 border-t border-slate-200 bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            
            {/* Brand & Copyright */}
            <div className="flex flex-col items-center md:items-start gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                    <span className="font-serif font-bold text-xl text-white">A</span>
                 </div>
                 <span className="font-serif font-bold text-2xl tracking-tight uppercase">Archive</span>
               </div>
               <p className="text-xs text-slate-400 font-medium tracking-[0.1em]">
                 © 2024-2026 GLOBAL AI DECEPTION REPOSITORY. 
                 <span className="block mt-1 opacity-50 font-light italic">Maintaining the integrity of digital truth.</span>
               </p>
            </div>

            {/* Public Navigation */}
            <div className="flex flex-col items-center md:items-end gap-6">
              <nav className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                <a href="#methodology" className="hover:text-blue-400 transition-colors">Methodology</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Database API</a>
                <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
              </nav>
              
              <div className="h-px w-full md:w-32 bg-slate-700" />
              
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                Archive Reference: 8.4.2-Global
              </p>
            </div>

          </div>
        </div>
      </footer>
    </main>
  );
}