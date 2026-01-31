"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendChart from "@/components/TrendChart";
import DebunkFeed from "@/components/DebunkFeed";
import Methodology from "@/components/Methodology";
import Footer from "@/components/Footer"; // Import the shared footer

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <HeroSection />
      
      <TrendChart />
      
      <DebunkFeed />
      
      {/* Methodology section is kept here for the home view, 
          while the footer link directs to the dedicated full page. 
      */}
      <Methodology />
      
      <Footer />
    </main>
  );
}