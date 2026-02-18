"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; 
import CaseModal from "@/components/CaseModal"; 
import { 
  ChevronRight, Search, Tag, LayoutGrid, List, 
  ChevronDown, Filter, Database, Server, CheckCheck, 
  Copy, ExternalLink 
} from "lucide-react"; 

// --- PERMANENT NOISE TEXTURE ---
const NOISE_BG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E`;

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

  // Pagination
  const [visibleCount, setVisibleCount] = useState(10); 
  const REDIRECT_THRESHOLD = 30; 

  useEffect(() => {
    const fetchDebunks = async () => {
      const { data, error } = await supabase
        .from("debunks")
        .select("*")
        .eq("is_published", true)
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
      {/* FIX APPLIED HERE: 
          1. Kept id="cases" 
          2. Added 'scroll-mt-24' so the sticky navbar doesn't cover the top of this section when clicked.
      */}
      <section id="cases" className="relative py-24 bg-slate-50 border-t border-slate-200 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900 scroll-mt-24">
        
        {/* --- BACKGROUND TECH GRID --- */}
        <div className="absolute inset-0 pointer-events-none z-0">
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
           <div className="absolute -top-[20%] right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* --- HEADER --- */}
          <div className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              {/* System Badge */}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm mb-8">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Live Feed v1.0
                 </span>
              </div>

              {/* H1 Typography */}
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                GNG <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-[#1e3a5f] to-emerald-600 animate-gradient-x">
                  Archive & Analysis.
                </span>
              </h2>
              <p className="text-slate-500 font-medium text-lg md:text-xl leading-relaxed max-w-lg">
                Professional database of verified synthetic media. Access detailed forensic breakdowns and origin tracing.
              </p>
            </div>
            
            {/* Stats Box */}
            <div className="flex gap-4">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200 p-8 rounded-[2rem] shadow-sm min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Database size={16} /></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Records</p>
                </div>
                <p className="text-5xl font-black text-slate-900 tracking-tight">{debunks.length}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* --- SIDEBAR FILTERING --- */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="sticky top-28 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Filter size={12} /> Taxonomy
                    </h3>
                  </div>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <CategoryButton 
                        active={activeCategory === "All"} 
                        onClick={() => setActiveCategory("All")} 
                        label="All Records" 
                        count={debunks.length} 
                    />
                    {categories.map(([name, count]) => (
                      <CategoryButton 
                        key={name}
                        active={activeCategory === name} 
                        onClick={() => setActiveCategory(name)} 
                        label={name} 
                        count={count} 
                      />
                    ))}
                  </div>
                </div>

              </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 min-w-0">
              
              {/* Controls */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
                <div className="relative w-full group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#1e3a5f] transition-colors" />
                  </div>
                  <input 
                    type="text"
                    placeholder="Search by ID, keyword, or origin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm focus:outline-none focus:ring-4 focus:ring-[#1e3a5f]/5 focus:border-[#1e3a5f] transition-all placeholder:text-slate-400 placeholder:font-bold placeholder:uppercase placeholder:text-[11px] placeholder:tracking-wider"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
                    <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}><List size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Grid / List Display */}
              {displayedItems.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {displayedItems.map((item) => (
                    viewMode === 'grid' ? (
                      <GridCard key={item.id} item={item} onClick={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                    ) : (
                      <ListRow key={item.id} item={item} onClick={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-white rounded-[2.5rem] border border-dashed border-slate-300">
                    <div className="inline-flex p-4 rounded-full bg-slate-50 mb-4 text-slate-400">
                        <Search size={24} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No matching records</h3>
                    <p className="text-slate-500 font-medium text-sm mb-8">Adjust your search parameters or filters.</p>
                    <button onClick={resetFilters} className="px-8 py-4 bg-[#1e3a5f] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-colors shadow-lg">Clear All Filters</button>
                </div>
              )}

              {/* Pagination / Footer */}
              <div className="mt-20 flex flex-col items-center gap-8 border-t border-slate-200 pt-12">
                {hasMoreLocal && (
                  <button 
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="group relative px-10 py-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-[#1e3a5f] translate-y-[102%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <div className="relative flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-white transition-colors duration-300">
                        Load More Records <ChevronDown size={14} />
                    </div>
                  </button>
                )}

                {showRedirect && (
                  <div className="w-full p-12 bg-slate-50 rounded-[2.5rem] border border-slate-200 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
                    <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Restricted View Access</h4>
                    <p className="text-slate-500 font-medium text-sm mb-8 max-w-md mx-auto">
                        To maintain system performance, only recent entries are displayed here. Access the full historical ledger below.
                    </p>
                    <button 
                      onClick={() => router.push('/archive')}
                      className="inline-flex items-center gap-3 bg-[#1e3a5f] text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-900 transition-all shadow-lg hover:shadow-blue-900/20"
                    >
                      Access Full Archive <ExternalLink size={14} />
                    </button>
                  </div>
                )}
                
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  System displaying {displayedItems.length} of {filteredDebunks.length} public records
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

function CategoryButton({ active, onClick, label, count }: { active: boolean, onClick: () => void, label: string, count: number }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${
                active 
                ? 'bg-[#1e3a5f] text-white shadow-xl shadow-blue-900/10 translate-x-2' 
                : 'bg-white text-slate-500 hover:bg-white hover:text-[#1e3a5f] hover:shadow-md border border-transparent hover:border-slate-100'
            }`}
        >
            <span className="truncate mr-3">{label}</span>
            <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                active ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'
            }`}>
                {count}
            </span>
        </button>
    )
}

function GridCard({ item, onClick }: { item: any; onClick: () => void }) {
  const [copied, setCopied] = useState(false);
  const isFake = item.verdict?.toLowerCase().includes('fake') || item.verdict?.toLowerCase().includes('false');
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
      className="group relative bg-white rounded-[2.5rem] border border-slate-200 p-8 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col min-h-[360px] overflow-hidden"
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ref. ID</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 group/id bg-slate-50 hover:bg-[#1e3a5f] hover:text-white px-3 py-1.5 rounded-xl border border-slate-100 transition-all duration-300"
          >
            <span className="text-[10px] font-black font-mono text-slate-600 group-hover/id:text-white transition-colors">{entryId}</span>
            {copied ? <CheckCheck size={10} className="text-emerald-400" /> : <Copy size={10} className="text-slate-400 group-hover/id:text-white/70" />}
          </button>
        </div>
        
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
          isFake 
          ? 'bg-red-50 text-red-600 border border-red-100' 
          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        }`}>
          {item.verdict}
        </div>
      </div>

      {/* Card Title */}
      <h3 className="relative z-10 text-xl md:text-2xl font-black text-slate-900 mb-4 line-clamp-3 group-hover:text-[#1e3a5f] transition-colors leading-[1.1] tracking-tight">
        {item.title}
      </h3>
      
      {/* Body */}
      <p className="relative z-10 text-slate-500 text-sm line-clamp-3 leading-relaxed mb-8 font-medium">
        {item.summary}
      </p>

      <div className="relative z-10 mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <Tag size={10} className="text-[#1e3a5f]" />
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest truncate max-w-[100px]">{item.category}</span>
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{item.occurrence_date}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#1e3a5f] group-hover:text-white transition-all duration-300 shadow-sm">
            <ChevronRight size={16} />
        </div>
      </div>
    </article>
  );
}

function ListRow({ item, onClick }: { item: any; onClick: () => void }) {
  const isFake = item.verdict?.toLowerCase().includes('fake') || item.verdict?.toLowerCase().includes('false');
  const entryId = item.id?.toString().slice(0, 8).toUpperCase() || "REF-000";

  return (
    <div 
      onClick={onClick} 
      className="group flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer gap-4"
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className={`hidden md:block w-1.5 h-16 rounded-full flex-shrink-0 transition-colors ${isFake ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-3">
             <span className="px-3 py-1 rounded-lg bg-slate-50 text-[10px] font-black font-mono text-slate-500 tracking-wider">{entryId}</span>
             <h3 className="text-lg font-black text-slate-900 truncate group-hover:text-[#1e3a5f] transition-colors tracking-tight">{item.title}</h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Tag size={12} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.category}</span>
             </div>
             <span className="w-1 h-1 rounded-full bg-slate-300"></span>
             <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.source}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between md:justify-end gap-6 md:pl-8 md:border-l md:border-slate-100">
        <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
            isFake ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {item.verdict}
        </span>
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 group-hover:border-[#1e3a5f] group-hover:text-[#1e3a5f] group-hover:bg-[#1e3a5f]/5 transition-all">
             <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
}