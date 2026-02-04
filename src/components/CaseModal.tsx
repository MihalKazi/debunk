"use client";

import { 
  X, 
  ExternalLink, 
  Share2, 
  ImageIcon, 
  Archive, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Clock, 
  History,
  Tag 
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-md p-4 transition-all duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 max-h-[92vh] border border-white/20">
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[110] w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white rounded-full flex items-center justify-center transition-all hover:rotate-90 active:scale-90 border border-white/20 shadow-lg"
        >
          <X size={28} strokeWidth={2.5} />
        </button>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Image Section - Dark Tech Grid Background */}
          <div className="w-full h-[350px] md:h-[450px] bg-[#0f172a] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60"></div>
            
            {data.media_url ? (
              <img 
                src={data.media_url} 
                alt="Evidence" 
                className="w-full h-full object-contain relative z-10 p-4 md:p-12 drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
              />
            ) : (
              <div className="flex flex-col items-center text-slate-600 z-10">
                <ImageIcon size={64} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-6 text-slate-500">Visual Evidence Secured</p>
              </div> 
            )}
          </div>

          <div className="p-8 md:p-14">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="px-4 py-2 text-[10px] font-black rounded-xl bg-red-50 text-red-600 uppercase tracking-widest flex items-center gap-2 border border-red-100">
                <CheckCircle2 size={14} strokeWidth={3} /> {data.verdict || "Fake"}
              </span>
              <span className="px-4 py-2 text-[10px] font-black rounded-xl bg-blue-50 text-blue-700 uppercase tracking-widest flex items-center gap-2 border border-blue-100">
                <Tag size={14} /> {data.category || "General"}
              </span>
              <span className="px-4 py-2 text-[10px] font-black rounded-xl bg-slate-900 text-white uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/20">
                <Archive size={14} /> Archive Ref: {data.id?.toString().slice(0, 4) || "0000"}
              </span>
            </div>

            {/* Typography Match: font-black, tracking-tight */}
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
              {data.title}
            </h2>
            
            {/* Body: font-medium, slate-500 */}
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed mb-12 font-medium max-w-3xl">
              {data.summary}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-colors">
                <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe size={12} className="text-slate-400"/> Platform Origin
                </p>
                <p className="font-black text-slate-900 text-xl tracking-tight">{data.platform || "Web"}</p>
              </div>

              <div className={`p-6 rounded-[1.5rem] border ${brandStyle.bg} ${brandStyle.border} transition-all`}>
                <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Verified By</p>
                <p className={`font-black text-xl flex items-center gap-2 tracking-tight ${brandStyle.color}`}>
                  <ShieldCheck size={20} className={brandStyle.icon} /> 
                  {data.source || "Certified Fact-Checker"}
                </p>
              </div>

              <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-colors">
                <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag size={12} className="text-slate-400"/> Classification
                </p>
                <p className="font-black text-slate-900 text-xl tracking-tight">{data.category || "General Content"}</p>
              </div>

              <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock size={12} className="text-slate-400"/> Recorded Date
                </p>
                <p className="font-black text-slate-900 text-xl tracking-tight">
                  {data.occurrence_date ? new Date(data.occurrence_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "Recently"}
                </p>
              </div>
            </div>

            {/* Action Section */}
            <div className="space-y-4">
              {data.wayback_url && (
                <Link 
                  href={data.wayback_url} 
                  target="_blank"
                  className="flex items-center justify-between w-full p-6 transition-all border bg-emerald-50/50 border-emerald-100 rounded-3xl group hover:bg-emerald-500 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-900/20"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 group-hover:text-emerald-500 transition-colors">
                      <History size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600/70 group-hover:text-emerald-100 transition-colors mb-1">
                        Wayback Machine
                      </p>
                      <p className="text-lg font-black text-emerald-950 group-hover:text-white transition-colors tracking-tight">
                        View Permanent Archive
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-100/50 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white text-emerald-600 transition-all">
                    <ExternalLink size={18} />
                  </div>
                </Link>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <Link 
                  href={data.source_link || "#"} 
                  target="_blank"
                  className="flex-[2] inline-flex items-center justify-center gap-3 bg-[#1e3a5f] text-white px-10 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] hover:bg-blue-900 transition-all shadow-xl active:scale-[0.98]"
                >
                  <ExternalLink size={18} />
                  Explore Source Report
                </Link>

                <button className="flex-1 inline-flex items-center justify-center gap-3 border-2 border-slate-200 text-slate-600 hover:text-slate-900 px-8 py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.25em] hover:bg-slate-50 transition-all">
                  <Share2 size={18} />
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