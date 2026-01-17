"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CaseModal from "./CaseModal"; // <--- Import the new modal

export default function DebunkFeed() {
  const [debunks, setDebunks] = useState<any[]>([]);
  
  // Modal State
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDebunks = async () => {
      const { data, error } = await supabase
        .from("debunks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching debunks:", error);
      else setDebunks(data || []);
    };

    fetchDebunks();
  }, []);

  // Handler to open modal
  const openModal = (item: any) => {
    setSelectedCase(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <section id="cases" className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search Header (Same as before) */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#1e3a5f] mb-2">Recent Cases</h2>
              <p className="text-slate-600">Latest verified AI misinformation added to the archive.</p>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debunks.map((item) => (
              <article 
                key={item.id} 
                onClick={() => openModal(item)} // <--- CLICK TO OPEN
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {item.media_url ? (
                    <img 
                      src={item.media_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🌊</div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                    AI Video
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-bold rounded bg-red-100 text-red-700">
                      {item.verdict}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
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
        </div>
      </section>

      {/* RENDER THE MODAL */}
      <CaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={selectedCase} 
      />
    </>
  );
}