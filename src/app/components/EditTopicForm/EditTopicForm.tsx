"use client";
import React, { FormEvent, useState } from "react";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { updateTopic } from "@/app/apicallers/topicApiCallers";
import { router } from "next/client";
import toast from "react-hot-toast";

const EditTopicForm = ({ topic }: { topic: Topic }) => {
  const [topicName, setTopicName] = useState(topic.name);
  const [topicItems, setTopicItems] = useState<Item[]>(
    topic.items.map((item) => ({ name: item.name, id: item.id })),
  );
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

  const onSaveChangesClick = async () => {
    try {
      const trimmedItems = topicItems.map((item) => {
        return { ...item, name: item.name.trim() };
      });

      const resData = await updateTopic({
        id: topic.id,
        name: topicName,
        items: trimmedItems,
      });

      if (!("error" in resData)) {
        router.push("/topics");
      } else {
        console.log("[JAC-ERROR]", resData.error);
        toast.error("Unable to save changes to topic.");
      }
    } catch (err) {
      console.error("[JAC-ERROR]", err);
      toast.error("Unable to save changes to topic.");
    }
  };

  const onResetChangesClick = async () => {
    setTopicName(topic.name);
    setTopicItems(
      topic.items.map((item) => ({ name: item.name, id: item.id })),
    );
  };

  const deleteItem = (itemToRemove: Item) => {
    setTopicItems(topicItems.filter((item) => item.id !== itemToRemove.id));
  };

  return (
    <div className="flex-col space-y-4">
      <div>
        <h3 className="text-secondary font-bold">Topic Name</h3>
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
        <h3 className="text-secondary font-bold">Items To Vote On</h3>
        <ul id="items-to-add-list" className="mt-2 mb-2">
          {topicItems && topicItems.length > 0 ? (
            topicItems.map((item) => {
              return (
                <li key={item.id}>
                  {itemToEdit?.id !== item.id ? (
                    <div className="flex-row space-x-2">
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        onClick={() => {
                          setItemToEdit(item);
                          setItemToEditText(item.name);
                        }}
                      />
                      <FontAwesomeIcon
                        icon={faCircleXmark}
                        onClick={() => deleteItem(item)}
                      />
                      <span className="text-secondary-content-content font-semibold">
                        {item.name}
                      </span>
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

      <div className="flex space-x-2">
        <button
          className="btn btn-primary"
          onClick={onSaveChangesClick}
          disabled={
            !(topicName && topicName.trim().length > 0 && topicItems.length > 0)
          }
        >
          Save Change
        </button>

        <button className="btn btn-primary" onClick={onResetChangesClick}>
          Reset Changes
        </button>
      </div>
    </div>
  );
};

export default EditTopicForm;
