import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "next-auth/jwt";

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
