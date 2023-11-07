import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/db";
import topicSchema from "@/app/api/topics/topicSchema";
import { getToken } from "next-auth/jwt";
import { Item } from "@/types/item";
import { Topic } from "@/types/topic";
import { handlePrismaError } from "@/app/helpers/serverSideErrorHandling";
import { validateTokenAndBody } from "@/app/helpers/apiValidation";

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
      where: { id: params.id },
      include: { items: true, invitedUsers: true },
    });
    if (!topic)
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    if (topic.userId === token.sub) {
      return NextResponse.json(topic);
    }

    if (
      topic.invitedUsers.find((invitedUser) => invitedUser.id === token.sub)
    ) {
      topic.invitedUsers = [];
      return NextResponse.json(topic);
    }

    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  } catch (err: unknown) {
    return handlePrismaError(req, err, token);
  }
}

export async function DELETE(
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
    });
    if (!topic)
      return NextResponse.json({ error: "topic not found" }, { status: 404 });

    await prisma.topic.delete({
      where: { id: topic.id },
    });

    return NextResponse.json(topic, { status: 200 });
  } catch (err: any) {
    return handlePrismaError(req, err, token);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { token, parsedBody, errorResponse } = await validateTokenAndBody(
    req,
    topicSchema,
  );

  if (errorResponse) return errorResponse;

  //TODO: Properly Type this
  const body = parsedBody;

  let topic: Topic;
  try {
    topic = (await prisma.topic.findUnique({
      where: { id: params.id, userId: token.sub },
      include: { items: true, invitedUsers: true },
    })) as Topic;
  } catch (err: any) {
    return handlePrismaError(req, err, token);
  }

  if (!topic)
    return NextResponse.json({ error: "Topic not found." }, { status: 404 });

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

  //add additional invited users
  const invitedUsersEmailToAdd =
    body.invitedUsers.filter((bodyInvitedUserEmail: string) => {
      return !topic.invitedUsers?.find((topicInvitedUser) => {
        return topicInvitedUser.email === bodyInvitedUserEmail;
      });
    }) || [];

  const invitedUsersToAdd =
    (await prisma.user.findMany({
      where: {
        email: { in: invitedUsersEmailToAdd },
      },
    })) || [];

  const invitedUserIdsToAdd = invitedUsersToAdd.map((invitedUserToAdd) => {
    return { id: invitedUserToAdd.id };
  });

  if (invitedUserIdsToAdd) {
    steps.push(
      prisma.topic.update({
        where: { id: topic.id },
        data: {
          invitedUsers: {
            connect: invitedUserIdsToAdd,
          },
        },
      }),
    );
  }

  //remove missing from body invited users
  const invitedUsersEmailToRemove = topic.invitedUsers?.filter(
    (topicInvitedUser) => {
      return !body.invitedUsers.find(
        (bodyInvitedUserEmail: string) =>
          bodyInvitedUserEmail === topicInvitedUser.email,
      );
    },
  );

  const invitedUsersToRemove =
    topic.invitedUsers?.filter((topicInvitedUser) => {
      return invitedUsersEmailToRemove?.find((invitedUserEmailToRemove) => {
        return topicInvitedUser.email === invitedUserEmailToRemove.email;
      });
    }) || [];

  steps.push(
    prisma.topic.update({
      where: { id: topic.id },
      data: {
        invitedUsers: {
          disconnect: invitedUsersToRemove,
        },
      },
    }),
  );

  //commit changes
  try {
    await prisma.$transaction(steps);
    return NextResponse.json({}, { status: 200 });
  } catch (err: unknown) {
    return handlePrismaError(req, err, token);
  }
}
