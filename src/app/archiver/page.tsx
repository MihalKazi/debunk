"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Archive, Link as LinkIcon, ExternalLink, Copy, CheckCheck, Loader2, AlertTriangle, History, ImageUp, Camera } from "lucide-react";

type ArchivedLink = {
  id: string;
  source_url: string;
  wayback_url: string | null;
  archive_ph_url: string | null;
  status: string;
  is_screenshot: boolean;
  created_at: string;
};

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

const MAX_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 4000;

async function archiveToWayback(
  url: string,
  onProgress: (attempt: number, maxAttempts: number) => void
): Promise<string | null> {
  const submitRes = await fetch("/api/archive", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const submitData = await submitRes.json().catch(() => null);
  if (!submitRes.ok || !submitData?.job_id) {
    throw new Error(submitData?.error || "Failed to submit to Wayback");
  }
  const jobId = submitData.job_id;

  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    onProgress(i, MAX_ATTEMPTS);
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    let data: { status?: string; snapshotUrl?: string; message?: string } | null = null;
    try {
      const res = await fetch(`/api/archive/status?job_id=${encodeURIComponent(jobId)}`);
      data = await res.json();
    } catch {
      continue; // network hiccup, retry
    }
    if (data?.status === "success" && data.snapshotUrl) return data.snapshotUrl;
    if (data?.status === "error") throw new Error(data.message || "Wayback reported an error for this job");
  }
  return null;
}

