import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Calendar, ArrowLeft, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Force dynamic rendering so new debunks appear instantly
export const revalidate = 0; 

type Props = {
  params: Promise<{ slug: string }>;
};

// 2. SEO Title Generation
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params; 
  
  const { data: post } = await supabase
    .from("debunks")
    .select("title")
    .eq("slug", params.slug)
    .single();

  if (!post) return { title: "Not Found" };
  
  return {
    title: `Fact Check: ${post.title} | Debunk Repository`,
    description: `Analysis and verification of the claim: ${post.title}`,
  };
}

export default async function DebunkDetail(props: Props) {
  const params = await props.params; 
  const { slug } = params;

  // 3. Fetch Data
  const { data: post } = await supabase
    .from("debunks")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  // 4. Construct JSON-LD (Schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    "datePublished": post.occurrence_date || post.created_at,
    "url": `https://your-site.com/debunk/${post.slug}`,
    "claimReviewed": post.title,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": post.verdict === "Fake" ? "1" : post.verdict === "Satire" ? "2" : "3",
      "bestRating": "5",
      "worstRating": "1",
      "alternateName": post.verdict
    },
    "author": {
      "@type": "Organization",
      "name": "Debunk AI Repository"
    },
    "itemReviewed": {
      "@type": "Claim",
      "appearance": [
        {
          "@type": "CreativeWork",
          "url": post.source_link || ""
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO REPOSITORY
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              post.verdict === 'Fake' ? 'bg-red-100 text-red-700 border border-red-200' : 
              post.verdict === 'Satire' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {post.verdict}
            </span>
            <span className="text-slate-400 text-xs font-bold flex items-center uppercase tracking-tighter">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {/* USE SHEET DATE IF AVAILABLE */}
              {new Date(post.occurrence_date || post.created_at).toLocaleDateString('en-US', { 
                month: 'long', day: 'numeric', year: 'numeric' 
              })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Evidence Image */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-10 border border-slate-200 relative group">
          {post.media_url ? (
            <img 
              src={post.media_url} 
              alt="Evidence" 
              className="w-full max-h-[500px] object-contain mx-auto bg-slate-50"
            />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Globe size={40} className="opacity-20" />
              <span className="text-sm font-medium">Digital trace verified. Image evidence not archived.</span>
            </div>
          )}
        </div>

        {/* Analysis Body */}
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Verification Analysis
              </h2>
              <p className="text-xl text-slate-800 leading-relaxed whitespace-pre-wrap font-serif">
                {post.summary}
              </p>

              {/* NEW: SOURCE LINK SECTION */}
              {post.source_link && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-blue-600">
                        <Globe size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Original News Source</h4>
                        <p className="text-[11px] text-slate-500 font-medium">Verified external reference</p>
                      </div>
                    </div>
                    <a 
                      href={post.source_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto text-center bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      Visit News Site
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                Case Metadata
              </h3>
              
              <div className="space-y-5">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Impact Level</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full animate-pulse ${
                      post.severity === 'critical' ? 'bg-red-600' : 
                      post.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-400'
                    }`} />
                    <span className="font-bold text-sm text-slate-900 capitalize">{post.severity || "Standard"}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Classification</span>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags && post.tags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}