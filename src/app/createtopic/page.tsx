import React from "react";
import CreateTopicForm from "@/app/components/CreateTopicForm/CreateTopicForm";
import useSWR from "swr";
import {
  getTopics,
  TOPICS_API_ENDPOINT,
} from "@/app/components/TopicList/apiCallers";

const CreateTopicPage = () => {
  const {
    isLoading,
    error,
    data: topics,
    mutate,
  } = useSWR(TOPICS_API_ENDPOINT, getTopics);

  return (
    <>
      <h1>Create Topic Page</h1>
      <CreateTopicForm mutate={mutate} />
    </>
  );
};

export default CreateTopicPage;