async function verifySnapshotLive(
  snapshotUrl: string,
  onProgress: (attempt: number, maxAttempts: number) => void,
  attempts = 12,
  delayMs = 10000
): Promise<boolean> {
  for (let i = 1; i <= attempts; i++) {
    onProgress(i, attempts);
    try {
      const res = await fetch(`/api/archive/verify?url=${encodeURIComponent(snapshotUrl)}`);
      const data = await res.json();
      if (data.live) return true;
    } catch {
      // retry
    }
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

export default function ArchiverPage() {
  const router = useRouter();
  const [inputUrl, setInputUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "verifying" | "done" | "error">("idle");
  const [archiveUrl, setArchiveUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState({ attempt: 0, max: MAX_ATTEMPTS });
  const [urlVerifyProgress, setUrlVerifyProgress] = useState({ attempt: 0, max: 12 });
  const [history, setHistory] = useState<ArchivedLink[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotStatus, setScreenshotStatus] = useState<"idle" | "uploading" | "loading" | "verifying" | "done" | "error">("idle");
  const [screenshotProgress, setScreenshotProgress] = useState({ attempt: 0, max: MAX_ATTEMPTS });
  const [verifyProgress, setVerifyProgress] = useState({ attempt: 0, max: 12 });
  const [screenshotResult, setScreenshotResult] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState("");
  const [screenshotFallbackUrl, setScreenshotFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login?redirect=/archiver");
        return;
      }
      setUserEmail(session.user.email ?? null);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login?redirect=/archiver");
    });
    return () => listener.subscription.unsubscribe();
  }, [router]);

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase
      .from("archived_links")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory(data || []);
  }, []);

  useEffect(() => {
    if (authChecked) fetchHistory();
  }, [authChecked, fetchHistory]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login?redirect=/archiver");
  };

  const logSubmission = async (url: string, extra: Partial<ArchivedLink> = {}) => {
    const { data, error } = await supabase
      .from("archived_links")
      .insert([{ source_url: url, status: "pending", ...extra }])
      .select()
      .single();
    if (error) console.error("logSubmission insert failed:", error.message);
    fetchHistory();
    return data as ArchivedLink | null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = normalizeUrl(inputUrl);
    if (!url) return;

    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      setStatus("error");
      setErrorMsg("Local URLs can't be archived.");
      return;
    }

    setStatus("loading");
    setArchiveUrl(null);
    setErrorMsg("");
    setProgress({ attempt: 0, max: MAX_ATTEMPTS });

    const row = await logSubmission(url);

    try {
      const snapshot = await archiveToWayback(url, (attempt, max) => setProgress({ attempt, max }));
      if (snapshot) {
        setArchiveUrl(snapshot);
        if (row) {
          await supabase.from("archived_links").update({ wayback_url: snapshot, status: "done" }).eq("id", row.id);
          fetchHistory();
        }

        setStatus("verifying");
        setUrlVerifyProgress({ attempt: 0, max: 12 });
        await verifySnapshotLive(snapshot, (attempt, max) => setUrlVerifyProgress({ attempt, max }));
        setStatus("done");
      } else {
        setStatus("error");
        setErrorMsg("Snapshot not confirmed after polling. Wayback may still be processing — try again shortly.");
        if (row) await supabase.from("archived_links").update({ status: "failed" }).eq("id", row.id);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Archive request failed. Check the URL and try again.");
      if (row) await supabase.from("archived_links").update({ status: "failed" }).eq("id", row.id);
    } finally {
      fetchHistory();
    }
  };

  const handleCopy = () => {
    if (!archiveUrl) return;
    navigator.clipboard.writeText(archiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCaptureTab = async () => {
    setScreenshotError("");
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: "browser" } as MediaTrackConstraints });
      const track = stream.getVideoTracks()[0];

      const imageCapture = new ImageCapture(track) as unknown as { grabFrame: () => Promise<ImageBitmap> };
      const bitmap: ImageBitmap = await imageCapture.grabFrame();

      track.stop();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(bitmap, 0, 0);

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        setScreenshotError("Capture failed — couldn't read the shared tab.");
        return;
      }
      setScreenshotFile(new File([blob], `capture-${Date.now()}.png`, { type: "image/png" }));
    } catch (err: any) {
      if (err?.name !== "NotAllowedError") {
        setScreenshotError("Capture failed or was cancelled. Try again, or upload a screenshot file instead.");
      }
    }
  };

  const handleScreenshotArchive = async () => {
    if (!screenshotFile) return;
    const sourceUrl = normalizeUrl(inputUrl);
    if (!sourceUrl) {
      setScreenshotStatus("error");
      setScreenshotError("Paste the page's URL in the box above first — the browser can't read it from the screenshot.");
      return;
    }

    setScreenshotStatus("uploading");
    setScreenshotResult(null);
    setScreenshotError("");
    setScreenshotFallbackUrl(null);
    setScreenshotProgress({ attempt: 0, max: MAX_ATTEMPTS });

    const fileExt = screenshotFile.name.split(".").pop() || "png";
    const fileName = `archiver-temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("evidence").upload(fileName, screenshotFile);
    if (uploadError) {
      setScreenshotStatus("error");
      setScreenshotError("Upload failed: " + uploadError.message);
      return;
    }
    const publicUrl = supabase.storage.from("evidence").getPublicUrl(fileName).data.publicUrl;
    const proxyUrl = `${window.location.origin}/api/evidence/${fileName}`;

    const row = await logSubmission(sourceUrl, { is_screenshot: true });

    setScreenshotStatus("loading");
    try {
      const snapshot = await archiveToWayback(proxyUrl, (attempt, max) => setScreenshotProgress({ attempt, max }));
      if (snapshot) {
        setScreenshotResult(snapshot);
        if (row) {
          await supabase.from("archived_links").update({ wayback_url: snapshot, status: "done" }).eq("id", row.id);
          fetchHistory();
        }

        setScreenshotStatus("verifying");
        setVerifyProgress({ attempt: 0, max: 12 });
        const live = await verifySnapshotLive(snapshot, (attempt, max) => setVerifyProgress({ attempt, max }));
        if (live) {
          await supabase.storage.from("evidence").remove([fileName]);
        } else {
          // Wayback said success but hasn't indexed it yet — keep our copy so nothing is lost.
          setScreenshotFallbackUrl(publicUrl);
        }
        setScreenshotStatus("done");
      } else {
        setScreenshotStatus("error");
        setScreenshotError("Snapshot not confirmed. Screenshot stays in storage — link below still works as a fallback.");
        setScreenshotFallbackUrl(publicUrl);
        if (row) await supabase.from("archived_links").update({ status: "failed", wayback_url: publicUrl }).eq("id", row.id);
      }
    } catch (err) {
      setScreenshotStatus("error");
      setScreenshotError(err instanceof Error ? err.message : "Archive request failed. Screenshot stays in storage as a fallback.");
      setScreenshotFallbackUrl(publicUrl);
      if (row) await supabase.from("archived_links").update({ status: "failed", wayback_url: publicUrl }).eq("id", row.id);
    } finally {
      fetchHistory();
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400">{userEmail}</span>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
            <Archive className="text-blue-600" size={28} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Wayback Archiver</h1>
          <p className="text-slate-500 font-medium">Paste a link, get a permanent Wayback Machine snapshot.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="https://example.com/article"
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-sm transition-all"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={status === "loading"}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || status === "verifying" || !inputUrl.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Archiving…
              </>
            ) : status === "verifying" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying snapshot…
              </>
            ) : (
              <>
                <Archive size={18} /> Archive URL
              </>
            )}
          </button>

          {status === "loading" && (
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, (progress.attempt / progress.max) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-400 text-center">
                Checking snapshot {progress.attempt}/{progress.max} · ~{Math.max(0, progress.max - progress.attempt) * (POLL_INTERVAL_MS / 1000)}s left
              </p>
            </div>
          )}

          {status === "verifying" && (
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (urlVerifyProgress.attempt / urlVerifyProgress.max) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-400 text-center">
                Confirming Wayback has indexed it — {urlVerifyProgress.attempt}/{urlVerifyProgress.max}
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          {status === "done" && archiveUrl && (
            <div className="mt-5 p-5 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Archived Snapshot</p>
              <div className="flex items-center gap-2">
                <a
                  href={archiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 truncate"
                >
                  <ExternalLink size={16} className="shrink-0" />
                  <span className="truncate">{archiveUrl}</span>
                </a>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 transition-all"
                >
                  {copied ? <CheckCheck size={16} className="text-emerald-600" /> : <Copy size={16} className="text-slate-500" />}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-1">
            <Camera size={18} className="text-slate-400" />
            <h3 className="font-black text-slate-900">Archive a Screenshot</h3>
          </div>
          <p className="text-sm text-slate-500 font-medium mb-5">
            For gated pages Wayback can&apos;t reach (e.g. Facebook posts needing login). Paste the page&apos;s URL in the box above (required — the browser can&apos;t read it from a screenshot), then capture the tab or upload a screenshot. It archives to Wayback as an image, then gets removed from our storage.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCaptureTab}
              disabled={screenshotStatus === "uploading" || screenshotStatus === "loading"}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Camera size={20} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-500">Capture Open Tab</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                disabled={screenshotStatus === "uploading" || screenshotStatus === "loading" || screenshotStatus === "verifying"}
              />
              <ImageUp size={20} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-500">Upload File</span>
            </label>
          </div>

          {screenshotFile && (
            <p className="mt-3 text-xs font-bold text-emerald-600 text-center">✓ {screenshotFile.name} ready to archive</p>
          )}

          <button
            type="button"
            onClick={handleScreenshotArchive}
            disabled={!screenshotFile || !inputUrl.trim() || screenshotStatus === "uploading" || screenshotStatus === "loading" || screenshotStatus === "verifying"}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {screenshotStatus === "uploading" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Uploading…
              </>
            ) : screenshotStatus === "loading" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Archiving…
              </>
            ) : screenshotStatus === "verifying" ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Verifying snapshot…
              </>
            ) : (
              <>
                <Camera size={18} /> Archive Screenshot
              </>
            )}
          </button>

          {screenshotStatus === "loading" && (
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-slate-900 transition-all duration-500"
                  style={{ width: `${Math.min(100, (screenshotProgress.attempt / screenshotProgress.max) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-400 text-center">
                Checking snapshot {screenshotProgress.attempt}/{screenshotProgress.max}
              </p>
            </div>
          )}

          {screenshotStatus === "verifying" && (
            <div className="mt-4">
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (verifyProgress.attempt / verifyProgress.max) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-400 text-center">
                Confirming Wayback has indexed it — {verifyProgress.attempt}/{verifyProgress.max} (this can take a couple of minutes)
              </p>
            </div>
          )}

          {screenshotStatus === "error" && (
            <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-start gap-3 text-red-700 text-sm font-medium">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                {screenshotError}
              </div>
              {screenshotFallbackUrl && (
                <a
                  href={screenshotFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 truncate"
                >
                  <ExternalLink size={16} className="shrink-0" />
                  <span className="truncate">{screenshotFallbackUrl}</span>
                </a>
              )}
            </div>
          )}

          {screenshotStatus === "done" && screenshotResult && (
            <div className="mt-5 p-5 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Archived Screenshot</p>
              <a
                href={screenshotResult}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 truncate"
              >
                <ExternalLink size={16} className="shrink-0" />
                <span className="truncate">{screenshotResult}</span>
              </a>
              {screenshotFallbackUrl && (
                <p className="mt-3 text-xs text-slate-500 font-medium">
                  Wayback hasn&apos;t finished indexing this yet, so we kept a backup copy:{" "}
                  <a href={screenshotFallbackUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">
                    view backup
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        {history.some((h) => h.wayback_url) && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4 text-slate-500">
              <History size={18} />
              <h2 className="font-black uppercase text-xs tracking-widest">Your History</h2>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-50">
              {history.filter((h) => h.wayback_url).map((h) => (
                <div key={h.id} className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {h.is_screenshot && <Camera size={14} className="shrink-0 text-slate-400" />}
                    <span className="flex-1 truncate text-xs font-medium text-slate-500">{h.source_url}</span>
                  </div>
                  <a
                    href={h.wayback_url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline truncate"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="truncate">{h.wayback_url}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
