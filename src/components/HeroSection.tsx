"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Wifi, Terminal } from "lucide-react";
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
    sources: [] as { name: string, count: number }[],
    loading: true
  });
  
  const [syncTime, setSyncTime] = useState<string | null>(null);
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
      const { data: allCases } = await supabase.from("debunks").select("id, source");

      if (allCases) {
        const total = allCases.length;
        
        const sourceCounts: Record<string, number> = {};
        allCases.forEach(c => {
          let srcName = c.source ? c.source.trim() : "Unknown";
          
          // --- FIX: Normalize messy source names ---
          const lowerName = srcName.toLowerCase();
          
          if (lowerName === "rumorscanner") {
             srcName = "RumorScanner";
          } else if (lowerName === "thedissent" || lowerName === "the dissent") {
             srcName = "The Dissent";
          }

          sourceCounts[srcName] = (sourceCounts[srcName] || 0) + 1;
        });

        const sortedSources = Object.entries(sourceCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        const topSources = sortedSources.slice(0, 4);
        const othersCount = sortedSources.slice(4).reduce((sum, s) => sum + s.count, 0);
        
        if (othersCount > 0) {
          topSources.push({ name: "Others", count: othersCount });
        }
        
        setTimeout(() => {
            setStats({ total, sources: topSources, loading: false });
        }, 600);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="relative w-full bg-slate-50 overflow-hidden selection:bg-blue-100 selection:text-blue-900 border-b border-slate-200 font-sans">
      
      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
            className="absolute w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out will-change-transform"
            style={{ left: mousePosition.x, top: mousePosition.y }}
        ></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-scanline z-0"></div>
        <div className="absolute -top-[20%] right-0 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <section className="relative z-10 pt-24 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-16">
            
            {/* --- LEFT CONTENT --- */}
            <div className={`max-w-2xl relative transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm mb-8">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                 </span>
                 <span className="flex items-center gap-1">
                    <Terminal size={10} /> SYSTEM_STATUS: ONLINE
                 </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                Generated, <br className="hidden md:block" />
                <span className="font-serif italic font-normal text-slate-400 mr-3">not</span> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-[#1e3a5f] to-emerald-600 animate-gradient-x">
                    <DecryptText text="Genuine" />
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-lg font-medium leading-relaxed">
                We monitor, verify, and visualize AI-generated misinformation in Bangladesh, providing real-time insights to support electoral integrity, research, and public awareness.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/methodology" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-xs uppercase tracking-widest text-slate-600 hover:text-[#1e3a5f] hover:border-[#1e3a5f] transition-all hover:bg-slate-50 hover:shadow-md"
                >
                  Methodology
                </Link>
              </div>
            </div>

            {/* --- RIGHT: FACT-CHECKER PILLS STACK --- */}
            <div className={`w-full lg:w-auto mt-12 lg:mt-0 perspective-1000 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <Tilt 
                tiltMaxAngleX={3} 
                tiltMaxAngleY={3} 
                perspective={1000} 
                glareEnable={false}
                className="lg:min-w-[340px]"
              >
                {/* Floating Stack of Sources */}
                <div className="flex flex-col gap-3.5 relative z-10 w-full">
                    <StatPill label="Total Records" value={stats.total} loading={stats.loading} active />
                    
                    {stats.loading ? (
                       <>
                         <StatPill label="Fetching Data..." value={0} loading={true} />
                         <StatPill label="..." value={0} loading={true} />
                       </>
                    ) : (
                       stats.sources.map((source, index) => (
                           <StatPill key={index} label={source.name} value={source.count} loading={false} />
                       ))
                    )}
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

// --- SUBCOMPONENT FOR DYNAMIC STAT PILLS ---
function StatPill({ label, value, loading, active }: { label: string, value: number, loading: boolean, active?: boolean }) {
    return (
        <div className={`flex items-center justify-between px-6 py-4 rounded-[1.25rem] font-sans transition-all duration-300 ${
            active 
                ? 'bg-[#1e293b] text-white shadow-xl shadow-slate-900/10' 
                : 'bg-white text-slate-600 shadow-sm border border-slate-100/80 hover:bg-slate-50'
        }`}>
            <span className={`font-bold text-[15px] ${active ? 'text-white' : 'text-slate-700'}`}>
                {label}
            </span>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                active 
                    ? 'bg-white/15 text-white' 
                    : 'bg-slate-100 text-slate-500'
            }`}>
                <DecryptCount value={value} loading={loading} />
            </div>
        </div>
    )
}