import { supabase } from "@/lib/supabaseClient";

// --- UTILS ---
export const detectSiteName = (url: string) => {
  if (!url) return "";
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("rumorscanner.com")) return "Rumour Scanner";
  if (lowerUrl.includes("dismislab.com")) return "Dismislab";
  if (lowerUrl.includes("fact-watch.org")) return "FactWatch";
  if (lowerUrl.includes("facebook.com")) return "Facebook";
  if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return "X (Twitter)";
  if (lowerUrl.includes("youtube.com")) return "YouTube";
  if (lowerUrl.includes("boomlive.in")) return "BOOM Live";
  return "";
};

export const getTodayStr = () => new Date().toLocaleDateString('en-CA');

// --- DATABASE ACTIONS ---

/**
 * Uploads a file to Supabase storage and returns the public URL
 */
export async function uploadEvidence(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage.from('evidence').upload(fileName, file);
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(fileName);
  return publicUrl;
}

/**
 * Saves a new debunk or updates an existing one
 */
export async function saveDebunkEntry(reviewData: any, manualFile: File | null, isEditing: boolean) {
  let finalMediaUrl = reviewData.media_url;

  if (manualFile) {
    finalMediaUrl = await uploadEvidence(manualFile);
  }

  const payload = {
    title: reviewData.title,
    summary: reviewData.summary,
    verdict: reviewData.verdict,
    severity: reviewData.severity,
    platform: reviewData.platform,
    country: reviewData.country,
    source: reviewData.source,
    media_url: finalMediaUrl,
    source_link: reviewData.source_link,
    occurrence_date: reviewData.occurrence_date,
  };

  if (isEditing) {
    const { error } = await supabase.from("debunks").update(payload).eq("id", reviewData.id);
    if (error) throw error;
  } else {
    const slugToUse = reviewData.slug || reviewData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
    const { error: insertError } = await supabase.from("debunks").insert([{ ...payload, slug: slugToUse }]);
    if (insertError) throw insertError;
    
    // If it was a pending item, delete it from pending after successful publish
    await supabase.from("pending_scrapes").delete().eq("id", reviewData.id);
  }
}

/**
 * Deletes a record from either table
 */
export async function deleteRecord(id: string, table: "debunks" | "pending_scrapes") {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}