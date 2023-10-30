import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import schema from "@/app/api/topics/schema";
import { getToken } from "next-auth/jwt";
import { Item } from "@/types/item";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  const topic = await prisma.topic.findUnique({
    where: { id: params.id, userId: token.sub },
    include: { items: true },
  });

  if (!topic)
    return NextResponse.json({ error: "topic not found" }, { status: 404 });

  return NextResponse.json(topic);
}
