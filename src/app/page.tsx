"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendChart from "@/components/TrendChart";
import DebunkFeed from "@/components/DebunkFeed";
import Footer from "@/components/Footer"; 

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <HeroSection />
      
      <TrendChart />
      
      <DebunkFeed />
      
      <Footer />
    </main>
  );
}