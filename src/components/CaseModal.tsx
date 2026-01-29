"use client";

import { X, ExternalLink, Share2, AlertTriangle, MapPin, Globe, ShieldCheck, ScanFace, ImageIcon, Calendar, Link as LinkIcon, Info } from "lucide-react";
import Link from "next/link";

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
}

export default function CaseModal({ isOpen, onClose, data }: CaseModalProps) {
  if (!isOpen || !data) return null;

  const isValidUrl = (url: string) => {
    return url && typeof url === 'string' && url.startsWith("http");
  };

  const getVerdictColor = (v: string) => {
    const verdict = v?.toLowerCase();
    if (verdict === 'fake') return 'bg-red-500 text-white';
    if (verdict === 'satire') return 'bg-amber-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-6">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl bg-white md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row min-h-full">
            
            {/* 1. Media Section - Transparent Glass Background */}
            <div className="w-full md:w-1/2 bg-slate-50 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 min-h-[300px] md:min-h-[600px]">
              {/* Subtle radial gradient for depth instead of flat dark color */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/50 via-transparent to-transparent"></div>
              
              {isValidUrl(data.media_url) ? (
                <img 
                  src={data.media_url} 
                  alt="Evidence" 
                  className="relative z-10 w-full h-full object-contain p-4 md:p-8 drop-shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                  <ImageIcon size={60} strokeWidth={1} className="mb-2" />
                  <p className="text-[10px] uppercase font-bold tracking-widest">Visual Evidence Missing</p>
                </div> 
              )}
            </div>

            {/* 2. Info Section */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col bg-white">
              <div className="flex items-center justify-between mb-8">
                <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm ${getVerdictColor(data.verdict)}`}>
                  {data.verdict || "Reviewing"}
                </span>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-tight">
                  <Calendar size={14} className="text-slate-300" />
                  {new Date(data.occurrence_date || data.created_at).toLocaleDateString('en-GB', {
                     day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>

              <h2 className="font-serif text-2xl md:text-4xl font-bold text-slate-900 mb-6 leading-[1.1]">
                {data.title}
              </h2>
              
              <div className="prose prose-slate mb-8">
                 <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                  {data.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <DetailItem icon={<Globe size={14}/>} label="Platform" value={data.platform} />
                <DetailItem icon={<MapPin size={14}/>} label="Region" value={data.country} />
              </div>

              {/* Source Information - Positioned before the buttons */}
              {isValidUrl(data.source_link) && (
                <div className="mt-auto p-5 rounded-2xl bg-blue-50/50 border border-blue-100/50 mb-8 group hover:bg-blue-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 mb-1">Primary Source Available</h4>
                      <p className="text-xs text-blue-700 leading-relaxed mb-3">
                        The full report and original source for this case are hosted on the analysis page. Verify the details below.
                      </p>
                     
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href={`/debunk/${data.slug}`} 
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f] text-white px-8 py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-blue-900/10"
                >
                  View Full Analysis & Source Details
                  <ExternalLink size={18} />
                </Link>

                <button className="flex sm:w-16 items-center justify-center border border-slate-200 text-slate-400 p-5 rounded-2xl hover:text-slate-900 hover:bg-slate-50 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="font-bold text-slate-900 text-sm truncate">{value || "Universal"}</p>
    </div>
  );
}