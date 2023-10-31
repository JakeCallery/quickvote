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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log(" -------- BEGIN --------- ");
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

  const topic = await prisma.topic.findUnique({
    where: { id: params.id, userId: token.sub },
    include: { items: true },
  });

  if (!topic)
    return NextResponse.json({ error: "topic not found" }, { status: 404 });

  const steps = [];

  //Update Topic Name if needed
  if (topic.name !== body.name) {
    console.log(
      `Need to update Topic Name from ${topic.name} to ${body.name} `,
    );
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

  console.log("Topic Items: ", topic.items);
  console.log("Body Items: ", body.items);

  //Add any new items
  const itemsToAdd = body.items.filter((bodyItem: Item) => {
    if (!topic.items.find((topicItem) => topicItem.id === bodyItem.id)) {
      return bodyItem;
    }
  });

  //Delete any missing items
  const itemsToDelete = topic.items.filter((topicItem: Item) => {
    if (!body.items.find((bodyItem: Item) => bodyItem.id === topicItem.id)) {
      return topicItem;
    }
  });

  //update items that have changed
  const itemsToUpdate = body.items.filter((bodyItem: Item) => {
    const foundItem = topic.items.find(
      (topicItem) => topicItem.id === bodyItem.id,
    );
    if (foundItem && foundItem.name !== bodyItem.name) {
      return bodyItem;
    }
  });

  console.log("Items to Update: ", itemsToUpdate);
  console.log("Items to Add: ", itemsToAdd);
  console.log("Items to Delete: ", itemsToDelete);

  //commit changes
  // const commitResult = await prisma.$transaction(steps);
  console.log(" -------- END --------- ");

  return NextResponse.json({}, { status: 200 });
}
