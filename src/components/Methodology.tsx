import { ScanFace, ShieldCheck, Database } from "lucide-react";

export default function Methodology() {
  return (
    <section id="methodology" className="py-20 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-3xl font-bold mb-4 text-[#1e3a5f]">
            Verification Methodology
          </h2>
          <p className="text-slate-600">
            Our rigorous three-step process ensures every case in the archive is accurately identified and verified.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 text-center">
          {/* Step 1: Detection */}
          <div className="p-6">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
              <ScanFace className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">
              1. AI Detection
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              We utilize state-of-the-art forensic tools to analyze visual artifacts, metadata anomalies, and diffusion patterns characteristic of generative AI models.
            </p>
          </div>

          {/* Step 2: Verification */}
          <div className="p-6 relative">
            {/* Arrow for Desktop */}
            <div className="hidden md:block absolute top-10 -right-5 text-slate-200 text-4xl">→</div>
            
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">
              2. Expert Review
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every flagged item is cross-referenced by certified fact-checkers to confirm the absence of real-world evidence and trace the original source.
            </p>
          </div>

          {/* Step 3: Documentation */}
          <div className="p-6">
            <div className="hidden md:block absolute top-10 -left-5 text-slate-200 text-4xl">→</div>
            
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1e3a5f]">
              <Database className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3 text-[#1e3a5f]">
              3. Archival
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Confirmed cases are cataloged with "ClaimReview" schema tags, making them accessible to researchers, journalists, and search engines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}