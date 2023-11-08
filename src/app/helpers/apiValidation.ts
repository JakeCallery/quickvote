import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "next-auth/jwt";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// type ApiValidationResponse = {
//   token: JWT | null;
//   parsedBody: object | null;
//   errorResponse: NextResponse | null;
// };

//TODO: Properly type this return value
export const validateTokenAndBody = async <T extends z.ZodTypeAny>(
  req: NextRequest,
  bodySchema: T,
) => {
  const token = await getToken({ req: req });

  if (!token) {
    return {
      token: null,
      parsedBody: null,
      errorResponse: NextResponse.json(
        { error: "User not logged in." },
        { status: 401 },
      ),
    };
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return {
      token: token,
      parsedBody: null,
      errorResponse: NextResponse.json(
        { error: "Failed to validate request body" },
        { status: 400 },
      ),
    };
  }

  const validation = bodySchema.safeParse(body);
  if (!validation.success) {
    return {
      token: token,
      parsedBody: null,
      errorResponse: NextResponse.json(
        { error: validation.error.errors },
        { status: 400 },
      ),
    };
  }

  return {
    token: token,
    parsedBody: body,
    errorResponse: null,
  };
};

type Unit = "ms" | "s" | "m" | "h" | "d";
type Duration = `${number} ${Unit}` | `${number}${Unit}`;
export const validateRateLimit = async (
  req: NextRequest,
  identifier: string | null | undefined = undefined,
  numRequests: number = 5,
  windowDuration: Duration = "10s",
) => {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.fixedWindow(numRequests, windowDuration),
  });

  const id = identifier || (req.headers.get("x-forwarded-for") ?? "");
  const { success } = await ratelimit.limit(id);
  return success;
};
