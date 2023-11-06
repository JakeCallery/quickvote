"use client";
import React, { useState } from "react";
import { Topic } from "@/types/topic";
import { updateTopic } from "@/app/apicallers/topicApiCallers";
import toast from "react-hot-toast";
import TopicForm from "@/app/components/TopicForm/TopicForm";
import { useRouter } from "next/navigation";

const EditTopicForm = ({ topic }: { topic: Topic }) => {
  const router = useRouter();
  const [isCommittingChanges, setIsCommittingChanges] = useState(false);
  const saveChanges = async (updatedTopic: Topic) => {
    setIsCommittingChanges(true);
    try {
      const resData = await updateTopic(updatedTopic);
      //TODO: Find a way to update the local cache instead of a full refresh of the topics
      router.refresh();
      if (!("error" in resData)) {
        router.push("/topics");
      } else {
        console.log("[JAC-ERROR]", resData.error);
        toast.error("Unable to save changes to topic.");
        setIsCommittingChanges(false);
      }
    } catch (err) {
      console.error("[JAC-ERROR]", err);
      toast.error("Unable to save changes to topic.");
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
