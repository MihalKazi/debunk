"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Database } from "lucide-react";

export default function TrendChart() {
  const [data, setData] = useState<{ date: string; total: number; critical: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendData() {
      // 1. DYNAMIC DATES: Always calculate relative to "Right Now"
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 29); // Look back 30 days

      // 2. FETCH: Query Supabase using UTC (Standard for databases)
      // We use .toISOString() to ensure Supabase understands the timestamp accurately
      const { data: records, error } = await supabase
        .from("debunks")
        .select("created_at, severity")
        .gte("created_at", thirtyDaysAgo.toISOString());

      if (error) {
        console.error("Error fetching chart data:", error);
      }

      const rawData = records || [];

      // 3. PROCESS: Match records using Local Time (Best for UI)
      const processedData = [];
      const iterDate = new Date(thirtyDaysAgo);

      // Loop from Start Date until Today
      while (iterDate <= today) {
        // Create a human-readable label (e.g., "Jan 18")
        const label = iterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Filter records that match this SPECIFIC day in the user's local timezone
        const dayRecords = rawData.filter(r => {
          const recordDate = new Date(r.created_at);
          return (
            recordDate.getDate() === iterDate.getDate() &&
            recordDate.getMonth() === iterDate.getMonth() &&
            recordDate.getFullYear() === iterDate.getFullYear()
          );
        });
        
        processedData.push({
          date: label,
          total: dayRecords.length,
          critical: dayRecords.filter(r => r.severity === 'critical').length
        });

        // Move loop to the next day
        iterDate.setDate(iterDate.getDate() + 1);
      }

      setData(processedData);
      setLoading(false);
    }

    fetchTrendData();
  }, []);

  // Determine scale (Minimum 1 to prevent division by zero errors)
  const maxValue = Math.max(...data.map(d => d.total), 1);

  if (loading) {
    return (
      <section className="py-12 border-b border-slate-200 bg-white min-h-[300px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="animate-spin w-8 h-8" />
            <span className="text-xs">Loading live analytics...</span>
         </div>
      </section>
    );
  }

  return (
    <section className="py-12 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold mb-2 text-[#1e3a5f]">Detection Activity</h2>
            <p className="text-sm text-slate-500">
               Real-time verified cases (Last 30 Days)
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
             <Database className="w-3 h-3" />
             <span>Live Database</span>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50">
          <div className="flex items-end justify-between gap-1 h-64">
            {data.map((day, i) => {
              const heightPercent = (day.total / maxValue) * 100;
              const criticalPercent = day.total > 0 ? (day.critical / day.total) * 100 : 0;
              const hasData = day.total > 0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative min-w-[8px]">
                  {/* The Bar */}
                  <div 
                    className={`w-full rounded-t relative transition-all duration-500 ${hasData ? 'bg-[#1e3a5f] hover:opacity-90' : 'bg-[#1e3a5f]/5'}`}
                    style={{ height: `${hasData ? heightPercent : 2}%` }} 
                  >
                    {day.critical > 0 && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 rounded-t bg-red-500"
                        style={{ height: `${criticalPercent}%` }} 
                      />
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  {hasData && (
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1e3a5f] text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none z-10 w-28 text-center transition-opacity">
                      <p className="font-bold border-b border-white/20 pb-1 mb-1">{day.date}</p>
                      <div className="flex justify-between px-1">
                         <span>Total:</span>
                         <span className="font-bold">{day.total}</span>
                      </div>
                      {day.critical > 0 && (
                        <div className="flex justify-between px-1 text-red-300">
                           <span>Critical:</span>
                           <span className="font-bold">{day.critical}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Dynamic Labels */}
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase tracking-wider">
            <span>{data[0]?.date || '30 days ago'}</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </section>
  );
}