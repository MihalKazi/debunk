"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion, Variants } from "framer-motion"; // <-- Added Variants here
import { 
  Database, 
  Globe, 
  Search, 
  CalendarClock, 
  Filter, 
  Archive, 
  ServerCog,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";

// NOTE: Move this metadata to your layout.tsx or a parent Server Component wrapper
/*
export const metadata = {
  title: "Methodology | GNG AI Verification Protocol",
  description: "The methodology, data collection architecture, and preservation standards for tracking AI misinformation in Bangladesh.",
};
*/

export default function MethodologyPage() {
  // Animation Variants with explicit Types to satisfy TypeScript build
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      <Navbar />
      
      <main className="pt-12 pb-20">
        
        {/* --- HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 relative">
          <div className="max-w-4xl">
            
            {/* Back Button */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-500 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                BACK TO DASHBOARD
              </Link>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="font-serif text-5xl md:text-6xl font-bold text-[#1e3a5f] mb-6 tracking-tight"
            >
              GNG Methodology
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-xl text-slate-600 leading-relaxed font-serif italic mb-6"
            >
              Systematically monitoring, aggregating, and visualizing the spread of AI-generated misinformation in Bangladesh, with a focus on the National Election 2026.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 text-blue-800 rounded-full text-sm font-medium shadow-sm border border-blue-200"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Baseline Established: December 11, 2025</span>
            </motion.div>
          </div>
        </section>

        {/* --- THE PIPELINE SECTION --- */}
        <section className="bg-white py-24 border-y border-slate-200 shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="font-serif text-3xl font-bold mb-4 text-[#1e3a5f]">
                Data Architecture & Processing
              </h2>
              <p className="text-slate-600">
                A continuous, automated pipeline designed to capture and verify synthetic media incidents in near real-time across the pre-election information ecosystem.
              </p>
            </motion.div>

            {/* Staggered Grid */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid md:grid-cols-4 gap-8 text-center relative"
            >
              {/* Step 1: Collection */}
              <motion.div variants={fadeInUp} className="p-6 relative z-10 group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <ServerCog className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">1. Automated Collection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Custom Google Apps Scripts execute at 15-minute intervals to detect new reports. Data is restricted via keyword filters (e.g., “AI,” “Deepfake,” “Synthetic Media”).
                </p>
              </motion.div>

              {/* Step 2: Processing */}
              <motion.div variants={fadeInUp} className="p-6 relative z-10 group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">2. Structuring</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Raw data is parsed to extract key metadata: original headline, claim summary, source outlet, publication date, and direct URL for consistent indexing.
                </p>
              </motion.div>

              {/* Step 3: Deployment & Validation */}
              <motion.div variants={fadeInUp} className="p-6 relative z-10 group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Database className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">3. Deployment</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Processed data feeds the public dashboard. A designated researcher performs daily manual validations to ensure frontend accuracy and integrity.
                </p>
              </motion.div>

              {/* Step 4: Archival */}
              <motion.div variants={fadeInUp} className="p-6 relative z-10 group">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                  <Archive className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">4. Preservation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every recorded URL is instantly archived via the Internet Archive’s Wayback Machine, safeguarding evidentiary integrity against future deletions.
                </p>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* --- SOURCES & STANDARDS SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Data Sources */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <motion.h3 variants={fadeInUp} className="font-serif text-2xl font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-500" /> Verified Data Sources
              </motion.h3>
              <motion.p variants={fadeInUp} className="text-sm text-slate-600 mb-8 leading-relaxed">
                The dashboard tracks verification reports from seven established fact-checking organizations in Bangladesh, selected for their credibility, continuity, and recognized contributions.
              </motion.p>
              
              <div className="grid grid-cols-2 gap-4">
                {["Rumor Scanner", "BoomBD", "NewsChecker", "Fact Crescendo", "Fact Watch", "Dismislab", "The Dissent"].map((source, idx) => (
                  <motion.div 
                    key={idx} 
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    <span className="font-medium text-slate-700">{source}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Right Column: Technical & Ethical Block */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="bg-[#1e3a5f] p-8 md:p-10 rounded-[2rem] text-white shadow-xl relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <h3 className="font-serif text-2xl font-bold mb-8 flex items-center gap-3 relative z-10">
                <Globe className="w-6 h-6 text-blue-400" /> Deployment & Integrity
              </h3>
              
              <div className="space-y-8 relative z-10">
                <div>
                  <h4 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> Public Accessibility
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed pl-3.5 border-l border-blue-500/30">
                    The dataset is rendered on a publicly accessible web interface hosted at <strong>aigng.activaterights.org</strong>, providing researchers, journalists, and the public with a searchable repository of AI incidents.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div> Research Reliability
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed pl-3.5 border-l border-blue-500/30">
                    By integrating automated Wayback Machine archiving, the project ensures persistent access to original materials. This layer strengthens transparency, reproducibility, and long-term scholarly reliability.
                  </p>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10 relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Database Engine</p>
                  <p className="text-xs font-mono text-slate-200">Google Sheets + Apps Script</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Target Event</p>
                  <p className="text-xs font-mono text-slate-200">BD Election '26</p>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}