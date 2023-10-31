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
import { Topic } from "@/types/topic";

type PrismaError =
  | PrismaClientInitializationError
  | PrismaClientKnownRequestError
  | PrismaClientRustPanicError
  | PrismaClientUnknownRequestError;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = await getToken({ req: req });

  if (!token) {
    return NextResponse.json({ error: "User not logged in." }, { status: 401 });
  }

  try {
    const topic = await prisma.topic.findUnique({
      where: { id: params.id, userId: token.sub },
      include: { items: true },
    });
    if (!topic)
      return NextResponse.json({ error: "topic not found" }, { status: 404 });

    return NextResponse.json(topic);
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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

  let topic: Topic;
  try {
    topic = (await prisma.topic.findUnique({
      where: { id: params.id, userId: token.sub },
      include: { items: true },
    })) as Topic;
  } catch (err: any) {
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    } else if (
      err instanceof PrismaClientUnknownRequestError ||
      err instanceof PrismaClientRustPanicError ||
      err instanceof PrismaClientInitializationError
    ) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }

  if (!topic)
    return NextResponse.json({ error: "topic not found" }, { status: 404 });

  const steps = [];

  //Update Topic Name if needed
  if (topic.name !== body.name) {
    steps.push(
      prisma.topic.update({
        where: {
          id: topic.id,
        },
        data: {
          name: body.name,
        },
      }),
    );
  }

  //Add any new items
  const itemsToAdd = body.items.filter((bodyItem: Item) => {
    return !topic.items.find((topicItem) => topicItem.id === bodyItem.id);
  });

  //build up new item
  itemsToAdd.forEach((item: Item) => {
    delete item.id;
    item.userId = token.sub;
    item.topicId = topic.id;
  });

  if (itemsToAdd?.length > 0) {
    steps.push(
      prisma.item.createMany({
        data: itemsToAdd,
      }),
    );
  }

  //Delete any missing items
  const itemIdsToDelete = topic.items
    .filter((topicItem: Item) => {
      return !body.items.find((bodyItem: Item) => bodyItem.id === topicItem.id);
    })
    .map((item) => item.id!);

  if (itemIdsToDelete && itemIdsToDelete.length > 0) {
    steps.push(
      prisma.item.deleteMany({
        where: {
          id: { in: itemIdsToDelete },
          topicId: topic.id,
          userId: token.sub,
        },
      }),
    );
  }

  //update items that have changed
  const itemsToUpdate = body.items.filter((bodyItem: Item) => {
    const foundItem = topic.items.find(
      (topicItem) => topicItem.id === bodyItem.id,
    );
    return foundItem && foundItem.name !== bodyItem.name;
  });

  itemsToUpdate.forEach((item: Item) => {
    steps.push(
      prisma.item.update({
        where: {
          id: item.id,
          userId: token.sub,
          topicId: topic.id,
        },
        data: {
          name: item.name,
        },
      }),
    );
  });

  //commit changes
  try {
    const commitResult = await prisma.$transaction(steps);
    return NextResponse.json({}, { status: 200 });
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
