"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CaseModal from "./CaseModal";
import { 
  Calendar, ChevronRight, ShieldAlert, Search, Tag, 
  LayoutGrid, List, ChevronDown, Filter, RotateCcw, 
  Activity, Copy, CheckCheck, ExternalLink
} from "lucide-react"; 

export default function DebunkFeed() {
  const router = useRouter();
  const [debunks, setDebunks] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filtering and View States
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Pagination / Threshold Logic
  const [visibleCount, setVisibleCount] = useState(10); 
  const REDIRECT_THRESHOLD = 30; 

  useEffect(() => {
    const fetchDebunks = async () => {
      const { data, error } = await supabase
        .from("debunks")
        .select("*")
        .eq("is_published", true) // CRITICAL: Only fetch visible items
        .order("occurrence_date", { ascending: false });

      if (error) console.error("Error fetching debunks:", error);
      else setDebunks(data || []);
    };
    fetchDebunks();
  }, []);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    debunks.forEach(item => {
      const cat = item.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [debunks]);

  const filteredDebunks = useMemo(() => {
    let result = debunks.filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || [
        item.title, 
        item.summary, 
        item.source, 
        item.category,
        item.id?.toString() 
      ].some(field => field?.toLowerCase().includes(query));
      
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
  const hasMoreLocal = visibleCount < filteredDebunks.length && visibleCount < REDIRECT_THRESHOLD;
  const showRedirect = filteredDebunks.length > REDIRECT_THRESHOLD && visibleCount >= REDIRECT_THRESHOLD;

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setVisibleCount(10);
  };

  return (
    <>
      <section id="cases" className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight mb-4 flex items-center gap-3">
                <ShieldAlert className="text-blue-600" size={40} />
                GNG <span className="text-blue-600">Archive</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Professional database of verified synthetic media and digital deception records.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm min-w-[140px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Records</p>
                <p className="text-3xl font-black text-slate-900">{debunks.length}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-10">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Filter size={14} /> Taxonomy
                    </h3>
                  </div>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <button 
                      onClick={() => setActiveCategory("All")}
                      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === "All" ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
                    >
                      <span>All Records</span>
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

                <div className="hidden lg:block p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                  <Activity className="text-white/10 absolute -right-4 -bottom-4" size={120} />
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Registry</p>
                  <p className="text-lg font-bold leading-snug relative z-10">
                    Archive synchronized with global fact-check registries.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Search archive or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={20} /></button>
                  </div>
                </div>
              </div>

              {displayedItems.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-3"}>
                  {displayedItems.map((item) => (
                    viewMode === 'grid' ? (
                      <GridCard key={item.id} item={item} onClick={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                    ) : (
                      <ListRow key={item.id} item={item} onClick={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
                   <h3 className="text-2xl font-black text-slate-900">No matching records</h3>
                   <button onClick={resetFilters} className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm">Clear Filters</button>
                </div>
              )}

              {/* Dynamic Footer / Pagination */}
              <div className="mt-16 flex flex-col items-center gap-6">
                {hasMoreLocal && (
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="flex items-center gap-4 bg-white border-2 border-slate-900 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-xl"
                  >
                    Load More <ChevronDown size={20} />
                  </button>
                )}

                {showRedirect && (
                  <div className="text-center p-12 bg-slate-100 rounded-[3rem] border border-slate-200 w-full max-w-2xl">
                    <h4 className="text-xl font-black text-slate-900 mb-2">Access Full Archive</h4>
                    <p className="text-slate-500 font-medium mb-8">Access our full historical database for deep-dives and research.</p>
                    <button 
                      onClick={() => router.push('/archive')}
                      className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                    >
                      Browse {filteredDebunks.length} Records <ExternalLink size={18} />
                    </button>
                  </div>
                )}
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Showing {displayedItems.length} of {filteredDebunks.length} public records
                </p>
              </div>
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
  const [copied, setCopied] = useState(false);
  const isFake = item.verdict?.toLowerCase() === 'fake';
  const entryId = item.id?.toString().slice(0, 8).toUpperCase() || "REF-000";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(entryId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article 
      onClick={onClick} 
      className="group bg-white rounded-3xl border border-slate-200 p-8 hover:shadow-2xl hover:border-blue-500 transition-all duration-400 cursor-pointer relative flex flex-col min-h-[300px]"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref. ID</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 group/id bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-100 transition-colors"
          >
            <span className="text-xs font-mono font-bold text-slate-900">{entryId}</span>
            {copied ? <CheckCheck size={12} className="text-green-600" /> : <Copy size={12} className="text-slate-400 group-hover/id:text-blue-600" />}
          </button>
        </div>
        
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
          isFake ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}>
          {item.verdict}
        </div>
      </div>

      <h3 className="text-xl font-black text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
        {item.title}
      </h3>
      
      <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-8 font-medium italic">
        "{item.summary}"
      </p>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Tag size={12} className="text-blue-600" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.category}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{item.occurrence_date}</span>
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </article>
  );
}

function ListRow({ item, onClick }: { item: any; onClick: () => void }) {
  const isFake = item.verdict?.toLowerCase() === 'fake';
  const entryId = item.id?.toString().slice(0, 8).toUpperCase() || "REF-000";

  return (
    <div 
      onClick={onClick} 
      className="group flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className={`w-2 h-10 rounded-full flex-shrink-0 ${isFake ? 'bg-red-500' : 'bg-blue-600'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
             <span className="text-[9px] font-mono font-bold text-slate-400">{entryId}</span>
             <span className="text-slate-200">|</span>
             <h3 className="text-md font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{item.title}</h3>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.source}</span>
             <span className="text-[10px] font-medium text-slate-300 italic">{item.occurrence_date}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-8 ml-4">
        <span className={`text-[10px] font-black uppercase w-20 text-right ${isFake ? 'text-red-600' : 'text-blue-600'}`}>
          {item.verdict}
        </span>
        <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}