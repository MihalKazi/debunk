"use client";

import { Printer, Share2 } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 border border-slate-200 px-4 py-2 rounded-xl bg-white transition-all shadow-sm"
    >
      <Printer size={14} /> Save Report
    </button>
  );
}

export function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg text-white"
    >
      <Share2 size={18} /> Share Truth
    </button>
  );
}