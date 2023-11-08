import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/prisma/db";
import { handlePrismaError } from "@/app/helpers/serverSideErrorHandling";
import { validateRateLimit } from "@/app/helpers/apiValidation";

export async function GET(req: NextRequest) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  if (!(await validateRateLimit(req, token.sub)))
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 },
    );

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { invitedTopics: true },
    });

    if (!currentUser?.invitedTopics)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(currentUser.invitedTopics, { status: 200 });
  } catch (err: unknown) {
    return handlePrismaError(req, err, token);
  }
}
