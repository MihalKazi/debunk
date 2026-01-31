"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, Globe } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "January 30, 2026";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header Section */}
      <header className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last Updated: {lastUpdated}</p>
        </div>
      </header>

      {/* Content Section */}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="prose prose-slate max-w-none">
          
          <section className="mb-12">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4 font-serif">
              <Globe className="text-blue-500" size={24} /> 1. Overview
            </h2>
            <p className="text-slate-600 leading-relaxed">
              The GNG Archive ("we," "our," or "the Platform"), hosted under <strong>activaterights.org</strong>, is committed to transparency and data integrity. This policy explains how we handle information gathered through our AI scraping tools and manual archival processes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4 font-serif">
              <FileText className="text-blue-500" size={24} /> 2. Data Collection
            </h2>
            <p className="text-slate-600 mb-4">We collect two types of data:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Public Archive Data:</strong> Information regarding misinformation, AI-generated content, and news metadata collected via public scraping for historical preservation.</li>
              <li><strong>Admin Information:</strong> Secure credentials used strictly for authorized administrative access.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4 font-serif">
              <Eye className="text-blue-500" size={24} /> 3. Use of Information
            </h2>
            <p className="text-slate-600">Information archived on this platform is used solely for:</p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-600">
              <li>Public education and media literacy.</li>
              <li>Tracking the spread of AI-generated misinformation.</li>
              <li>Providing a searchable database for human rights verification.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-4 font-serif">
              <Lock className="text-blue-500" size={24} /> 4. Data Security
            </h2>
            <p className="text-slate-600 mb-4">
              We implement industry-standard security measures provided by <strong>Vercel</strong> and <strong>Supabase</strong> to protect our repository. 
            </p>
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-800 m-0 font-medium">
                <strong>Note:</strong> We do not sell, trade, or rent personal user data. All scraped content is preserved for historical accuracy and public verification.
              </p>
            </div>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif">5. Contact Us</h2>
            <p className="text-slate-600">
              Questions regarding this policy? Reach out to the research team at:
            </p>
            <p className="font-bold text-blue-600 mt-2">info@activaterights.org</p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}