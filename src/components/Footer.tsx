"use client";

import Link from "next/link";
import { Users, ArrowUpRight } from "lucide-react"; 

export default function Footer() {
  return (
    <footer className="relative py-24 bg-[#1e3a5f] text-white overflow-hidden border-t border-[#335c85]">
      
      {/* --- BACKGROUND TEXTURE (Matches Sidebar Registry Card) --- */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      
      {/* Gradient Glow */}
      <div className="absolute -top-[50%] -right-[10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 max-w-[90rem] mx-auto px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-16 xl:gap-10">
          
          {/* --- BRAND IDENTITY --- */}
          <div className="flex flex-col items-start gap-8 max-w-md">
            <div className="flex items-center gap-6">
              {/* Logo Container */}
              <div className="relative w-16 h-16 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 drop-shadow-md">
                  <rect width="200" height="200" rx="40" fill="#ffffff" fillOpacity="0"/>
                  <path 
                    d="M145 100C145 124.853 124.853 145 100 145C75.1472 145 55 124.853 55 100C55 75.1472 75.1472 55 100 55C118.257 55 133.951 65.8893 140.925 81.5" 
                    stroke="white" 
                    strokeWidth="18" 
                    strokeLinecap="round"
                  />
                  <path d="M145 100H100" stroke="white" strokeWidth="18" strokeLinecap="round"/>
                  <rect x="40" y="95" width="120" height="10" rx="5" fill="#60A5FA">
                    <animate attributeName="y" values="60;130;60" dur="4s" repeatCount="indefinite" />
                  </rect>
                </svg>
              </div>
              
              <div className="flex flex-col">
                <span className="font-black text-3xl tracking-tighter uppercase leading-[0.8] text-white">Generated</span>
                <span className="text-[10px] font-black tracking-[0.35em] text-blue-300 uppercase mt-1.5 pl-0.5">Not Genuine</span>
              </div>
            </div>

            <div className="space-y-6">
               <p className="text-blue-100/80 font-medium text-lg leading-relaxed max-w-xs">
                 Forensic archive tracking synthetic media and digital integrity.
               </p>
               
               <div className="pt-6 border-t border-white/10">
                 <p className="text-[10px] text-blue-200/60 font-black uppercase tracking-[0.2em]">
                   System Version 1.0.4
                 </p>
                 <p className="text-[10px] text-blue-200/40 font-bold tracking-widest uppercase mt-2">
                   © 2024-2026 <a href="https://activaterights.org" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">Activate Rights</a>. All rights reserved.
                 </p>
               </div>
            </div>
          </div>

          {/* --- NAVIGATION & SYSTEM --- */}
          <div className="flex flex-col xl:items-end gap-12 w-full xl:w-auto">
            
            {/* Links */}
            <nav className="flex flex-wrap gap-x-10 gap-y-4 text-[11px] font-black uppercase tracking-[0.2em] text-blue-200/70">
              <Link href="/" className="hover:text-white transition-colors duration-300">Home</Link>
              <Link href="/methodology" className="hover:text-white transition-colors duration-300">Methodology</Link>
              <Link href="/privacy" className="hover:text-white transition-colors duration-300">Privacy Protocol</Link>
            </nav>
            
            <div className="w-full h-px bg-white/10 xl:hidden" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
                
                {/* Status Indicator */}
                <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0f233a]/50 border border-white/5 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-100 uppercase tracking-widest font-black">
                        System Active
                    </span>
                </div>

                {/* Team Module Button */}
                <Link href="/team" className="group w-full md:w-auto flex items-center justify-between gap-6 pl-6 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-xl shadow-blue-900/20">
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] text-blue-200 uppercase tracking-[0.2em] font-black mb-0.5 group-hover:text-white transition-colors">
                            Operations
                        </span>
                        <span className="text-xs font-black text-white uppercase tracking-[0.1em]">
                            About The Team
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        <ArrowUpRight size={18} className="text-white" />
                    </div>
                </Link>

            </div>

          </div>

        </div>
      </div>
    </footer>
  );
}