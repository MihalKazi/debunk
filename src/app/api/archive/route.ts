import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const accessKey = process.env.ARCHIVE_ORG_ACCESS_KEY;
  const secretKey = process.env.ARCHIVE_ORG_SECRET_KEY;
  if (!accessKey || !secretKey) {
    return NextResponse.json({ error: "Archive.org API keys not configured" }, { status: 500 });
  }

  const res = await fetch("https://web.archive.org/save", {
    method: "POST",
    headers: {
      Authorization: `LOW ${accessKey}:${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({ url }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.job_id) {
    return NextResponse.json({ error: data?.message || "Failed to submit to Wayback" }, { status: 502 });
  }

  return NextResponse.json({ job_id: data.job_id });
}
