"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-20 border-t border-slate-800 bg-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          {/* Brand & Logo Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              {/* Custom SVG Logo Built-in */}
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full shadow-2xl rounded-xl">
                  <rect width="200" height="200" rx="40" fill="#ffffff" fillOpacity="0.1"/>
                  <path 
                    d="M145 100C145 124.853 124.853 145 100 145C75.1472 145 55 124.853 55 100C55 75.1472 75.1472 55 100 55C118.257 55 133.951 65.8893 140.925 81.5" 
                    stroke="white" 
                    strokeWidth="15" 
                    strokeLinecap="round"
                  />
                  <path d="M145 100H100" stroke="white" strokeWidth="15" strokeLinecap="round"/>
                  {/* The Scanning Bar */}
                  <rect x="40" y="95" width="120" height="8" rx="4" fill="#60A5FA">
                    <animate attributeName="y" values="60;130;60" dur="4s" repeatCount="indefinite" />
                  </rect>
                </svg>
              </div>
              
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-tight uppercase leading-none">Generated</span>
                <span className="font-sans text-[10px] font-medium tracking-[0.3em] text-blue-400 uppercase">Not Genuine</span>
              </div>
            </div>

            <div className="text-center md:text-left mt-2">
              <p className="text-xs text-slate-400 font-medium tracking-[0.1em]">
                © 2024-2026 GNG REPOSITORY. 
              </p>
              <p className="mt-1 opacity-50 font-light italic text-[10px] text-slate-400">
                Tracking synthetic media misinformation globally.
              </p>
            </div>
          </div>

          {/* Navigation & Ref Section */}
          <div className="flex flex-col items-center md:items-end gap-6">
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              <Link href="/" className="hover:text-blue-400 transition-colors">Home Archive</Link>
              <Link href="/methodology" className="hover:text-blue-400 transition-colors">Methodology</Link>
              <Link href="/database" className="hover:text-blue-400 transition-colors">Database API</Link>
              <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy</Link>
              <a href="mailto:info@activaterights.org" className="hover:text-blue-400 transition-colors">Contact</a>
            </nav>
            
            <div className="h-px w-32 bg-slate-700/50" />
            
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
              SYSTEM-STATUS: <span className="text-emerald-500">ACTIVE</span> | REF-8.4.2
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}