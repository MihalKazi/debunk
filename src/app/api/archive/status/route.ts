import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("job_id");
  if (!jobId) {
    return NextResponse.json({ error: "job_id required" }, { status: 400 });
  }

  const accessKey = process.env.ARCHIVE_ORG_ACCESS_KEY;
  const secretKey = process.env.ARCHIVE_ORG_SECRET_KEY;
  if (!accessKey || !secretKey) {
    return NextResponse.json({ error: "Archive.org API keys not configured" }, { status: 500 });
  }

  const res = await fetch(`https://web.archive.org/save/status/${jobId}`, {
    headers: { Authorization: `LOW ${accessKey}:${secretKey}`, Accept: "application/json" },
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    return NextResponse.json({ error: "Failed to check status" }, { status: 502 });
  }

  // data.status: "pending" | "success" | "error"
  // on success: data.timestamp + data.original_url give the snapshot url
  let snapshotUrl: string | null = null;
  if (data.status === "success" && data.timestamp && data.original_url) {
    snapshotUrl = `https://web.archive.org/web/${data.timestamp}/${data.original_url}`;
  }

  return NextResponse.json({ status: data.status, snapshotUrl, message: data.message || null });
}
