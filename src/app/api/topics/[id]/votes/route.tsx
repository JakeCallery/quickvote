import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import prisma from "@/prisma/db";
import { VoteCount } from "@/types/voteCount";
import { z } from "zod";
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  try {
    //TODO: Verify that user is on the invited users list
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!topic)
      return NextResponse.json({ error: "topic not found" }, { status: 404 });

    const countsResponse: { counts: VoteCount[] } = {
      counts: [],
    };

    const steps = topic.items.map((item) => {
      return prisma.vote.count({
        where: { itemId: item.id },
      });
    });

    const countResult = await prisma.$transaction(steps);
    topic.items.forEach((item, i) => {
      countsResponse.counts.push({
        itemId: item.id,
        voteCount: countResult[i],
      });
    });

    return NextResponse.json(countsResponse, { status: 200 });
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

const postVoteSchema = z.object({
  itemId: z.string(),
});
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  //TODO: Restrict to only invited users list

  const token = await getToken({ req: req });
  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  const body = await req.json();
  const validation = postVoteSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 },
    );
  }

  try {
    const newVote = await prisma.vote.create({
      data: {
        ownerId: token.sub!,
        itemId: body.itemId,
        topicId: params.id,
      },
    });
    return NextResponse.json(newVote, { status: 201 });
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
