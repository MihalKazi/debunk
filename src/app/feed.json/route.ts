import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    // 1. Fetch the data from your Supabase table
    const { data, error } = await supabase
      .from("debunks")
      .select("title, slug, summary, verdict, occurrence_date, media_url")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 2. Format the response for "Everyone"
    const feed = {
      version: "1.0",
      title: "GNG Public Truth Feed",
      home_page_url: "https://aigng.activaterights.org",
      description: "A public feed of verified AI-generated content and deepfakes.",
      items: data.map((item) => ({
        id: item.slug,
        url: `https://aigng.activaterights.org/debunk/${item.slug}`,
        title: item.title,
        content_text: item.summary,
        date_published: item.occurrence_date,
        image: item.media_url,
        _verdict: item.verdict
      })),
    };

    // 3. Return the JSON with the correct headers
    return NextResponse.json(feed, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate", // Updates every hour
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}