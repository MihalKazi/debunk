"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  ArrowLeft,
  Archive,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  AlertTriangle,
  History,
  ImageUp,
  Camera,
  Plus,
  Trash2,
} from "lucide-react";

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

type EntryStatus = "idle" | "uploading" | "loading" | "verifying" | "done" | "error";

type Entry = {
  clientId: string;
  url: string;
  file: File | null;
  status: EntryStatus;
  progress: { attempt: number; max: number };
  verifyProgress: { attempt: number; max: number };
  result: string | null;
  fallbackUrl: string | null;
  error: string;
};

function newEntry(): Entry {
  return {
    clientId: Math.random().toString(36).slice(2),
    url: "",
    file: null,
    status: "idle",
    progress: { attempt: 0, max: MAX_ATTEMPTS },
    verifyProgress: { attempt: 0, max: 12 },
    result: null,
    fallbackUrl: null,
    error: "",
  };
}

export default function ArchiverPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([newEntry()]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [history, setHistory] = useState<ArchivedLink[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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

  const updateEntry = (clientId: string, patch: Partial<Entry>) => {
    setEntries((prev) => prev.map((e) => (e.clientId === clientId ? { ...e, ...patch } : e)));
  };

  const addEntry = () => setEntries((prev) => [...prev, newEntry()]);

  const removeEntry = (clientId: string) =>
    setEntries((prev) => (prev.length > 1 ? prev.filter((e) => e.clientId !== clientId) : prev));

  const handleCaptureTab = async (clientId: string) => {
    updateEntry(clientId, { error: "" });
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
        updateEntry(clientId, { error: "Capture failed — couldn't read the shared tab." });
        return;
      }
      updateEntry(clientId, { file: new File([blob], `capture-${Date.now()}.png`, { type: "image/png" }) });
    } catch (err: any) {
      if (err?.name !== "NotAllowedError") {
        updateEntry(clientId, { error: "Capture failed or was cancelled. Try again, or upload a screenshot file instead." });
      }
    }
  };

  const archiveEntry = async (entry: Entry) => {
    const url = normalizeUrl(entry.url);
    if (!url) {
      updateEntry(entry.clientId, { status: "error", error: "Paste a URL for this entry first." });
      return;
    }
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      updateEntry(entry.clientId, { status: "error", error: "Local URLs can't be archived." });
      return;
    }

    // --- Screenshot path ---
    if (entry.file) {
      const file = entry.file;
      updateEntry(entry.clientId, {
        status: "uploading",
        error: "",
        result: null,
        fallbackUrl: null,
        progress: { attempt: 0, max: MAX_ATTEMPTS },
      });

      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `archiver-temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("evidence").upload(fileName, file);
      if (uploadError) {
        updateEntry(entry.clientId, { status: "error", error: "Upload failed: " + uploadError.message });
        return;
      }
      const publicUrl = supabase.storage.from("evidence").getPublicUrl(fileName).data.publicUrl;
      const proxyUrl = `${window.location.origin}/api/evidence/${fileName}`;

      const row = await logSubmission(url, { is_screenshot: true });

      updateEntry(entry.clientId, { status: "loading" });
      try {
        const snapshot = await archiveToWayback(proxyUrl, (attempt, max) =>
          updateEntry(entry.clientId, { progress: { attempt, max } })
        );
        if (snapshot) {
          updateEntry(entry.clientId, { result: snapshot });
          if (row) {
            await supabase.from("archived_links").update({ wayback_url: snapshot, status: "done" }).eq("id", row.id);
            fetchHistory();
          }

          updateEntry(entry.clientId, { status: "verifying", verifyProgress: { attempt: 0, max: 12 } });
          const live = await verifySnapshotLive(snapshot, (attempt, max) =>
            updateEntry(entry.clientId, { verifyProgress: { attempt, max } })
          );
          if (live) {
            await supabase.storage.from("evidence").remove([fileName]);
          } else {
            updateEntry(entry.clientId, { fallbackUrl: publicUrl });
          }
          updateEntry(entry.clientId, { status: "done" });
        } else {
          updateEntry(entry.clientId, {
            status: "error",
            error: "Snapshot not confirmed. Screenshot stays in storage — link below still works as a fallback.",
            fallbackUrl: publicUrl,
          });
          if (row) await supabase.from("archived_links").update({ status: "failed", wayback_url: publicUrl }).eq("id", row.id);
        }
      } catch (err) {
        updateEntry(entry.clientId, {
          status: "error",
          error: err instanceof Error ? err.message : "Archive request failed. Screenshot stays in storage as a fallback.",
          fallbackUrl: publicUrl,
        });
        if (row) await supabase.from("archived_links").update({ status: "failed", wayback_url: publicUrl }).eq("id", row.id);
      } finally {
        fetchHistory();
      }
      return;
    }

    // --- Direct URL path ---
    updateEntry(entry.clientId, { status: "loading", error: "", result: null, progress: { attempt: 0, max: MAX_ATTEMPTS } });
    const row = await logSubmission(url);

    try {
      const snapshot = await archiveToWayback(url, (attempt, max) => updateEntry(entry.clientId, { progress: { attempt, max } }));
      if (snapshot) {
        updateEntry(entry.clientId, { result: snapshot });
        if (row) {
          await supabase.from("archived_links").update({ wayback_url: snapshot, status: "done" }).eq("id", row.id);
          fetchHistory();
        }

        updateEntry(entry.clientId, { status: "verifying", verifyProgress: { attempt: 0, max: 12 } });
        await verifySnapshotLive(snapshot, (attempt, max) => updateEntry(entry.clientId, { verifyProgress: { attempt, max } }));
        updateEntry(entry.clientId, { status: "done" });
      } else {
        updateEntry(entry.clientId, {
          status: "error",
          error: "Snapshot not confirmed after polling. Wayback may still be processing — try again shortly.",
        });
        if (row) await supabase.from("archived_links").update({ status: "failed" }).eq("id", row.id);
      }
    } catch (err) {
      updateEntry(entry.clientId, {
        status: "error",
        error: err instanceof Error ? err.message : "Archive request failed. Check the URL and try again.",
      });
      if (row) await supabase.from("archived_links").update({ status: "failed" }).eq("id", row.id);
    } finally {
      fetchHistory();
    }
  };

  const handleArchiveAll = async () => {
    setBatchRunning(true);
    const pending = entries.filter((e) => normalizeUrl(e.url) && e.status !== "loading" && e.status !== "verifying" && e.status !== "uploading");
    for (const entry of pending) {
      await archiveEntry(entry);
    }
    setBatchRunning(false);
  };

  const anyBusy = entries.some((e) => e.status === "uploading" || e.status === "loading" || e.status === "verifying");
  const anyArchivable = entries.some((e) => normalizeUrl(e.url));

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
          <p className="text-slate-500 font-medium">
            Add a link, optionally attach a screenshot for gated pages, then archive one or many at once.
          </p>
        </div>

        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={entry.clientId} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link #{idx + 1}</span>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.clientId)}
                    disabled={entry.status === "loading" || entry.status === "verifying" || entry.status === "uploading"}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="https://example.com/article"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-sm transition-all"
                  value={entry.url}
                  onChange={(e) => updateEntry(entry.clientId, { url: e.target.value })}
                  disabled={entry.status === "loading" || entry.status === "verifying" || entry.status === "uploading"}
                />
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleCaptureTab(entry.clientId)}
                  disabled={anyBusy}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Camera size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Capture Open Tab</span>
                </button>

                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => updateEntry(entry.clientId, { file: e.target.files?.[0] || null })}
                    disabled={anyBusy}
                  />
                  <ImageUp size={16} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Upload File</span>
                </label>
              </div>

              {entry.file && (
                <p className="mt-2 text-xs font-bold text-emerald-600 text-center">
                  ✓ Screenshot attached: {entry.file.name}{" "}
                  <button type="button" onClick={() => updateEntry(entry.clientId, { file: null })} className="underline font-medium">
                    remove
                  </button>
                </p>
              )}

              {entry.status === "loading" && (
                <div className="mt-4">
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, (entry.progress.attempt / entry.progress.max) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400 text-center">
                    {entry.file ? "Uploading & archiving…" : "Archiving…"} {entry.progress.attempt}/{entry.progress.max}
                  </p>
                </div>
              )}

              {entry.status === "uploading" && (
                <p className="mt-3 text-xs font-bold text-slate-400 text-center flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Uploading screenshot…
                </p>
              )}

              {entry.status === "verifying" && (
                <div className="mt-4">
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (entry.verifyProgress.attempt / entry.verifyProgress.max) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-slate-400 text-center">
                    Confirming Wayback has indexed it — {entry.verifyProgress.attempt}/{entry.verifyProgress.max}
                  </p>
                </div>
              )}

              {entry.status === "error" && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-start gap-3 text-red-700 text-sm font-medium">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    {entry.error}
                  </div>
                  {entry.fallbackUrl && (
                    <a
                      href={entry.fallbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 truncate"
                    >
                      <ExternalLink size={14} className="shrink-0" />
                      <span className="truncate">{entry.fallbackUrl}</span>
                    </a>
                  )}
                </div>
              )}

              {entry.status === "done" && entry.result && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Archived</p>
                  <a
                    href={entry.result}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 truncate"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="truncate">{entry.result}</span>
                  </a>
                  {entry.fallbackUrl && (
                    <p className="mt-2 text-xs text-slate-500 font-medium">
                      Not indexed yet, kept a backup:{" "}
                      <a href={entry.fallbackUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline">
                        view backup
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEntry}
          disabled={anyBusy}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-slate-300 rounded-2xl font-bold text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={18} /> Add Another Link
        </button>

        <button
          type="button"
          onClick={handleArchiveAll}
          disabled={anyBusy || batchRunning || !anyArchivable}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {batchRunning ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Archiving all…
            </>
          ) : (
            <>
              <Archive size={18} /> Archive {entries.length > 1 ? "All" : ""}
            </>
          )}
        </button>

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
