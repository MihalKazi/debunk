"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
// ... your other imports ...
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendChart from "@/components/TrendChart";
import DebunkFeed from "@/components/DebunkFeed";
import Methodology from "@/components/Methodology";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Home() {
  const [isStaff, setIsStaff] = useState(false);

  // Check if a session exists when the page loads
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setIsStaff(true);
    };
    checkUser();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection />
      <TrendChart />
      <DebunkFeed />
      <Methodology />
      
      <footer className="py-12 border-t border-slate-800 bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex flex-col items-center md:items-start gap-2">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
                    <span className="font-serif font-bold text-white">A</span>
                 </div>
                 <span className="font-serif font-bold text-lg tracking-tight">AIFNR</span>
               </div>
               <p className="text-sm text-slate-400">
                 © 2024-26 Global Deepfake Archive. All rights reserved.
               </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-4">
              <div className="flex gap-6 text-sm text-slate-300">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Methodology</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
              
              {/* ONLY SHOW THIS IF LOGGED IN */}
              {isStaff && (
                <Link 
                  href="/admin" 
                  className="flex items-center gap-2 text-[10px] text-emerald-400 hover:text-white transition-colors uppercase tracking-widest group border border-emerald-400/30 px-2 py-1 rounded"
                >
                  <ShieldAlert className="w-3 h-3" />
                  Staff Dashboard Active
                </Link>
              )}
            </div>
          </div>
        </div>
      </footer>
      <div className="bg-yellow-100 p-2 text-center text-xs">
  <Link href="/login" className="underline font-bold text-black">
    DEBUG: Click here to go to Login Page
  </Link>
</div>
    </main>
  );
}