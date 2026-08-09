import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const filePath = path.join("/");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const upstream = await fetch(`${supabaseUrl}/storage/v1/object/public/evidence/${filePath}`);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
