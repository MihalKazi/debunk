"use client"; // This tells Next.js this button is interactive

import { Share2 } from "lucide-react";

export default function ExportButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="w-full py-4 mt-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
    >
      <Share2 size={14} /> Export Metadata PDF
    </button>
  );
}