import React, { FormEvent, useState } from "react";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
import { InvitedUser } from "@/types/invitedUser";
import { useRouter } from "next/navigation";

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
  const [topicItems, setTopicItems] = useState<Item[]>(
    topic?.items.map((item) => ({ name: item.name, id: item.id })) || [],
  );
  const [topicInvitedUsers, setTopicInvitedUsers] = useState<InvitedUser[]>(
    topic?.invitedUsers?.map((invitedUser) => ({
      email: invitedUser.email,
      id: invitedUser.id,
    })) || [],
  );

  const [invitedUserToEdit, setInvitedUserToEdit] =
    useState<InvitedUser | null>(null);
  const [invitedUserToEditText, setInvitedUserToEditText] = useState("");
  const [newInvitedUserEmail, setNewInvitedUserEmail] = useState("");
  const [newTopicItemName, setNewTopicItemName] = useState("");
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [itemToEditText, setItemToEditText] = useState("");

  const onAddItemClick = () => {
    topicItems.push({
      id: Date.now().toString(),
      name: newTopicItemName,
    });
    setNewTopicItemName("");
  };

  const onAddInvitedUserClick = () => {
    //TODO: Validate it is a valid email address
    // Toast if not
    topicInvitedUsers.push({
      email: newInvitedUserEmail,
      id: Date.now().toString(),
    });
    setNewInvitedUserEmail("");
  };

  const onSaveChangesClick = () => {
    const trimmedItems = topicItems.map((item) => {
      return { ...item, name: item.name.trim() };
    });

    const trimmedUsers = topicInvitedUsers.map((invitedUser) => {
      return { ...invitedUser, email: invitedUser.email.trim() };
    });

    const newTopic: Topic = {
      id: topic?.id || Date.now().toString(),
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

  const deleteItem = (itemToRemove: Item) => {
    setTopicItems(topicItems.filter((item) => item.id !== itemToRemove.id));
  };

  const deleteInvitedUser = (userToRemove: InvitedUser) => {
    setTopicInvitedUsers(
      topicInvitedUsers.filter((user) => user.id !== userToRemove.id),
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
        <ul id="items-to-add-list" className="mt-2 mb-2">
          {topicItems && topicItems.length > 0 ? (
            topicItems.map((item) => {
              return (
                <li
                  key={item.id}
                  className={`mb-2 border pl-2 ${
                    itemToEdit?.id !== item.id ? "hover:bg-base-300" : ""
                  }`}
                >
                  {itemToEdit?.id !== item.id ? (
                    <div className="flex flex-row space-x-2 items-center">
                      <span className="text-2xl text-secondary-content-content font-medium grow">
                        {item.name}
                      </span>
                      <button
                        className="btn btn-md hover:btn-primary"
                        onClick={() => {
                          setItemToEdit(item);
                          setItemToEditText(item.name);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-md hover:btn-primary"
                        onClick={() => deleteItem(item)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <input
                      id="edit-item-input"
                      className="input input-bordered input-primary w-full mb-2"
                      type="text"
                      placeholder="Name of item to vote on"
                      value={itemToEditText}
                      onChange={(e: FormEvent<HTMLInputElement>) =>
                        setItemToEditText(e.currentTarget.value)
                      }
                      onBlur={() => {
                        item.name = itemToEditText.trim();
                        setItemToEditText("");
                        setItemToEdit(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  )}
                </li>
              );
            })
          ) : (
            <li className="text-secondary">No items added to topic yet</li>
          )}
        </ul>
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
        <ul id="users-to-invite-list" className="mt-2 mb-2">
          {topicInvitedUsers && topicInvitedUsers.length > 0 ? (
            topicInvitedUsers.map((invitedUser) => {
              return (
                <li
                  className={`mb-2 border pl-2 ${
                    invitedUserToEdit?.id !== invitedUser.id
                      ? "hover:bg-base-300"
                      : ""
                  }`}
                  key={invitedUser.id}
                >
                  {invitedUserToEdit?.id !== invitedUser.id ? (
                    <div className="flex flex-row space-x-2 items-center">
                      <span className="text-2xl text-secondary-content-content font-medium grow">
                        {invitedUser.email}
                      </span>
                      <button
                        className="btn btn-md hover:btn-primary"
                        onClick={() => {
                          setInvitedUserToEdit(invitedUser);
                          setInvitedUserToEditText(invitedUser.email);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-md hover:btn-primary"
                        onClick={() => deleteInvitedUser(invitedUser)}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex">
                      <input
                        id="edit-invited-user-input"
                        className="input input-bordered input-primary w-full mb-2"
                        type="text"
                        placeholder="Email address of user to invite"
                        value={invitedUserToEditText}
                        onChange={(e: FormEvent<HTMLInputElement>) =>
                          setInvitedUserToEditText(e.currentTarget.value)
                        }
                        onBlur={() => {
                          invitedUser.email = invitedUserToEditText.trim();
                          setInvitedUserToEditText("");
                          setInvitedUserToEdit(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (e.currentTarget.value.trim() == "") return;
                            e.currentTarget.blur();
                          }
                        }}
                      />
                      <button
                        className="btn btn-primary ml-2"
                        onClick={() => {
                          invitedUser.email = invitedUserToEditText.trim();
                          setInvitedUserToEditText("");
                          setInvitedUserToEdit(null);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <li className="text-secondary">No users invited to topic yet</li>
          )}
        </ul>
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
