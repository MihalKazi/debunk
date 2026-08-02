// One-off: re-archive published debunks to Wayback Machine, store real snapshot URL.
// Run: node scripts/backfill-wayback.mjs
// Retry only prior failures: node scripts/backfill-wayback.mjs --retry-failed
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import puppeteer from "puppeteer";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);
const UA = "Mozilla/5.0 (compatible; DebunkArchiveBot/1.0; +https://www.boombd.com)";
const FAILED_LOG = "scripts/wayback-failed.json";
const RETRY_ONLY_FAILED = process.argv.includes("--retry-failed");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, opts = {}, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, { ...opts, headers: { "User-Agent": UA, ...(opts.headers || {}) } });
    } catch (e) {
      lastErr = e;
      await sleep(2000 * (i + 1)); // exponential-ish backoff
    }
  }
  throw lastErr;
}

async function archiveToWayback(url) {
  if (!url || url.includes("localhost") || url.includes("127.0.0.1")) return null;
  try {
    await fetchWithRetry(`https://web.archive.org/save/${url}`);
    const maxAttempts = 8;
    for (let i = 0; i < maxAttempts; i++) {
      await sleep(5000);
      try {
        const res = await fetchWithRetry(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, {}, 2);
        const data = await res.json();
        const snapshotUrl = data?.archived_snapshots?.closest?.url;
        if (snapshotUrl) return snapshotUrl;
      } catch {
        // retry next loop iteration
      }
    }
    return null;
  } catch (e) {
    console.error("archive error", url, e.message);
    return null;
  }
}

async function archiveToArchiveToday(url) {
  try {
    const res = await fetchWithRetry(
      `https://archive.ph/submit/`,
      { method: "POST", body: new URLSearchParams({ url }), redirect: "manual" },
      2
    );
    const loc = res.headers.get("location");
    if (loc && loc.includes("archive.")) return loc;
    return null;
  } catch (e) {
    console.error("archive.today error", url, e.message);
    return null;
  }
}

let browser;
async function screenshotBoombd(url, id) {
  try {
    if (!browser) browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const buffer = await page.screenshot({ fullPage: true, type: "png" });
    await page.close();

    const fileName = `wayback-fallback-${id}-${Date.now()}.png`;
    const { error } = await supabase.storage.from("evidence").upload(fileName, buffer, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) throw error;

    return supabase.storage.from("evidence").getPublicUrl(fileName).data.publicUrl;
  } catch (e) {
    console.error("screenshot fallback error", url, e.message);
    return null;
  }
}

async function main() {
  let rows;

  if (RETRY_ONLY_FAILED) {
    if (!fs.existsSync(FAILED_LOG)) {
      console.error(`No ${FAILED_LOG} found. Run without --retry-failed first.`);
      process.exit(1);
    }
    rows = JSON.parse(fs.readFileSync(FAILED_LOG, "utf-8"));
    console.log(`Retrying ${rows.length} previously failed rows.`);
  } else {
    const { data, error } = await supabase
      .from("debunks")
      .select("id, title, source_link, wayback_url")
      .not("source_link", "is", null);
    if (error) throw error;
    rows = data;
    console.log(`Found ${rows.length} rows.`);
  }

  const failed = [];
  const THROTTLE_MS = 6000; // stay well under archive.org's ~15/min save limit

  for (const row of rows) {
    let needsFix = true;
    if (!RETRY_ONLY_FAILED && row.wayback_url) {
      try {
        const check = await fetchWithRetry(row.wayback_url, { method: "HEAD" }, 2);
        needsFix = !check.ok;
      } catch {
        needsFix = true;
      }
    }

    if (!needsFix) {
      console.log(`OK   ${row.id} ${row.title}`);
      continue;
    }

    console.log(`FIX  ${row.id} ${row.title} -> archiving ${row.source_link}`);
    let snapshotUrl = await archiveToWayback(row.source_link);

    if (!snapshotUrl && row.source_link.includes("boombd.com")) {
      console.log(`     wayback failed on boombd.com URL, trying archive.today fallback...`);
      snapshotUrl = await archiveToArchiveToday(row.source_link);
    }

    if (!snapshotUrl && row.source_link.includes("boombd.com")) {
      console.log(`     archive.today also failed, self-hosting screenshot...`);
      snapshotUrl = await screenshotBoombd(row.source_link, row.id);
    }

    if (snapshotUrl) {
      await supabase.from("debunks").update({ wayback_url: snapshotUrl }).eq("id", row.id);
      console.log(`     saved: ${snapshotUrl}`);
    } else {
      console.log(`     FAILED to archive ${row.source_link}`);
      failed.push({ id: row.id, title: row.title, source_link: row.source_link, wayback_url: row.wayback_url });
    }

    await sleep(THROTTLE_MS);
  }

  fs.writeFileSync(FAILED_LOG, JSON.stringify(failed, null, 2));
  console.log(`Done. ${failed.length} failures logged to ${FAILED_LOG}.`);
  if (browser) await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
