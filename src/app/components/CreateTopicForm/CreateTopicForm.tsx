"use client";
import React, { FormEvent, useState } from "react";
import { useLogger } from "next-axiom";
import { KeyedMutator, mutate } from "swr";
import {
  addTopic,
  addTopicOptions,
} from "@/app/components/TopicList/apiCallers";
import { Topic } from "@/app/components/TopicList/topic";
const CreateTopicForm = ({ mutate }: { mutate: KeyedMutator<Topic[]> }) => {
  const log = useLogger();
  const [nameText, setNameText] = useState("");

  const onCreateClick = async () => {
    log.debug("Caught Create Click: ", { topicName: nameText });
    const newTopic = { id: "terribleID", name: nameText };
    try {
      await mutate(addTopic(newTopic), addTopicOptions(newTopic));
    } catch (err) {
      console.error("Caught Error: ", err);
    }
  };

  return (
    <div>
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
      <button onClick={onCreateClick}>Create Topic</button>
    </div>
  );
};

export default CreateTopicForm;
