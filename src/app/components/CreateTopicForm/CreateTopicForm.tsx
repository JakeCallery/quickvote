"use client";
import React, { FormEvent, useState } from "react";
import { useLogger } from "next-axiom";
import { KeyedMutator } from "swr";
import { addTopic, addTopicOptions } from "@/app/apicallers/topicApiCallers";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { parentPort } from "worker_threads";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
const CreateTopicForm = ({
  mutateTopic,
}: {
  mutateTopic?: KeyedMutator<Topic[]>;
}) => {
  const log = useLogger();
  const router = useRouter();

  const [nameText, setNameText] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [itemToEditText, setItemToEditText] = useState("");

  const onCreateClick = async () => {
    // log.debug("Caught Create Click: ", { topicName: nameText });
    const newTopic = {
      id: Date.now().toString(),
      name: nameText,
      items: items,
    };
    let res;
    if (mutateTopic) {
      res = await mutateTopic(addTopic(newTopic), addTopicOptions(newTopic));
    } else {
      res = await addTopic(newTopic);
    }

    if (!("error" in res)) {
      router.push("/topics");
    } else {
      console.log("[JAC-ERROR]", res.error);
      toast.error("Unable to add new topic");
    }
  };

  const onAddItemClick = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: newItemText,
      },
    ]);
    setNewItemText("");
  };

  const deleteItem = (itemToRemove: Item) => {
    setItems(items.filter((item) => item.id !== itemToRemove.id));
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
          value={nameText}
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setNameText(e.currentTarget.value)
          }
        />
      </div>
      <div>
        <h3 className="text-secondary font-bold">Items To Vote On</h3>
        <ul id="items-to-add-list" className="mt-2 mb-2">
          {items && items.length > 0 ? (
            items.map((item) => {
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
                        item.name = itemToEditText;
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
          value={newItemText}
          onChange={(e: FormEvent<HTMLInputElement>) =>
            setNewItemText(e.currentTarget.value)
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
        >
          Add Item
        </button>
      </div>

      <button
        className="btn btn-primary"
        onClick={onCreateClick}
        disabled={!(nameText && nameText.trim().length > 0 && items.length > 0)}
      >
        Create Topic
      </button>
    </div>
  );
};

export default CreateTopicForm;
