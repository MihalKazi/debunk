"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-[99] p-4 bg-[#1e3a5f] text-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(30,58,95,0.4)] border border-white/10 transition-all duration-500 hover:bg-blue-600 group ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      aria-label="Back to Top"
    >
      <div className="absolute inset-0 rounded-2xl bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      
      {/* Icon with hover animation */}
      <ArrowUp 
        size={24} 
        strokeWidth={3} 
        className="relative z-10 group-hover:-translate-y-1 transition-transform duration-300" 
      />
      
      {/* Tech Decoration */}
      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
    </button>
  );
}