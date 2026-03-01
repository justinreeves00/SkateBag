import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API not configured" }, { status: 503 });
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(`"${query}" skateboard tutorial`)}&type=video&videoEmbeddable=true&maxResults=5&relevanceLanguage=en&key=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    const data = await res.json();

    if (!data.items?.length) {
      return NextResponse.json({ videoIds: [] });
    }

    const videoIds = data.items.map((item: any) => item.id.videoId).filter(Boolean);
    return NextResponse.json({ videoIds });
  } catch {
    return NextResponse.json({ error: "YouTube API error" }, { status: 500 });
  }
}
