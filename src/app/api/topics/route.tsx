import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import topicSchema from "@/app/api/topics/topicSchema";
import { getToken } from "next-auth/jwt";
import { Item } from "@/types/item";
import { handlePrismaError } from "@/app/helpers/serverSideErrorHandling";
import {
  validateRateLimit,
  validateTokenAndBody,
} from "@/app/helpers/apiValidation";
import { Topic } from "@/types/topic";

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
    const topics = await prisma.topic.findMany({
      where: { userId: token?.sub },
    });
    return NextResponse.json(topics);
  } catch (err: unknown) {
    return handlePrismaError(req, err, token);
  }
}

export async function POST(req: NextRequest) {
  const { token, parsedBody, errorResponse } = await validateTokenAndBody(
    req,
    topicSchema,
  );

  if (errorResponse) return errorResponse;

  if (!(await validateRateLimit(req, token.sub)))
    return NextResponse.json(
      { error: "Rate limit exceeded." },
      { status: 429 },
    );

  const body = parsedBody as Topic;

  //Find users by email address
  let invitedUsers = [];
  const invitedUserEmails =
    body.invitedUsers?.map((invitedUser) => invitedUser.email) || [];
  try {
    invitedUsers = await prisma.user.findMany({
      where: {
        email: { in: invitedUserEmails },
      },
    });
  } catch (err: any) {
    return handlePrismaError(req, err, token);
  }

  //TODO: If invitedUsers is empty, but requested invited users is not, warn user

  try {
    const usersToConnect =
      invitedUsers
        ?.filter((invitedUser) => {
          return invitedUser.id !== token.sub;
        })
        .map((invitedUser) => {
          return { id: invitedUser.id };
        }) || [];

    const newTopic = await prisma.topic.create({
      data: {
        name: body.name,
        userId: token.sub!,
        items: {
          create: body.items.map((item: Item) => {
            return { name: item.name, userId: token.sub! };
          }),
        },
        invitedUsers: {
          connect: usersToConnect,
        },
      },
    });
    return NextResponse.json(newTopic, { status: 201 });
  } catch (err: unknown) {
    return handlePrismaError(req, err, token);
  }
}
