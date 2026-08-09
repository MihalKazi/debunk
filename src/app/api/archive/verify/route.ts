import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const snapshotUrl = req.nextUrl.searchParams.get("url");
  if (!snapshotUrl) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  try {
    const res = await fetch(snapshotUrl, { method: "HEAD", redirect: "manual" });
    return NextResponse.json({ live: res.status < 400 });
  } catch {
    return NextResponse.json({ live: false });
  }
}
