import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import schema from "@/app/api/topics/schema";
import { getToken } from "next-auth/jwt";
import { Item } from "@/types/item";
import { Logger } from "next-axiom";
import { handlePrismaError } from "@/app/helpers/serverSideErrorHandling";

export async function GET(req: NextRequest) {
  const token = await getToken({ req: req });
  const log = new Logger();

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

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
  const log = new Logger();
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

  //Find users by email address
  let invitedUsers = [];
  try {
    invitedUsers = await prisma.user.findMany({
      where: {
        email: { in: body.invitedUsers },
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
            return { name: item.name, userId: token.sub };
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
