import { NextRequest, NextResponse } from "next/server";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function buildSearchUrl(query: string, apiKey: string, maxResults = 8) {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&maxResults=${maxResults}&relevanceLanguage=en&key=${apiKey}`;
}

async function searchYouTube(query: string, apiKey: string) {
  const res = await fetch(buildSearchUrl(query, apiKey), { next: { revalidate: 86400 } });
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

function uniqueVideoIds(items: any[]) {
  return [...new Set(items.map((item: any) => item?.id?.videoId).filter(Boolean))];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const mode = searchParams.get("mode") === "exact" ? "exact" : "ranked";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API not configured" }, { status: 503 });
  }

  try {
    const normalizedQuery = normalize(query);
    const exactQuery = `"${query}" skateboard tutorial`;
    const exactResults = (await searchYouTube(exactQuery, apiKey))
      .filter((item: any) => item?.id?.videoId)
      .sort((a: any, b: any) => {
        const titleA = normalize(a?.snippet?.title ?? "");
        const titleB = normalize(b?.snippet?.title ?? "");
        const scoreA = (titleA.includes(normalizedQuery) ? 4 : 0) + (titleA.startsWith(normalizedQuery) ? 3 : 0);
        const scoreB = (titleB.includes(normalizedQuery) ? 4 : 0) + (titleB.startsWith(normalizedQuery) ? 3 : 0);
        return scoreB - scoreA;
      });

    const exactVideoIds = uniqueVideoIds(exactResults.filter((item: any) => normalize(item?.snippet?.title ?? "").includes(normalizedQuery)));

    if (mode === "exact") {
      return NextResponse.json({ videoIds: exactVideoIds.slice(0, 5) });
    }

    if (exactVideoIds.length > 0) {
      return NextResponse.json({ videoIds: exactVideoIds.slice(0, 5) });
    }

    const fallbackQueries = [
      `${query} skateboard tutorial`,
      `${query} skateboarding how to`,
      `${query} trick tips`,
    ];

    const batches = await Promise.all(fallbackQueries.map((searchQuery) => searchYouTube(searchQuery, apiKey)));

    const rankedResults = batches
      .flat()
      .filter((item: any) => item?.id?.videoId)
      .sort((a: any, b: any) => {
        const titleA = normalize(a?.snippet?.title ?? "");
        const titleB = normalize(b?.snippet?.title ?? "");
        const scoreA =
          (titleA.includes(normalizedQuery) ? 3 : 0) +
          (titleA.startsWith(normalizedQuery) ? 2 : 0) +
          (titleA.includes("tutorial") || titleA.includes("how to") || titleA.includes("tips") ? 1 : 0);
        const scoreB =
          (titleB.includes(normalizedQuery) ? 3 : 0) +
          (titleB.startsWith(normalizedQuery) ? 2 : 0) +
          (titleB.includes("tutorial") || titleB.includes("how to") || titleB.includes("tips") ? 1 : 0);

        return scoreB - scoreA;
      });

    const videoIds = uniqueVideoIds(rankedResults).slice(0, 5);
    return NextResponse.json({ videoIds });
  } catch {
    return NextResponse.json({ error: "YouTube API error" }, { status: 500 });
  }
}
