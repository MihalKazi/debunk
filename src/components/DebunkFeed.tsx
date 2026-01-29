"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CaseModal from "./CaseModal";
import { ImageIcon, Calendar } from "lucide-react"; 

export default function DebunkFeed() {
  const [debunks, setDebunks] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDebunks = async () => {
      const { data, error } = await supabase
        .from("debunks")
        .select("*")
        // 1. SORT BY OCCURRENCE DATE: Shows the actual news date first
        .order("occurrence_date", { ascending: false });

      if (error) console.error("Error fetching debunks:", error);
      else setDebunks(data || []);
    };
    fetchDebunks();
  }, []);

  const openModal = (item: any) => {
    setSelectedCase(item);
    setIsModalOpen(true);
  };

  const isValidUrl = (url: string) => {
    return url && url.startsWith("http");
  };

  return (
    <>
      <section id="cases" className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1e3a5f] mb-2">Recent Cases</h2>
              <p className="text-slate-600">Latest verified AI misinformation added to the archive.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debunks.map((item) => (
              <article 
                key={item.id} 
                onClick={() => openModal(item)}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {isValidUrl(item.media_url) ? (
                    <img 
                      src={item.media_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400?text=Image+Unavailable";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 text-slate-400">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <span className="text-[10px] font-bold uppercase mt-2">No Visual Evidence</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    Verified Report
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 text-[10px] font-black rounded uppercase ${
                      item.verdict === 'Fake' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.verdict}
                    </span>
                    
                    {/* 2. UPDATED DATE DISPLAY: Prioritizes Occurrence Date */}
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-tight">
                      <Calendar size={12} className="text-slate-300" />
                      {new Date(item.occurrence_date || item.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-xl font-bold text-[#1e3a5f] mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                    {item.summary}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {debunks.length === 0 && (
            <div className="text-center py-20 text-slate-400 italic">
              No cases found in the archive.
            </div>
          )}
        </div>
      </section>

      <CaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedCase} 
      />
    </>
  );
}