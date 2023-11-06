import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import schema from "@/app/api/topics/schema";
import { getToken } from "next-auth/jwt";
import { Item } from "@/types/item";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";

export async function GET(req: NextRequest) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  try {
    const topics = await prisma.topic.findMany({
      where: { userId: token?.sub },
    });
    return NextResponse.json(topics);
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

  //Find users by email address
  let invitedUsers = [];
  try {
    invitedUsers = await prisma.user.findMany({
      where: {
        email: { in: body.invitedUsers },
      },
    });
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
