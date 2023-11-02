"use client";
import React from "react";
import { Topic } from "@/types/topic";
import { updateTopic } from "@/app/apicallers/topicApiCallers";
import toast from "react-hot-toast";
import TopicForm from "@/app/components/TopicForm/TopicForm";
import { useRouter } from "next/navigation";

const EditTopicForm = ({ topic }: { topic: Topic }) => {
  const router = useRouter();

  const saveChanges = async (updatedTopic: Topic) => {
    try {
      const resData = await updateTopic(updatedTopic);

      if (!("error" in resData)) {
        await router.push("/topics");
      } else {
        console.log("[JAC-ERROR]", resData.error);
        toast.error("Unable to save changes to topic.");
      }
    } catch (err) {
      console.error("[JAC-ERROR]", err);
      toast.error("Unable to save changes to topic.");
    }
  };

  return (
    <TopicForm
      topic={topic}
      commitChanges={saveChanges}
      commitChangesButtonText="Save Changes"
    />
  );
};

export default EditTopicForm;
