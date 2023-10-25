import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import schema from "@/app/api/topics/schema";
export async function GET(req: NextRequest) {
  const topics = await prisma.topic.findMany();
  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
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
    },
  });

  return NextResponse.json(newTopic, { status: 201 });
}
