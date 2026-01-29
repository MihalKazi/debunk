"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Database, History, TrendingUp } from "lucide-react";

export default function TrendChart() {
  const [data, setData] = useState<{ date: string; fullDate: string; total: number; critical: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUniversalHistory() {
      try {
        // We now fetch occurrence_date to show historical news correctly
        const { data: records, error } = await supabase
          .from("debunks")
          .select("occurrence_date, severity")
          .order("occurrence_date", { ascending: true });

        if (error) throw error;
        const rawData = records || [];

        if (rawData.length === 0) {
          setLoading(false);
          return;
        }

        // 1. DATES: Find the oldest news date in your database
        const firstRecordDate = rawData[0].occurrence_date 
          ? new Date(rawData[0].occurrence_date) 
          : new Date();
        
        const endDate = new Date(); // Always go to today
        const processedData = [];
        const iterDate = new Date(firstRecordDate);
        
        // Safety loop set to 5000 days (~13 years of history)
        let safetyLoop = 0;
        while (iterDate <= endDate && safetyLoop < 5000) {
          const matchKey = iterDate.toISOString().split('T')[0];
          const label = iterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

          // Count news that occurred on this specific day
          const dayRecords = rawData.filter(r => r.occurrence_date === matchKey);

          processedData.push({
            date: label,
            fullDate: matchKey,
            total: dayRecords.length,
            critical: dayRecords.filter(r => r.severity?.toLowerCase() === 'critical').length
          });

          iterDate.setDate(iterDate.getDate() + 1);
          safetyLoop++;
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

  // Auto-scroll to the end (Today) so users see the most recent activity first
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [loading, data]);

  const maxValue = Math.max(...data.map(d => d.total), 1);
  const totalCases = data.reduce((acc, cur) => acc + cur.total, 0);

  if (loading) return (
    <div className="py-20 bg-white flex flex-col items-center justify-center border-b border-slate-100">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8 mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Reconstructing Timeline...</p>
    </div>
  );

  return (
    <section className="py-12 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-blue-600 w-5 h-5" />
                <h2 className="font-serif text-2xl font-bold text-[#1e3a5f]">Archive Frequency</h2>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
                <History className="w-3 h-3" />
                Historical Coverage: <span className="font-bold text-slate-700">{data[0]?.date}</span> — <span className="font-bold text-slate-700">Today</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
             <Database className="w-3 h-3 text-blue-500" />
             <span>{totalCases} Verified Entries</span>
          </div>
        </div>
        
        <div className="p-2 md:p-6 rounded-[2rem] border border-slate-200 bg-slate-50 overflow-hidden shadow-inner">
            <div 
                ref={scrollContainerRef}
                className="overflow-x-auto pb-6 pt-10 custom-scrollbar"
            >
                <div className="flex items-end gap-1 h-64 min-w-max px-4">
                    {data.map((day, i) => {
                        const heightPx = day.total === 0 ? 4 : (day.total / maxValue) * 200; 

                        return (
                            <div key={i} className="flex flex-col items-center group relative">
                                {/* Bar Styling */}
                                <div 
                                    className="w-3 md:w-5 transition-all duration-500 rounded-t-sm hover:w-6"
                                    style={{
                                        height: `${heightPx}px`,
                                        backgroundColor: day.total > 0 ? '#1e3a5f' : '#cbd5e1',
                                        opacity: day.total > 0 ? 1 : 0.3
                                    }}
                                >
                                    {day.critical > 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-red-500 animate-pulse" 
                                             style={{ height: `${(day.critical / day.total) * 100}%` }} 
                                        />
                                    )}
                                </div>

                                {/* Floating Tooltip */}
                                {day.total > 0 && (
                                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 absolute bottom-full mb-4 transition-all duration-200 bg-slate-900 text-white p-3 rounded-xl shadow-xl z-50 min-w-[120px]">
                                        <p className="text-[9px] uppercase font-black text-slate-400 mb-1">{day.fullDate}</p>
                                        <p className="text-xs font-bold">{day.total} Total Cases</p>
                                        {day.critical > 0 && <p className="text-[10px] text-red-400 font-bold">{day.critical} Critical Threats</p>}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                    </div>
                                )}

                                {/* Date markers every 15 days to keep it clean for long histories */}
                                {i % 15 === 0 && (
                                  <div className="absolute top-full mt-3 flex flex-col items-center">
                                    <div className="w-px h-2 bg-slate-300 mb-1"></div>
                                    <span className="text-[8px] text-slate-400 font-black uppercase rotate-45 origin-left whitespace-nowrap">
                                        {day.date}
                                    </span>
                                  </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-between mt-12 text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] border-t border-slate-200/60 pt-4 px-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-[#1e3a5f] rounded-full"></div> Archive Start</span>
                <span className="flex items-center gap-2">Live Timeline <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div></span>
            </div>
        </div>
      </div>
    </section>
  );
}