import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import schema from "@/app/api/topics/schema";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { Item } from "@/types/item";
export async function GET(req: NextRequest) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  const topics = await prisma.topic.findMany({
    where: { userId: token?.sub },
  });
  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  const body = await req.json();
  const validation = schema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 },
    );
  }

  const newTopic = await prisma.topic.create({
    data: {
      name: body.name,
      userId: token.sub,
      // TODO: fix "items" typing issue
      // @ts-ignore
      items: {
        create: body.items.map((item: Item) => {
          return { name: item.name, userId: token.sub };
        }),
      },
    },
  });

  return NextResponse.json(newTopic, { status: 201 });
}
