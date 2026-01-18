import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendChart from "@/components/TrendChart";
import DebunkFeed from "@/components/DebunkFeed";
import Methodology from "@/components/Methodology";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <HeroSection />
      <TrendChart />
      <DebunkFeed />
      <Methodology />
      
      {/* Footer */}
      <footer className="py-8 border-t border-slate-700 bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <span className="font-serif font-bold">AIFNR</span>
             <p className="text-sm opacity-70">© 2024-26 Fake News Repository</p>
          </div>
          <div className="flex gap-6 text-sm opacity-70">
            <a href="#" className="hover:opacity-100">Privacy</a>
            <a href="#" className="hover:opacity-100">Terms</a>
            <a href="#" className="hover:opacity-100">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}