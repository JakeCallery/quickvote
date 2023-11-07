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
import { Logger } from "next-axiom";
import { randomUUID } from "crypto";

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
    if (err instanceof PrismaClientKnownRequestError) {
      log.info("PrismaClientKnownRequestError", {
        code: "400",
        url: req.url,
        message: err.message,
        error: err,
      });
      await log.flush();
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else if (
      err instanceof PrismaClientRustPanicError ||
      err instanceof PrismaClientInitializationError ||
      err instanceof PrismaClientUnknownRequestError
    ) {
      log.error("PrismaClientError", {
        code: "500",
        url: req.url,
        message: err.message,
        error: err,
      });
      await log.flush();
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      if ("toString" in err && typeof err.toString === "function") {
        log.error("Unhandled Server Error", {
          code: "500",
          url: req.url,
          message: err.toString(),
          error: err,
        });
        await log.flush();
        return NextResponse.json({ error: err.toString() }, { status: 500 });
      }
      log.error("Unhandled Server Error", {
        code: "500",
        url: req.url,
        message: "",
        error: err,
      });
      await log.flush();
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
