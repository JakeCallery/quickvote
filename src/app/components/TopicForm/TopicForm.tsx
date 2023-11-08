import React, { FormEvent, useState } from "react";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
import { InvitedUser } from "@/types/invitedUser";
import { useRouter } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import { EditableListItem } from "@/types/editableListItem";
import EditableList from "@/app/components/EditableList/EditableList";
import { generateTempId } from "@/app/helpers/tempIds";

const emailSchema = z.string().email();

const TopicForm = ({
  topic,
  commitChanges,
  commitChangesButtonText,
  resetButtonText = "Reset Changes",
  cancelButtonText = "Cancel",
  committingChanges,
}: {
  topic?: Topic;
  commitChanges: (topic: Topic) => {};
  commitChangesButtonText: string;
  resetButtonText?: string;
  cancelButtonText?: string;
  committingChanges: boolean;
}) => {
  const router = useRouter();

  const [topicName, setTopicName] = useState(topic?.name || "");

  const [topicItems, setTopicItems] = useState<EditableListItem[]>(
    topic?.items.map((item) => ({ name: item.name, id: item.id })) || [],
  );

  const [topicInvitedUsers, setTopicInvitedUsers] = useState<InvitedUser[]>(
    topic?.invitedUsers?.map((invitedUser) => ({
      email: invitedUser.email,
      id: invitedUser.id,
    })) || [],
  );

  const [newInvitedUserEmail, setNewInvitedUserEmail] = useState("");
  const [newTopicItemName, setNewTopicItemName] = useState("");

  const onAddItemClick = () => {
    setTopicItems([
      ...topicItems,
      { id: generateTempId(), name: newTopicItemName },
    ]);

    setNewTopicItemName("");
  };

  const onAddInvitedUserClick = () => {
    if (emailSchema.safeParse(newInvitedUserEmail).success) {
      topicInvitedUsers.push({
        email: newInvitedUserEmail,
        id: generateTempId(),
      });
      setNewInvitedUserEmail("");
    } else {
      toast.error("Invalid email address format");
    }
  };

  const onSaveChangesClick = () => {
    const trimmedItems = topicItems.map((item): Item => {
      return {
        ...item,
        name: item.name.trim(),
        userId: "",
        topicId: topic?.id || "",
      };
    });

    const trimmedUsers = topicInvitedUsers.map((invitedUser) => {
      return { ...invitedUser, email: invitedUser.email.trim() };
    });

    const newTopic: Topic = {
      id: topic?.id || generateTempId(),
      name: topicName,
      items: trimmedItems,
      invitedUsers: trimmedUsers,
    };

    commitChanges(newTopic);
  };

  const onResetChangesClick = async () => {
    if (topic) {
      setTopicName(topic.name);
      setTopicItems(
        topic.items.map((item) => ({ name: item.name, id: item.id })),
      );
      setTopicInvitedUsers(
        topic.invitedUsers?.map((invitedUser) => ({
          email: invitedUser.email,
          id: invitedUser.id,
        })) || [],
      );
    }
  };

  const onItemListUpdate = (baseItems: EditableListItem[]) => {
    setTopicItems(baseItems);
  };

  const onTopicInvitedUsersUpdate = (baseItems: EditableListItem[]) => {
    setTopicInvitedUsers(
      baseItems.map((baseItem) => {
        return { email: baseItem.name, id: baseItem.id };
      }),
    );
  };

  return (
    <div className="flex flex-col space-y-10">
      <div>
        <h3 className="text-secondary font-bold mb-2">Topic Name</h3>
        <input
          id="topic-name-input"
          className="input input-bordered input-primary w-full"
          type="text"
          placeholder="Topic Name"
          value={topicName}
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setTopicName(e.currentTarget.value)
          }
        />
      </div>
      <div>
        <h3 className="text-secondary font-bold text-xl">Items To Vote On</h3>

        <EditableList
          className="mt-2 mb-2"
          items={topicItems}
          onUpdate={onItemListUpdate}
          emptyItemsText="No items to vote on yet."
        />

        <input
          id="new-item-input"
          className="input input-bordered input-primary w-full mb-2"
          type="text"
          placeholder="Name of item to vote on"
          value={newTopicItemName}
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setNewTopicItemName(e.currentTarget.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddItemClick();
            }
          }}
        />
        <button
          className="btn btn-secondary normal-case"
          onClick={onAddItemClick}
          disabled={!(newTopicItemName && newTopicItemName.trim().length > 0)}
        >
          Add Item
        </button>
      </div>
      <div>
        <h3 className="text-secondary font-bold text-xl">Users To Invite</h3>
        <EditableList
          className="mt-2 mb-2"
          items={topicInvitedUsers.map((invitedUser) => {
            return {
              name: invitedUser.email,
              id: invitedUser.id,
            } as EditableListItem;
          })}
          onUpdate={onTopicInvitedUsersUpdate}
          emptyItemsText="No users invited to topic yet."
        />

        <input
          id="new-invited-user-input"
          className="input input-bordered input-primary w-full mb-2"
          type="text"
          placeholder="Email address of user to invite"
          value={newInvitedUserEmail}
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setNewInvitedUserEmail(e.currentTarget.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (e.currentTarget.value.trim() == "") return;
              onAddInvitedUserClick();
            }
          }}
        />
        <button
          className="btn btn-secondary normal-case"
          onClick={onAddInvitedUserClick}
          disabled={
            !(newInvitedUserEmail && newInvitedUserEmail.trim().length > 0)
          }
        >
          Add User
        </button>
      </div>
      <div className="flex space-x-2">
        <button
          className="btn btn-primary"
          onClick={onSaveChangesClick}
          disabled={
            !(
              topicName &&
              topicName.trim().length > 0 &&
              topicItems.length > 0 &&
              !committingChanges
            )
          }
        >
          {commitChangesButtonText}
        </button>

        {topic && (
          <button className="btn btn-primary" onClick={onResetChangesClick}>
            {resetButtonText}
          </button>
        )}
        <div className="flex-grow"></div>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          {cancelButtonText}
        </button>
      </div>
    </div>
  );
};

export default TopicForm;
