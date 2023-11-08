import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/prisma/db";
import { VoteCount } from "@/types/voteCount";
import { z } from "zod";
import { handlePrismaError } from "@/app/helpers/serverSideErrorHandling";
import {
  validateRateLimit,
  validateTokenAndBody,
} from "@/app/helpers/apiValidation";
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      include: { items: true, invitedUsers: true },
    });

    if (!topic)
      return NextResponse.json({ error: "topic not found" }, { status: 404 });

    if (
      !(topic.userId === token.sub) &&
      !topic.invitedUsers.find((invitedUser) => invitedUser.id === token.sub)
    ) {
      return NextResponse.json(
        { error: "User not invited to topic" },
        { status: 404 },
      );
    }

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
    return handlePrismaError(req, err, token);
  }
}

const postVoteSchema = z.object({
  itemId: z.string(),
});
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { token, parsedBody, errorResponse } = await validateTokenAndBody(
    req,
    postVoteSchema,
  );

  if (errorResponse) return errorResponse;

  const body = parsedBody as { itemId: string };

  if (!(await validateRateLimit(req, token.sub)))
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 },
    );

  const topic = await prisma.topic.findUnique({
    where: { id: params.id },
    include: { items: true, invitedUsers: true },
  });

  if (!topic)
    return NextResponse.json({ error: "topic not found" }, { status: 404 });

  if (
    !(topic.userId === token.sub) &&
    !topic.invitedUsers.find((invitedUser) => invitedUser.id === token.sub)
  ) {
    return NextResponse.json(
      { error: "User not invited to topic" },
      { status: 404 },
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
    return handlePrismaError(req, err, token);
  }
}
