"use client";
import React, { useState } from "react";
import { Topic } from "@/types/topic";
import { updateTopic } from "@/app/apicallers/topicApiCallers";
import toast from "react-hot-toast";
import TopicForm from "@/app/components/TopicForm/TopicForm";
import { useRouter } from "next/navigation";
import { getFetchErrorMessage } from "@/app/helpers/clientSideErrorHandling";

const EditTopicForm = ({ topic }: { topic: Topic }) => {
  const router = useRouter();
  const [isCommittingChanges, setIsCommittingChanges] = useState(false);
  const saveChanges = async (updatedTopic: Topic) => {
    setIsCommittingChanges(true);
    try {
      const resData = await updateTopic(updatedTopic);
      //TODO: Find a way to update the local cache instead of a full refresh of the topics
      router.refresh();
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
      // console.error("[JAC-ERROR]", err);
      // toast.error("Unable to save changes to topic.");
      setIsCommittingChanges(false);
    }
  };

  return (
    <TopicForm
      topic={topic}
      commitChanges={saveChanges}
      commitChangesButtonText="Save Changes"
      committingChanges={isCommittingChanges}
    />
  );
};

export default EditTopicForm;
