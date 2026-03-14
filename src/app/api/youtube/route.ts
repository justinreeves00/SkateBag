import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Create rate limiter: 100 requests per hour per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1h"),
  analytics: true,
});

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

function uniqueVideoIds(items: unknown[]) {
  return [...new Set(items.map((item: unknown) => (item as { id?: { videoId?: string } })?.id?.videoId).filter(Boolean))];
}

function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a hash of the user agent if no IP is available
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `ua-${Buffer.from(userAgent).toString("base64").slice(0, 16)}`;
}

export async function GET(request: NextRequest) {
  // Check rate limit
  const identifier = getClientIP(request);
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { 
        error: "Rate limit exceeded. Please try again later.",
        limit,
        remaining: 0,
        reset: new Date(reset).toISOString(),
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const mode = searchParams.get("mode") === "exact" ? "exact" : "ranked";

  if (!query) {
    return NextResponse.json(
      { error: "Missing query" }, 
      { 
        status: 400,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API not configured" }, 
      { 
        status: 503,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  }

  try {
    const normalizedQuery = normalize(query);
    const exactQuery = `"${query}" skateboard tutorial`;
    const exactResults = (await searchYouTube(exactQuery, apiKey))
      .filter((item: unknown) => (item as { id?: { videoId?: string } })?.id?.videoId)
      .sort((a: unknown, b: unknown) => {
        const titleA = normalize((a as { snippet?: { title?: string } })?.snippet?.title ?? "");
        const titleB = normalize((b as { snippet?: { title?: string } })?.snippet?.title ?? "");
        const scoreA = (titleA.includes(normalizedQuery) ? 4 : 0) + (titleA.startsWith(normalizedQuery) ? 3 : 0);
        const scoreB = (titleB.includes(normalizedQuery) ? 4 : 0) + (titleB.startsWith(normalizedQuery) ? 3 : 0);
        return scoreB - scoreA;
      });

    const exactVideoIds = uniqueVideoIds(exactResults.filter((item: unknown) => normalize((item as { snippet?: { title?: string } })?.snippet?.title ?? "").includes(normalizedQuery)));

    if (mode === "exact") {
      return NextResponse.json(
        { videoIds: exactVideoIds.slice(0, 5) },
        {
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
          },
        }
      );
    }

    if (exactVideoIds.length > 0) {
      return NextResponse.json(
        { videoIds: exactVideoIds.slice(0, 5) },
        {
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
          },
        }
      );
    }

    const fallbackQueries = [
      `${query} skateboard tutorial`,
      `${query} skateboarding how to`,
      `${query} trick tips`,
    ];

    const batches = await Promise.all(fallbackQueries.map((searchQuery) => searchYouTube(searchQuery, apiKey)));

    const rankedResults = batches
      .flat()
      .filter((item: unknown) => (item as { id?: { videoId?: string } })?.id?.videoId)
      .sort((a: unknown, b: unknown) => {
        const titleA = normalize((a as { snippet?: { title?: string } })?.snippet?.title ?? "");
        const titleB = normalize((b as { snippet?: { title?: string } })?.snippet?.title ?? "");
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
    return NextResponse.json(
      { videoIds },
      {
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "YouTube API error" }, 
      { 
        status: 500,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
        },
      }
    );
  }
}
