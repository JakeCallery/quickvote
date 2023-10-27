"use client";
import React, { useState } from "react";
import CreateTopicForm from "@/app/components/CreateTopicForm/CreateTopicForm";
import {
  getTopics,
  TOPICS_API_ENDPOINT,
} from "@/app/components/TopicList/apiCallers";
import useSWR from "swr";

const TopicList = () => {
  const {
    isLoading,
    error,
    data: topics,
    mutate,
  } = useSWR(TOPICS_API_ENDPOINT, getTopics);

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (error) {
    content = <p>{error.message}</p>;
  } else {
    console.log("New Topics: ", topics);
    content = topics?.map((topic) => {
      return <li key={topic.id}>{topic.name}</li>;
    });
  }

  return (
    <div>
      <p>Topics List</p>
      <ul>{content}</ul>
      <CreateTopicForm mutate={mutate} />
    </div>
  );
};

export default TopicList;
