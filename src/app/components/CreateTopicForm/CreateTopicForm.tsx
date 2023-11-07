"use client";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { addTopic, addTopicOptions } from "@/app/apicallers/topicApiCallers";
import { Topic } from "@/types/topic";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TopicForm from "@/app/components/TopicForm/TopicForm";
import { getFetchErrorMessage } from "@/app/helpers/clientSideErrorHandling";
const CreateTopicForm = ({
  mutateTopic,
}: {
  mutateTopic?: KeyedMutator<Topic[]>;
}) => {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);

  const createTopic = async (newTopic: Topic) => {
    setIsSaving(true);
    try {
      if (mutateTopic) {
        await mutateTopic(addTopic(newTopic), addTopicOptions(newTopic));
      } else {
        await addTopic(newTopic);
      }
      router.push("/topics");
    } catch (error) {
      const thisError = error as FetchError;
      console.error(
        "[JAC-ERROR]",
        thisError.message,
        thisError.originalErrorMessage,
        thisError.status,
      );
      toast.error(
        `${getFetchErrorMessage(error)}: ${thisError.originalErrorMessage}`,
      );
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
