"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Database, Globe, ShieldCheck, Activity, Server, Cpu, Wifi, Terminal } from "lucide-react";
import Tilt from 'react-parallax-tilt';

// --- 1. DECRYPT TEXT COMPONENT ---
const DecryptText = ({ text, className }: { text: string, className?: string }) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const animate = () => {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText(prev => 
        text.split("").map((letter, index) => {
          if (index < iteration) return text[index];
          return letters[Math.floor(Math.random() * 26)];
        }).join("")
      );
      if (iteration >= text.length) if (intervalRef.current) clearInterval(intervalRef.current);
      iteration += 1 / 3;
    }, 30);
  };
  
  // Trigger on mount and hover
  useEffect(() => { animate(); return () => { if(intervalRef.current) clearInterval(intervalRef.current); } }, []);
  
  return <span onMouseEnter={animate} className={`cursor-default ${className}`}>{displayText}</span>;
};

// --- 2. NUMBER COUNTER UTILITY ---
const DecryptCount = ({ value, loading }: { value: number, loading: boolean }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (loading) return;
    let start = 0;
    const end = value;
    const duration = 1500;
    const incrementTime = 30;
    const stepValue = end / (duration / incrementTime);
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start + Math.random() * (end * 0.1))); 
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, loading]);

  return <span>{loading ? "000" : displayValue.toLocaleString()}</span>;
};

export default function HeroSection() {
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    partners: 0,
    newThisMonth: 0,
    loading: true
  });
  
  const [syncTime, setSyncTime] = useState<string | null>(null);

  // Mouse position for spotlight effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    setSyncTime(new Date().toLocaleTimeString());

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      const date = new Date();
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
      const { data: allCases } = await supabase.from("debunks").select("id, created_at, country, source");

      if (allCases) {
        const total = allCases.length;
        const newThisMonth = allCases.filter(c => c.created_at >= firstDayOfMonth).length;
        const countries = new Set(allCases.map(c => c.country).filter(Boolean)).size;
        const partners = new Set(allCases.map(c => c.source).filter(Boolean)).size;
        
        setTimeout(() => {
            setStats({ total, countries, partners, newThisMonth, loading: false });
        }, 600);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="relative w-full bg-slate-50 overflow-hidden selection:bg-blue-100 selection:text-blue-900 border-b border-slate-200 font-sans">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Mouse Spotlight */}
        <div 
            className="absolute w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out will-change-transform"
            style={{ left: mousePosition.x, top: mousePosition.y }}
        ></div>

        {/* Tech Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-scanline z-0"></div>

        {/* Static Ambient Blobs */}
        <div className="absolute -top-[20%] right-0 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <section className="relative z-10 pt-24 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16">
            
            {/* --- LEFT CONTENT --- */}
            <div className={`max-w-2xl relative transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm mb-8">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                 </span>
                 <span className="flex items-center gap-1">
                    <Terminal size={10} /> SYSTEM_STATUS: ONLINE
                 </span>
              </div>

              {/* HEADLINE */}
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                Generated, <br className="hidden md:block" />
                <span className="font-serif italic font-normal text-slate-400 mr-3">not</span> 
                {/* Gradient Text + Decrypt Effect */}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-[#1e3a5f] to-emerald-600 animate-gradient-x">
                    <DecryptText text="Genuine" />
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg font-medium leading-relaxed">
                The global clearinghouse for synthetic media. We verify, archive, and debunk AI-generated deception using forensic data analysis.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/about" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-[#1e3a5f] hover:border-[#1e3a5f] transition-all hover:bg-slate-50 hover:shadow-md"
                >
                  Methodology
                </Link>
              </div>
            </div>

            {/* --- RIGHT: 3D STATS CARD --- */}
            <div className={`w-full lg:w-auto mt-12 lg:mt-0 perspective-1000 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <Tilt 
                tiltMaxAngleX={3} 
                tiltMaxAngleY={3} 
                perspective={1000} 
                glareEnable={true} 
                glareMaxOpacity={0.15}
                glareColor="#ffffff"
                className="lg:min-w-[360px]"
              >
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 ring-1 ring-slate-900/5 relative overflow-hidden">
                    
                    {/* Decorative Blob inside card */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100/60 relative z-10">
                        <div className="flex items-center gap-3">
                           <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                                <Server size={20} />
                           </div>
                           <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Repository</p>
                               <p className="text-[10px] font-semibold text-slate-400">Live Metrics</p>
                           </div>
                        </div>
                        <Activity size={20} className="text-emerald-500 animate-pulse" />
                    </div>

                    {/* Stats */}
                    <div className="space-y-6 relative z-10">
                        <StatRow label="Indexed Records" value={stats.total} loading={stats.loading} icon={<Database size={16} />} />
                        <StatRow label="Global Regions" value={stats.countries} loading={stats.loading} icon={<Globe size={16} />} />
                        <StatRow label="Verifiers" value={stats.partners} loading={stats.loading} icon={<ShieldCheck size={16} />} />
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-100/60 flex justify-between items-center relative z-10">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                             <Cpu size={14} className="text-slate-400" />
                             <span className="text-[10px] font-bold text-slate-500 uppercase">Idle</span>
                          </div>
                          <div className="text-right">
                             <span className="block text-xl font-black text-blue-600 leading-none">
                                +<DecryptCount value={stats.newThisMonth} loading={stats.loading} />
                             </span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">New this Month</span>
                          </div>
                    </div>
                </div>
              </Tilt>
            </div>
          </div>
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="mt-24 border-t border-slate-200 bg-white/40 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono font-medium text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <Wifi size={12} className="text-emerald-500" /> 
                            Signal: Stable
                        </span>
                        <span className="hidden md:inline">Latency: 24ms</span>
                        <span className="hidden md:inline">Server: ASIA-SE1</span>
                    </div>
                    <div className="flex items-center gap-6">
                         <span>Last Sync: {syncTime || "Connecting..."}</span>
                         <span className="text-slate-300">|</span>
                         <span>Encrypted: TLS 1.3</span>
                    </div>
                </div>
            </div>
        </div>

      </section>

      {/* --- ANIMATIONS --- */}
      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}

// --- SUBCOMPONENT ---

function StatRow({ label, value, loading, icon }: { label: string, value: number, loading: boolean, icon: any }) {
    return (
        <div className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors duration-300">
                    {icon}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-700 transition-colors">{label}</span>
            </div>
            <span className="text-xl font-black text-slate-800 font-mono tracking-tight">
                <DecryptCount value={value} loading={loading} />
            </span>
        </div>
    )
}