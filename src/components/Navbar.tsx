"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Added X icon for closing
import { Logo } from "@/components/Logo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group z-50">
            <Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
            <div>
              <h1 className="font-serif text-xl font-bold text-[#1e3a5f] leading-none tracking-tighter">GNG</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Generated, not Genuine</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold uppercase tracking-widest text-slate-700 hover:text-[#1e3a5f] transition-colors">
              Archive
            </Link>
            <Link href="/methodology" className="text-sm font-bold uppercase tracking-widest text-slate-700 hover:text-[#1e3a5f] transition-colors">
              Methodology
            </Link>
             <Link href="/database" className="text-sm font-bold uppercase tracking-widest text-slate-700 hover:text-[#1e3a5f] transition-colors">
              Database
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 text-slate-600 z-50 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      />

      {/* Mobile Sidebar Panel */}
      <aside 
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden z-40 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-6 p-8 mt-24">
          <Link 
            href="/" 
            onClick={toggleMenu}
            className="text-lg font-bold uppercase tracking-widest text-slate-700 hover:text-blue-600"
          >
            Archive
          </Link>
          <Link 
            href="/methodology" 
            onClick={toggleMenu}
            className="text-lg font-bold uppercase tracking-widest text-slate-700 hover:text-blue-600"
          >
            Methodology
          </Link>
          <Link 
            href="/database" 
            onClick={toggleMenu}
            className="text-lg font-bold uppercase tracking-widest text-slate-700 hover:text-blue-600"
          >
            Database
          </Link>
          <div className="h-px bg-slate-100 w-full my-2" />
          <a 
            href="mailto:info@activaterights.org" 
            className="text-sm font-medium text-slate-500 italic"
          >
            Contact Support
          </a>
        </nav>
      </aside>
    </header>
  );
}