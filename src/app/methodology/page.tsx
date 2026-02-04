import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScanFace, ShieldCheck, Database, FileText, Globe, Search } from "lucide-react";

// This makes the page SEO friendly
export const metadata = {
  title: "Methodology | GNG AI Verification Protocol",
  description: "The technical and forensic standards used by GNG to verify synthetic media and deepfakes.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-12 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-[#1e3a5f] mb-6 tracking-tight">
              Our Methodology
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed font-serif italic">
              &ldquo;Establishing a forensic standard for the era of synthetic media.&rdquo;
            </p>
          </div>
        </section>

        {/* The 3-Step Process (Your Component) */}
        <section className="bg-white py-20 border-y border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif text-3xl font-bold mb-4 text-[#1e3a5f]">
                The Verification Pipeline
              </h2>
              <p className="text-slate-600">
                GNG employs a multi-layered verification strategy combining algorithmic detection with human intelligence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 text-center relative">
              {/* Step 1: Detection */}
              <div className="p-6 relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
                  <ScanFace className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">1. AI Detection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We utilize GNG tools to analyze visual artifacts, metadata anomalies, and diffusion patterns characteristic of generative AI.
                </p>
              </div>

              {/* Step 2: Verification */}
              <div className="p-6 relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">2. Expert Review</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every item is cross-referenced by analysts to confirm the absence of real-world evidence and trace the original machine-generated source.
                </p>
              </div>

              {/* Step 3: Documentation */}
              <div className="p-6 relative z-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
                  <Database className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">3. Archival</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Confirmed cases are cataloged with ClaimReview schema tags for global transparency across researchers and search engines.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Standards Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1e3a5f] mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-500" /> Forensic Indicators
              </h3>
              <ul className="space-y-4 text-slate-600 text-sm">
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Frequency Domain Analysis:</strong> Checking for "checkerboard artifacts" in the image's spectrum.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Biological Consistency:</strong> Evaluating anatomical accuracy, eye reflections, and hair-line rendering.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Metadata Forensics:</strong> Analyzing EXIF data for evidence of AI-generation software or inconsistent timestamps.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#1e3a5f] p-8 rounded-[2rem] text-white">
              <h3 className="font-serif text-2xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-400" /> Ethical Transparency
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                GNG follows the International Fact-Checking Network (IFCN) principles. We remain non-partisan and focused strictly on the technical authenticity of media.
              </p>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Standard Reference</p>
                <p className="text-xs font-mono">GNG-VERIFY-PROTOCOL-V2.4</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}