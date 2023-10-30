"use client";
import React, { FormEvent, useState } from "react";
import { useLogger } from "next-axiom";
import { KeyedMutator } from "swr";
import { addTopic, addTopicOptions } from "@/app/apicallers/topicApiCallers";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
const CreateTopicForm = ({
  mutateTopic,
}: {
  mutateTopic: KeyedMutator<Topic[]>;
}) => {
  const log = useLogger();
  const [nameText, setNameText] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [newItemText, setNewItemText] = useState("");

  const onCreateClick = async () => {
    log.debug("Caught Create Click: ", { topicName: nameText });
    const newTopic = {
      id: Date.now().toString(),
      name: nameText,
      items: items,
    };
    try {
      await mutateTopic(addTopic(newTopic), addTopicOptions(newTopic));
    } catch (err) {
      console.error("Caught Error: ", err);
    }
  };

  const onAddItemClick = () => {
    console.log("Click");
    items.push({
      id: Date.now().toString(),
      name: newItemText,
    });
    setNewItemText("");
  };

  return (
    <div className="flex-col">
      <label htmlFor="topic-name-input">Topic Name:</label>
      <input
        id="topic-name-input"
        type="text"
        placeholder="Topic Name"
        value={nameText}
        onChange={(e: FormEvent<HTMLInputElement>) =>
          setNameText(e.currentTarget.value)
        }
      />
      <ul>
        {items.map((item) => {
          return <li key={item.id}>{item.name}</li>;
        })}
        <li>
          <label htmlFor="new-item-input">Item Name:</label>
          <input
            id="new-item-input"
            type="text"
            placeholder="Name of item to vote on"
            value={newItemText}
            onChange={(e: FormEvent<HTMLInputElement>) =>
              setNewItemText(e.currentTarget.value)
            }
          />
          <button onClick={onAddItemClick}>Add</button>
        </li>
      </ul>

      <button onClick={onCreateClick}>Create Topic</button>
    </div>
  );
};

export default CreateTopicForm;
