import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Calendar, ArrowLeft, Globe, ExternalLink, ShieldCheck, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic rendering so newly published debunks appear instantly
export const revalidate = 0; 

type Props = {
  params: Promise<{ slug: string }>;
};

// --- 1. SEO & METADATA GENERATION ---
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params; 
  const { data: post } = await supabase
    .from("debunks")
    .select("title, summary, media_url")
    .eq("slug", params.slug)
    .single();

  if (!post) return { title: "GNG | Case Not Found" };
  
  const description = post.summary?.substring(0, 160) || "Forensic analysis of synthetic media.";
  
  return {
    title: `Fact Check: ${post.title} | GNG Repository`,
    description: description,
    alternates: {
      canonical: `https://aigng.activaterights.org/debunk/${params.slug}`,
    },
    openGraph: {
      title: `Verification: ${post.title}`,
      description: description,
      type: 'article',
      url: `https://aigng.activaterights.org/debunk/${params.slug}`,
      images: [{ url: post.media_url || "/og-image.jpg" }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: [post.media_url || "/og-image.jpg"],
    }
  };
}

export default async function DebunkDetail(props: Props) {
  const params = await props.params; 
  const { slug } = params;

  // Fetch Case Data from Supabase
  const { data: post } = await supabase
    .from("debunks")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  const fullUrl = `https://aigng.activaterights.org/debunk/${post.slug}`;

  // --- 2. SEO SCHEMA GRAPH (ClaimReview + Breadcrumbs) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ClaimReview",
        "datePublished": post.occurrence_date || post.created_at,
        "url": fullUrl,
        "claimReviewed": post.title,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": post.verdict === "Fake" ? "1" : "3",
          "bestRating": "5",
          "worstRating": "1",
          "alternateName": post.verdict
        },
        "author": {
          "@type": "Organization",
          "name": "GNG Archive",
          "logo": "https://aigng.activaterights.org/logo.svg"
        },
        "itemReviewed": {
          "@type": "Claim",
          "appearance": [{ "@type": "CreativeWork", "url": post.source_link || "" }]
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "GNG Archive",
            "item": "https://aigng.activaterights.org"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": post.title,
            "item": fullUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --- STICKY NAVIGATION --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-slate-500 hover:text-[#1e3a5f] font-bold text-[10px] tracking-widest transition-colors uppercase">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Archive
          </Link>
          
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 bg-[#1e3a5f] rounded flex items-center justify-center shadow-sm">
                <span className="text-white text-[12px] font-serif font-bold">G</span>
             </div>
             <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400">GNG Repository</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* --- HEADER SECTION --- */}
        <header className="max-w-3xl mb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
              post.verdict === 'Fake' 
              ? 'bg-red-500 text-white' 
              : 'bg-orange-500 text-white'
            }`}>
              {post.verdict}
            </span>
            <span className="text-slate-400 text-xs font-bold flex items-center uppercase tracking-widest">
              <Calendar className="h-4 w-4 mr-2 text-slate-300" />
              {new Date(post.occurrence_date || post.created_at).toLocaleDateString('en-US', { 
                month: 'long', day: 'numeric', year: 'numeric' 
              })}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 font-serif leading-[1.1] tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">Archive UUID: {post.id}</p>
        </header>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-10">
            {/* Image Section */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 group">
              {post.media_url ? (
                <img 
                  src={post.media_url} 
                  alt={`Forensic evidence for claim: ${post.title}`} 
                  className="w-full h-auto max-h-[700px] object-contain mx-auto bg-slate-900"
                />
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-100">
                  <Globe size={48} className="opacity-10 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Evidence Logged: No Media</span>
                </div>
              )}
            </div>

            {/* Analysis Section */}
            <article className="bg-white p-10 md:p-14 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldCheck size={120} />
               </div>
              
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <span className="w-8 h-px bg-blue-600"></span>
                Verification Summary
              </h2>
              
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
                {post.summary}
              </p>

              {post.source_link && (
                <div className="mt-12 pt-10 border-t border-slate-100">
                  <a 
                    href={post.source_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-[#1e3a5f] text-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                      <ExternalLink size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">Verified Reference</p>
                      <p className="text-sm font-bold text-slate-900 underline decoration-slate-200 underline-offset-4 tracking-tight">View Original Source Data</p>
                    </div>
                  </a>
                </div>
              )}
            </article>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#1e3a5f] p-8 rounded-[2rem] text-white shadow-2xl sticky top-28">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 border-b border-white/10 pb-4">Archive Details</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Severity</label>
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${post.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`} />
                    <p className="font-serif text-xl capitalize">{post.severity || "Standard"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Target Region</label>
                  <p className="font-serif text-xl capitalize">{post.country || "International"}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {post.tags?.map((tag: string) => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-bold uppercase rounded-md">#{tag}</span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="w-full py-4 mt-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={14} /> Export Metadata PDF
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}