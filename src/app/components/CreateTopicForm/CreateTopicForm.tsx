"use client";
import React, { FormEvent, useState } from "react";
import { useLogger } from "next-axiom";
const CreateTopicForm = () => {
  const log = useLogger();
  const [nameText, setNameText] = useState("");

  const onCreateClick = () => {
    log.debug("Caught Create Click: ", { topicName: nameText });
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
