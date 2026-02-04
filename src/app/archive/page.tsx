"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CaseModal from "@/components/CaseModal";
import { 
  Search, ArrowLeft, Download, Filter, 
  ChevronLeft, ChevronRight, Copy, CheckCheck,
  ExternalLink, FileSpreadsheet, ShieldCheck
} from "lucide-react";

export default function FullArchive() {
  const router = useRouter();
  const [debunks, setDebunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Table States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from("debunks")
        .select("*")
        .eq("is_published", true)
        .order("occurrence_date", { ascending: false });

      if (error) console.error(error);
      else setDebunks(data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return debunks.filter(item => 
      [item.title, item.id?.toString(), item.source, item.category]
        .some(field => field?.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    );
  }, [searchQuery, debunks]);

  // CSV Export Function
  const downloadCSV = () => {
    if (!filteredData.length) return;

    // Define headers
    const headers = ["ID", "Title", "Verdict", "Date", "Category", "Source", "Summary"];
    
    // Convert data to CSV format
    const csvContent = [
      headers.join(","),
      ...filteredData.map(item => {
        const row = [
          item.id,
          `"${(item.title || "").replace(/"/g, '""')}"`, // Escape quotes
          item.verdict,
          item.occurrence_date,
          item.category,
          `"${(item.source || "").replace(/"/g, '""')}"`,
          `"${(item.summary || "").replace(/"/g, '""')}"`
        ];
        return row.join(",");
      })
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `gng_archive_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Top Utility Bar */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Back to Feed
          </button>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                <ShieldCheck size={14} /> Global Database Access
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-6 mt-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Extended Archive</h1>
            <p className="text-slate-500 font-medium">Master registry of {debunks.length} verified digital GNG records.</p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={downloadCSV}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm active:scale-95"
             >
                <FileSpreadsheet size={18} className="text-green-600" /> Export CSV
             </button>
          </div>
        </div>

        {/* Table Interface */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Internal Table Header / Search */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search ID, Source, or Title..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-sm transition-all"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
              Showing {paginatedData.length} records per page
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Forensic ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Report Title</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verdict</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Source</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <TableRow key={item.id} item={item} onOpen={() => { setSelectedCase(item); setIsModalOpen(true); }} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">
                      No published records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-sm font-bold text-slate-500">
              Page {currentPage} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-3 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-3 rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={selectedCase} />
    </main>
  );
}

// --- TABLE ROW SUBCOMPONENT ---

function TableRow({ item, onOpen }: { item: any, onOpen: () => void }) {
  const [copied, setCopied] = useState(false);
  const entryId = item.id?.toString().slice(0, 8).toUpperCase() || "REF-000";
  const isFake = item.verdict?.toLowerCase() === 'fake';

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(entryId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <tr className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={onOpen}>
      <td className="px-8 py-4">
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-all hover:bg-white"
        >
          <span className="text-xs font-mono font-bold text-slate-900">{entryId}</span>
          {copied ? <CheckCheck size={12} className="text-green-600" /> : <Copy size={12} className="text-slate-400" />}
        </button>
      </td>
      <td className="px-8 py-4 max-w-md">
        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{item.title}</div>
        <div className="text-[10px] text-slate-400 font-medium">{item.occurrence_date}</div>
      </td>
      <td className="px-8 py-4">
        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
          isFake ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          {item.verdict}
        </span>
      </td>
      <td className="px-8 py-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</span>
      </td>
      <td className="px-8 py-4">
        <span className="text-xs font-bold text-slate-700">{item.source || 'N/A'}</span>
      </td>
      <td className="px-8 py-4">
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <ExternalLink size={18} />
          </button>
          <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600" />
        </div>
      </td>
    </tr>
  );
}