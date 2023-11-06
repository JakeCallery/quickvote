"use client";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { addTopic, addTopicOptions } from "@/app/apicallers/topicApiCallers";
import { Topic } from "@/types/topic";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TopicForm from "@/app/components/TopicForm/TopicForm";
const CreateTopicForm = ({
  mutateTopic,
}: {
  mutateTopic?: KeyedMutator<Topic[]>;
}) => {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  const createTopic = async (newTopic: Topic) => {
    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  return (
    <TopicForm
      commitChanges={createTopic}
      commitChangesButtonText="Create Topic"
      committingChanges={isSaving}
    />
  );
};

export default CreateTopicForm;
