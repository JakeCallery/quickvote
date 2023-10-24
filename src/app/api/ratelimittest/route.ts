import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, "10s"),
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const ip = request.headers.get("x-forwarded-for") ?? "";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded." },
        { status: 429 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.log("Error: ", err.message);
  }
}
