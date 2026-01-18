"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Database, History } from "lucide-react";

export default function TrendChart() {
  const [data, setData] = useState<{ date: string; fullDate: string; total: number; critical: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUniversalHistory() {
      try {
        // 1. FETCH ALL DATA (Oldest to Newest)
        const { data: records, error } = await supabase
          .from("debunks")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;
        const rawData = records || [];

        if (rawData.length === 0) {
            setLoading(false);
            return;
        }

        // 2. DETERMINE START & END DATE
        // Start = The very first upload date found in DB
        const firstRecordDate = new Date(rawData[0].created_at || rawData[0].inserted_at);
        const today = new Date();
        
        // Ensure End Date covers "Today" (even if no uploads today)
        let endDate = today;
        
        // Ensure Start Date is at least 30 days ago (for a nice default view)
        // If data is older than 30 days, we use the real data start date.
        let startDate = firstRecordDate;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 29);

        if (startDate > thirtyDaysAgo) {
            startDate = thirtyDaysAgo;
        }

        // 3. GENERATE UNIVERSAL TIMELINE
        const processedData = [];
        const iterDate = new Date(startDate);
        
        // Safety: Limit to 5 years (approx 1800 days) to prevent browser crash
        let safetyLoop = 0;
        
        while (iterDate <= endDate && safetyLoop < 1825) {
            // Match Key: YYYY-MM-DD (Global Standard)
            const matchKey = iterDate.toISOString().split('T')[0];
            
            // Label: "Jan 18" or "Jan 18, 2024" if simpler
            const label = iterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            // Count DB matches
            const dayRecords = rawData.filter(r => {
                const rDate = new Date(r.created_at || r.inserted_at);
                return rDate.toISOString().split('T')[0] === matchKey;
            });

            processedData.push({
                date: label,
                fullDate: matchKey,
                total: dayRecords.length,
                critical: dayRecords.filter(r => r.severity === 'critical').length
            });

            // Next Day
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

  // 4. AUTO-SCROLL TO END (Latest Data)
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [loading, data]);

  // Max value for bar height scaling
  const maxValue = Math.max(...data.map(d => d.total), 1);
  const totalCases = data.reduce((acc, cur) => acc + cur.total, 0);

  if (loading) return (
    <div className="py-12 border-b border-slate-200 bg-white flex justify-center">
        <Loader2 className="animate-spin text-slate-300 w-6 h-6" />
    </div>
  );

  return (
    <section className="py-12 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2 text-[#1e3a5f]">Detection Activity</h2>
            <p className="text-sm text-slate-500 flex items-center gap-2">
                <History className="w-3 h-3" />
                Timeline: {data[0]?.date} — Today
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
             <Database className="w-3 h-3" />
             <span>{totalCases} Total Records</span>
          </div>
        </div>
        
        {/* CHART CONTAINER */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
            
            {/* SCROLLABLE AREA */}
            <div 
                ref={scrollContainerRef}
                className="overflow-x-auto pb-4 custom-scrollbar scroll-smooth"
            >
                {/* DYNAMIC WIDTH:
                   - If strict 30 days: Width is 100% (Fits screen).
                   - If 2 years data: Width is massive (Scrollable).
                */}
                <div 
                    className="flex items-end gap-1 h-64"
                    style={{ 
                        // Ensure at least 100% width, but grow if many data points
                        minWidth: data.length > 35 ? `${data.length * 24}px` : '100%' 
                    }}
                >
                    {data.map((day, i) => {
                        // Calculate Height in Pixels (Max 200px)
                        // Using Pixels is safer than % for complex flex layouts
                        const heightPx = day.total === 0 ? 4 : (day.total / maxValue) * 200; 
                        const isCritical = day.critical > 0;

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[12px]">
                                {/* THE BAR */}
                                <div 
                                    className="w-full transition-all duration-300 hover:opacity-80 rounded-t"
                                    style={{
                                        height: `${heightPx}px`,
                                        backgroundColor: day.total > 0 ? '#1e3a5f' : '#e2e8f0', // Blue vs Light Gray
                                        position: 'relative'
                                    }}
                                >
                                    {/* Red Critical Tip */}
                                    {isCritical && (
                                        <div className="absolute bottom-0 left-0 right-0 rounded-t bg-red-500" 
                                             style={{ height: '50%' }} 
                                        />
                                    )}
                                </div>

                                {/* HOVER TOOLTIP */}
                                {day.total > 0 && (
                                    <div className="hidden group-hover:block absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 shadow-xl">
                                        <div className="font-bold">{day.fullDate}</div>
                                        <div>{day.total} Cases</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Labels (Start & End) */}
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium uppercase border-t border-slate-200 pt-3">
                <span>{data[0]?.date}</span>
                <span>Today</span>
            </div>
        </div>
      </div>
    </section>
  );
}