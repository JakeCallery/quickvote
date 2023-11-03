import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import prisma from "@/prisma/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: token.sub },
      include: { invitedTopics: true },
    });

    if (!currentUser?.invitedTopics)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(currentUser.invitedTopics, { status: 200 });
  } catch (err: unknown) {
    if (
      err instanceof PrismaClientKnownRequestError ||
      err instanceof PrismaClientUnknownRequestError
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else if (
      err instanceof PrismaClientRustPanicError ||
      err instanceof PrismaClientInitializationError
    ) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}
