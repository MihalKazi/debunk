import { supabase } from "@/lib/supabaseClient";
import { AlertTriangle, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Force dynamic rendering so new debunks appear instantly
export const revalidate = 0; 

// 2. UPDATE: params is now a Promise in Next.js 15+
type Props = {
  params: Promise<{ slug: string }>;
};

// 3. SEO Title Generation
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params; // <--- AWAITING PARAMS HERE
  
  const { data: post } = await supabase
    .from("debunks")
    .select("title")
    .eq("slug", params.slug)
    .single();

  if (!post) return { title: "Not Found" };
  
  return {
    title: `Fact Check: ${post.title} | Debunk.`,
    description: `Analysis and verification of the claim: ${post.title}`,
  };
}

export default async function DebunkDetail(props: Props) {
  const params = await props.params; // <--- AWAITING PARAMS HERE
  const { slug } = params;

  // 4. Fetch Data using the awaited slug
  const { data: post } = await supabase
    .from("debunks")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!post) notFound();

  // 5. Construct JSON-LD (The "ClaimReview" Schema)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    "datePublished": post.created_at,
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
      "name": "Debunk. AI Repository"
    },
    "itemReviewed": {
      "@type": "Claim",
      "appearance": [
        {
          "@type": "CreativeWork",
          "url": post.media_url || ""
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Inject Schema for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center text-slate-500 hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Repository
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${
              post.verdict === 'Fake' ? 'bg-red-100 text-red-700' : 
              post.verdict === 'Satire' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
            }`}>
              {post.verdict}
            </span>
            <span className="text-slate-500 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 font-serif leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Evidence Image */}
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl mb-10 border border-slate-800 relative group">
          {post.media_url ? (
            <img 
              src={post.media_url} 
              alt="Evidence" 
              className="w-full max-h-[600px] object-contain mx-auto"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No media evidence attached.
            </div>
          )}
        </div>

        {/* Analysis Body */}
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                Fact-Check Analysis
              </h2>
              <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
                {post.summary}
              </p>
            </section>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Case Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-xs text-slate-500 mb-1">Severity Level</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${
                      post.severity === 'critical' ? 'bg-red-600' : 
                      post.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-400'
                    }`} />
                    <span className="font-medium text-slate-900 capitalize">{post.severity || "Medium"}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs text-slate-500 mb-1">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags && post.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
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