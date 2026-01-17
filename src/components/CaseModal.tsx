import { X, ExternalLink, Share2, AlertTriangle, MapPin, Globe, ShieldCheck, ScanFace } from "lucide-react";
import Link from "next/link";

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; 
}

export default function CaseModal({ isOpen, onClose, data }: CaseModalProps) {
  if (!isOpen || !data) return null;

  // Helper for badge colors
  const getVerdictColor = (v: string) => {
    if (v === 'Fake') return 'bg-red-500 text-white';
    if (v === 'Satire') return 'bg-amber-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getHarmColor = (h: string) => {
    if (h === 'critical') return 'bg-red-600 text-white';
    if (h === 'high') return 'bg-orange-600 text-white';
    if (h === 'medium') return 'bg-yellow-600 text-white';
    return 'bg-green-600 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
        >
          <X size={20} />
        </button>

        {/* 1. Header Image Area */}
        <div className="aspect-video w-full bg-black flex items-center justify-center">
          {data.media_url ? (
            <img 
              src={data.media_url} 
              alt="Evidence" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-6xl">🌊</div> 
          )}
        </div>

        {/* 2. Content Body */}
        <div className="p-6 md:p-8">
          
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getVerdictColor(data.verdict)}`}>
              {data.verdict}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${getHarmColor(data.severity)}`}>
              {data.severity || "Medium"} Severity
            </span>
          </div>

          {/* Title & Summary */}
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-3 leading-tight">
            {data.title}
          </h2>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
            {data.summary}
          </p>

          {/* 3. The 2x2 Grid (UPDATED TO MATCH SUBMIT FORM) */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            
            {/* Platform */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Platform
              </p>
              <p className="font-semibold text-slate-900">
                {data.platform || "Unknown"}
              </p>
            </div>
            
            {/* Region */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Region
              </p>
              <p className="font-semibold text-slate-900">
                {data.country || "Global"}
              </p>
            </div>

            {/* Verified By */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified By
              </p>
              <p className="font-semibold text-slate-900">
                {data.source || "Independent Analysts"}
              </p>
            </div>

            {/* Method */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1">
                <ScanFace className="w-3 h-3" /> Method
              </p>
              <p className="font-semibold text-slate-900">
                {data.method || "Manual Review"}
              </p>
            </div>
          </div>

          {/* 4. Warning Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3 mb-8">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">
              This content has been fact-checked and verified as <strong>ai-generated</strong>. 
              It is archived here for research purposes only.
            </p>
          </div>

          {/* 5. Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            
            {/* LINK TO SLUG PAGE */}
            <Link 
              href={`/debunk/${data.slug}`} 
              className="flex-1 flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162c46] text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              <ExternalLink size={18} />
              View Full Analysis
            </Link>

            <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-bold transition-colors">
              <Share2 size={18} />
              Share Case
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}