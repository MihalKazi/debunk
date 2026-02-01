"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import CaseModal from "./CaseModal";
import { 
  ImageOff, Calendar, ChevronRight, ShieldAlert, 
  Search, X, Tag, LayoutGrid, List, ChevronDown,
  Filter, BarChart3, SortDesc, SortAsc, RotateCcw
} from "lucide-react"; 

const getValidSrc = (url: string) => (url && url.trim() !== "" ? url : null);

export default function DebunkFeed() {
  const [debunks, setDebunks] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Professional Scaling & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(12);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchDebunks = async () => {
      const { data, error } = await supabase
        .from("debunks")
        .select("*")
        .order("occurrence_date", { ascending: false });

      if (error) console.error("Error fetching debunks:", error);
      else setDebunks(data || []);
    };
    fetchDebunks();
  }, []);

  // Calculate dynamic categories and their counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    debunks.forEach(item => {
      const cat = item.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [debunks]);

  // Master Filter & Sort Logic
  const filteredDebunks = useMemo(() => {
    let result = debunks.filter((item) => {
      const matchesSearch = !searchQuery || [item.title, item.summary, item.source, item.category]
        .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      const dateA = new Date(a.occurrence_date || 0).getTime();
      const dateB = new Date(b.occurrence_date || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [searchQuery, activeCategory, sortOrder, debunks]);

  const displayedItems = filteredDebunks.slice(0, visibleCount);

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setSortOrder("newest");
  };

  return (
    <>
      <section id="cases" className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Stats Card */}
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight mb-4 flex items-center gap-3">
                <ShieldAlert className="text-blue-600" size={40} />
                Forensic <span className="text-blue-600">Archive</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Exploring the landscape of verified synthetic media and digital deception in Bangladesh.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm min-w-[140px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Cases</p>
                <p className="text-3xl font-black text-slate-900">{debunks.length}</p>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm min-w-[140px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Filtered</p>
                <p className="text-3xl font-black text-blue-600">{filteredDebunks.length}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-10">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Filter size={14} /> Categories
                    </h3>
                    {(activeCategory !== "All" || searchQuery) && (
                      <button onClick={resetFilters} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        <RotateCcw size={10} /> Reset
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <button 
                      onClick={() => setActiveCategory("All")}
                      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === "All" ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                    >
                      <span>All Insights</span>
                      <span className={activeCategory === "All" ? 'text-slate-400' : 'text-slate-300'}>{debunks.length}</span>
                    </button>
                    {categories.map(([name, count]) => (
                      <button 
                        key={name}
                        onClick={() => setActiveCategory(name)}
                        className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === name ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                      >
                        <span className="truncate mr-2">{name}</span>
                        <span className={activeCategory === name ? 'text-slate-400' : 'text-slate-300'}>{count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:block p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
                  <BarChart3 className="text-white/20 absolute -right-4 -bottom-4" size={120} />
                  <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Live Analysis</p>
                  <p className="text-lg font-bold leading-snug relative z-10">
                    Targeting <strong>{categories[0]?.[0]}</strong> is the primary trend in the current quarter.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1">
              
              {/* Control Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Search database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="flex-1 md:w-40 px-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-700 outline-none appearance-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>

                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={20} /></button>
                  </div>
                </div>
              </div>

              {/* Grid or List Display */}
              {displayedItems.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {displayedItems.map((item) => (
                      <GridCard key={item.id} item={item} onClick={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedItems.map((item) => (
                      <ListRow key={item.id} item={item} onClick={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-slate-300" size={32} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900">No records found</h3>
                   <p className="text-slate-500 mt-2 font-medium">Try resetting filters to broaden your search.</p>
                   <button onClick={resetFilters} className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors">Clear All Filters</button>
                </div>
              )}

              {/* Load More Button */}
              {visibleCount < filteredDebunks.length && (
                <div className="mt-16 flex justify-center">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 8)}
                    className="group flex items-center gap-4 bg-white border-2 border-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-95"
                  >
                    View More Cases <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <CaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedCase} />
    </>
  );
}

// --- SUBCOMPONENTS ---

function GridCard({ item, onClick }: { item: any; onClick: () => void }) {
  const imgSrc = getValidSrc(item.media_url);
  return (
    <article onClick={onClick} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] hover:border-blue-400 transition-all duration-500 cursor-pointer flex flex-col h-full">
      <div className="aspect-[16/10] relative bg-slate-100 flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <ImageOff size={40} strokeWidth={1} className="text-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Restricted Media</span>
          </div>
        )}
        <div className="absolute top-6 left-6 bg-blue-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-full shadow-lg">
          {item.category || "General"}
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-center mb-5">
          <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg ${
            item.verdict?.toLowerCase() === 'fake' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
          }`}>{item.verdict}</span>
          <span className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">
            <Calendar size={14} /> {item.occurrence_date}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{item.title}</h3>
        <p className="text-slate-500 text-md line-clamp-2 leading-relaxed mb-6 font-medium">{item.summary}</p>
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-slate-300" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.source}</span>
          </div>
          <ChevronRight size={20} className="text-blue-600 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </article>
  );
}

function ListRow({ item, onClick }: { item: any; onClick: () => void }) {
  const imgSrc = getValidSrc(item.media_url);
  return (
    <div onClick={onClick} className="group flex items-center gap-6 bg-white p-5 rounded-3xl border border-slate-100 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="w-28 h-20 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 flex items-center justify-center border border-slate-100">
        {imgSrc ? <img src={imgSrc} className="w-full h-full object-cover" alt="" /> : <ImageOff size={24} className="text-slate-200" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.category}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{item.source}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h3>
      </div>
      <div className="hidden lg:flex items-center gap-12 px-8">
        <span className={`text-[11px] font-black uppercase w-20 text-center ${
           item.verdict?.toLowerCase() === 'fake' ? 'text-red-600' : 'text-amber-600'
        }`}>{item.verdict}</span>
        <span className="text-slate-400 text-xs font-bold whitespace-nowrap">{item.occurrence_date}</span>
      </div>
      <ChevronRight size={22} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
    </div>
  );
}