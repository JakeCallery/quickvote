"use client";
import React from "react";
import CreateTopicForm from "@/app/components/CreateTopicForm/CreateTopicForm";
import useSWR from "swr";
import {
  getTopics,
  TOPICS_API_ENDPOINT,
} from "@/app/apicallers/topicApiCallers";

const CreateTopicPage = () => {
  const {
    isLoading,
    error,
    data: topics,
    mutate,
  } = useSWR(TOPICS_API_ENDPOINT, getTopics);

  return (
    <div className="flex-col">
      <h1>Create Topic Page</h1>
      <CreateTopicForm mutateTopic={mutate} />
    </div>
  );
};

export default CreateTopicPage;
