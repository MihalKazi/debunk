"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Database, Activity, Calendar } from "lucide-react";

// CONFIGURATION
const ITEM_WIDTH = 86; 
const GRAPH_HEIGHT = 220; 
const CONTAINER_HEIGHT = 360; 
const DAYS_TO_SHOW = 90; 

export default function TrendChart() {
  const [data, setData] = useState<{ date: string; fullDate: string; total: number; critical: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUniversalHistory() {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - DAYS_TO_SHOW);

        const { data: records, error } = await supabase
          .from("debunks")
          .select("occurrence_date, severity")
          .gte("occurrence_date", startDate.toISOString())
          .order("occurrence_date", { ascending: true });

        if (error) throw error;
        const rawData = records || [];

        const processedData = [];
        const iterDate = new Date(startDate);
        
        while (iterDate <= endDate) {
          const matchKey = iterDate.toISOString().split('T')[0];
          const label = iterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          const dayRecords = rawData.filter(r => r.occurrence_date === matchKey);

          processedData.push({
            date: label,
            fullDate: matchKey,
            total: dayRecords.length,
            critical: dayRecords.filter(r => r.severity?.toLowerCase() === 'critical').length
          });

          iterDate.setDate(iterDate.getDate() + 1);
        }

        setData(processedData);
      } catch (err) {
        console.error("Chart Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUniversalHistory();
  }, []);

  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [loading, data]);

  const maxValue = useMemo(() => Math.max(...data.map(d => d.total), 5), [data]);
  const totalCases = useMemo(() => data.reduce((acc, cur) => acc + cur.total, 0), [data]);

  const { linePath, areaPath } = useMemo(() => {
    if (data.length === 0) return { linePath: "", areaPath: "" };

    const points = data.map((d, i) => {
      const x = (i * ITEM_WIDTH) + (ITEM_WIDTH / 2);
      const height = (d.total / maxValue) * (GRAPH_HEIGHT - 30);
      const y = GRAPH_HEIGHT - height;
      return `${x},${y}`;
    });

    const lineStr = `M ${points.join(" L ")}`;
    const areaStr = `${lineStr} L ${points.length * ITEM_WIDTH - (ITEM_WIDTH/2)},${GRAPH_HEIGHT} L ${ITEM_WIDTH/2},${GRAPH_HEIGHT} Z`;

    return { linePath: lineStr, areaPath: areaStr };
  }, [data, maxValue]);


  if (loading) return (
    <div className="py-24 bg-white flex flex-col items-center justify-center border-b border-slate-100 min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-6" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Calibrating Timeline...</p>
    </div>
  );

  return (
    <section className="py-16 border-b border-slate-200 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                    <Activity className="w-5 h-5" />
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">Trend Velocity</h2>
            </div>
            <p className="text-sm text-slate-500 font-medium max-w-lg leading-relaxed">
                Analysis of the last 90 days. Peaks indicate high-volume disinformation events.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-right">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">90-Day Volume</span>
                 <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-500" />
                    <span className="text-2xl font-black text-slate-900 leading-none">{totalCases}</span>
                 </div>
             </div>
          </div>
        </div>
        
        {/* Chart Container */}
        <div className="relative rounded-[2rem] border border-slate-200 bg-slate-50/50 shadow-sm overflow-hidden flex flex-col">
            
            {/* Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-30 h-[260px]">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="absolute w-full border-t border-dashed border-slate-300" style={{ top: `${i * 20}%` }}></div>
                ))}
            </div>

            <div 
                ref={scrollContainerRef}
                className="overflow-x-auto overflow-y-hidden custom-scrollbar relative z-10 flex-1 px-12 pt-12 pb-14"
                style={{ height: `${CONTAINER_HEIGHT}px` }}
            >
                <div 
                    className="relative h-full"
                    style={{ 
                        width: `${Math.max(data.length * ITEM_WIDTH, 100)}px`, 
                        minWidth: '100%',
                        height: `${GRAPH_HEIGHT}px`
                    }}
                >
                    {/* --- GLOWING LINE LAYER --- */}
                    <svg 
                        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-visible"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                            {/* SVG Filter for that 'Joss' Neon Glow */}
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* Area Fill */}
                        <path d={areaPath} fill="url(#areaGradient)" />
                        
                        {/* THE GLOWING LINE */}
                        {/* 1. Blur Layer (Outer Glow) */}
                        <path 
                            d={linePath} 
                            fill="none" 
                            stroke="#60a5fa" 
                            strokeWidth="6" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="opacity-30 blur-sm"
                        />
                        {/* 2. Main Line (Sharp & Bright) */}
                        <path 
                            d={linePath} 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            style={{ filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))" }}
                        />
                    </svg>

                    {/* Bars */}
                    <div className="absolute inset-0 flex items-end">
                        {data.map((day, i) => {
                            const isZero = day.total === 0;
                            const heightPx = (day.total / maxValue) * (GRAPH_HEIGHT - 30);
                            const showLabel = i % 14 === 0 || day.date.includes("1 ");

                            return (
                                <div 
                                    key={i} 
                                    className="relative flex flex-col justify-end items-center group cursor-crosshair transition-colors duration-200 h-full hover:bg-white/60"
                                    style={{ width: `${ITEM_WIDTH}px` }}
                                >
                                    {/* Bar */}
                                    <div 
                                        className={`w-3 rounded-t-sm transition-all duration-300 relative z-0 ${isZero ? 'h-1 bg-slate-200' : 'bg-slate-300/80 group-hover:bg-blue-400 group-hover:w-4'}`}
                                        style={{ height: isZero ? '4px' : `${heightPx}px` }}
                                    >
                                        {day.critical > 0 && (
                                            <div 
                                                className="absolute bottom-0 left-0 w-full bg-red-400/80 rounded-sm"
                                                style={{ height: `${(day.critical / day.total) * 100}%` }}
                                            />
                                        )}
                                    </div>

                                    {/* Hover Dot - Now Glows too! */}
                                    {day.total > 0 && (
                                        <div 
                                            className="absolute w-3 h-3 rounded-full bg-white border-[3px] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-200 z-20"
                                            style={{ bottom: `${heightPx - 6}px` }} 
                                        ></div>
                                    )}

                                    {/* Tooltip */}
                                    <div className="pointer-events-none opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 absolute bottom-[70%] left-1/2 -translate-x-1/2 z-50">
                                        <div className="bg-slate-900/95 backdrop-blur text-white p-3 rounded-xl shadow-2xl border border-white/10 min-w-[140px] text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2 pb-2 border-b border-white/20">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-300 whitespace-nowrap">{day.fullDate}</p>
                                            </div>
                                            <div className="flex justify-between items-center text-xs px-2 mb-1">
                                                <span className="text-slate-400 font-medium">Cases</span>
                                                <span className="font-bold text-lg text-blue-400">{day.total}</span>
                                            </div>
                                        </div>
                                        <div className="w-3 h-3 bg-slate-900/95 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-white/10"></div>
                                    </div>

                                    {/* Date Label */}
                                    {showLabel && (
                                        <div className="absolute -bottom-6 flex flex-col items-center">
                                            <div className="w-px h-2 bg-slate-400 mb-1"></div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">
                                                {day.date.split(' ')[0]} {day.date.split(' ')[1]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Footer Legend */}
            <div className="h-10 border-t border-slate-200 bg-white/50 flex items-center justify-between px-8 text-[10px] uppercase font-bold text-slate-400 relative z-20">
               <span>Interactive Timeline</span>
               <div className="flex gap-6">
                  <span className="flex items-center gap-1.5"><div className="w-4 h-1 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] rounded-full"></div> 90-Day Trend</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Daily Volume</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-red-400 rounded-sm"></div> Critical</span>
               </div>
            </div>
        </div>
      </div>
    </section>
  );
}