"use client";

import Link from "next/link";
import { Menu, ShieldAlert } from "lucide-react";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#1e3a5f] transition-transform group-hover:scale-105">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-[#1e3a5f] leading-none">AIFNR</h1>
              <p className="text-xs text-slate-500">AI Fake News Repository</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#cases" className="text-sm font-medium text-slate-700 hover:text-[#1e3a5f] transition-colors">
              Archive
            </Link>
            <Link href="/#methodology" className="text-sm font-medium text-slate-700 hover:text-[#1e3a5f] transition-colors">
              Methodology
            </Link>
          
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}