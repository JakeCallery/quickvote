"use client";
import React, { FormEvent, useState } from "react";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";

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

  const onSaveChangesClick = () => {
    if (topic.name !== topicName) console.log("Update topic Name");
  };

  return (
    <div>
      <label htmlFor="topic-name-input">Topic Name:</label>
      <input
        id="topic-name-input"
        type="text"
        placeholder="Topic Name"
        value={topicName}
        onChange={(e: FormEvent<HTMLInputElement>) =>
          setTopicName(e.currentTarget.value)
        }
      />
      <ul>
        {topicItems.map((item) => {
          return (
            <div key={item.id}>
              <li>
                {itemToEdit !== null && item.id === itemToEdit.id ? (
                  <div>
                    <label htmlFor="item-to-edit-input">Item Name</label>
                    <input
                      type="text"
                      id="item-to-edit-input"
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
                  </div>
                ) : (
                  <div>
                    {item.name}
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      onClick={() => {
                        setItemToEdit(item);
                        setItemToEditText(item.name);
                      }}
                    />
                  </div>
                )}
              </li>
            </div>
          );
        })}
        <li>
          <label htmlFor="new-item-input">Item Name:</label>
          <input
            id="new-item-input"
            type="text"
            placeholder="Name of item to vote on"
            value={newTopicItemName}
            onChange={(e: FormEvent<HTMLInputElement>) =>
              setNewTopicItemName(e.currentTarget.value)
            }
          />
          <button onClick={onAddItemClick}>Add</button>
        </li>
      </ul>
      <button>Save Changes</button>
    </div>
  );
};

export default EditTopicForm;
