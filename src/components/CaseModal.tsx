"use client";

import { 
  X, 
  ExternalLink, 
  Share2, 
  ImageIcon, 
  Archive, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Clock, 
  History,
  Tag // Added for Category icon
} from "lucide-react";
import Link from "next/link";

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
}

export default function CaseModal({ isOpen, onClose, data }: CaseModalProps) {
  if (!isOpen || !data) return null;

  const getBrandStyle = (name: string) => {
    const brand = name?.toLowerCase() || "";
    if (brand.includes("rumour scanner") || brand.includes("rumor scanner")) 
        return { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" };
    if (brand.includes("dismislab")) 
        return { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: "text-purple-600" };
    if (brand.includes("factwatch") || brand.includes("fact-watch")) 
        return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600" };
    
    return { color: "text-slate-900", bg: "bg-slate-50", border: "border-slate-200", icon: "text-slate-500" };
  };

  const brandStyle = getBrandStyle(data.source);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[92vh]">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[110] w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full flex items-center justify-center transition-all hover:rotate-90 active:scale-90 border border-white/20"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="w-full h-[350px] md:h-[450px] bg-[#0f172a] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />
            
            {data.media_url ? (
              <img 
                src={data.media_url} 
                alt="Evidence" 
                className="w-full h-full object-contain relative z-10 p-4 md:p-8 drop-shadow-2xl" 
              />
            ) : (
              <div className="flex flex-col items-center text-white/20">
                <ImageIcon size={80} strokeWidth={1} />
                <p className="text-xs font-black uppercase tracking-[0.4em] mt-4">Visual Evidence Missing</p>
              </div> 
            )}
          </div>

          <div className="p-8 md:p-14">
            
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="px-5 py-2 text-[12px] font-black rounded-full bg-red-600 text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/20">
                <CheckCircle2 size={16} strokeWidth={3} /> {data.verdict || "Fake"}
              </span>
              {/* NEW CATEGORY BADGE */}
              <span className="px-5 py-2 text-[12px] font-black rounded-full bg-blue-100 text-blue-700 uppercase tracking-widest flex items-center gap-2">
                <Tag size={16} /> {data.category || "General"}
              </span>
              <span className="px-5 py-2 text-[12px] font-black rounded-full bg-slate-900 text-white uppercase tracking-widest flex items-center gap-2">
                <Archive size={16} /> GNG Archive
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
              {data.title}
            </h2>
            
            <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-12 font-medium max-w-3xl">
              {data.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-colors">
                <p className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe size={14} className="text-slate-400"/> Platform
                </p>
                <p className="font-bold text-slate-900 text-lg">{data.platform || "Web"}</p>
              </div>

              <div className={`p-6 rounded-2xl border ${brandStyle.bg} ${brandStyle.border} transition-all`}>
                <p className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]">Verified By</p>
                <p className={`font-black text-lg flex items-center gap-2 ${brandStyle.color}`}>
                  <ShieldCheck size={20} className={brandStyle.icon} /> 
                  {data.source || "Certified Fact-Checker"}
                </p>
              </div>

              {/* UPDATED REGION TILE TO CATEGORY TYPE TILE */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-colors">
                <p className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag size={14} className="text-slate-400"/> Classification
                </p>
                <p className="font-bold text-slate-900 text-lg">{data.category || "General Content"}</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[11px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={14} className="text-slate-400"/> Recorded Date
                </p>
                <p className="font-bold text-slate-900 text-lg">
                  {data.occurrence_date ? new Date(data.occurrence_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Recently"}
                </p>
              </div>
            </div>

            {/* ACTION SECTION */}
            <div className="space-y-4">
              {data.wayback_url && (
                <Link 
                  href={data.wayback_url} 
                  target="_blank"
                  className="flex items-center justify-between w-full p-6 transition-all border bg-emerald-50 border-emerald-100 rounded-3xl group hover:bg-emerald-600 hover:border-emerald-600 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <History size={24} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 group-hover:text-emerald-100 transition-colors">
                        GNG Exclusive Archieve
                      </p>
                      <p className="text-lg font-bold text-slate-900 group-hover:text-white transition-colors">
                        View Permanent Archieve
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={20} className="text-emerald-300 group-hover:text-white" />
                </Link>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <Link 
                  href={data.source_link || "#"} 
                  target="_blank"
                  className="flex-[2] inline-flex items-center justify-center gap-3 bg-slate-900 text-white px-10 py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.25em] hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]"
                >
                  <ExternalLink size={20} />
                  Explore Source Report
                </Link>

                <button className="flex-1 inline-flex items-center justify-center gap-3 border-2 border-slate-200 text-slate-900 px-8 py-6 rounded-2xl font-black uppercase text-[12px] tracking-[0.25em] hover:bg-slate-50 transition-all">
                  <Share2 size={20} />
                  Share Case
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}