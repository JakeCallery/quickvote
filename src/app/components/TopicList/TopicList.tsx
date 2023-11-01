"use client";
import React from "react";
import {
  deleteTopic,
  deleteTopicOptions,
  getTopics,
} from "@/app/apicallers/topicApiCallers";
import useSWR from "swr";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCircleXmark,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { Topic } from "@/types/topic";

const TopicList = () => {
  const router = useRouter();

  const {
    isLoading,
    error,
    mutate,
    data: topics,
  } = useSWR(TOPICS_API_ENDPOINT, getTopics);

  const callDeleteTopic = async (topicId: string) => {
    try {
      await mutate(deleteTopic(topicId), deleteTopicOptions(topicId));
    } catch (error) {
      console.error("[JAC]Error: ", error);
    }
  };

  const handleDeleteTopicClick = (topic: Topic) => {
    confirmAlert({
      title: `Delete Topic: ${topic.name}`,
      message: "Are you sure you want to delete this topic?",
      buttons: [
        {
          label: "Yes",
          onClick: () => callDeleteTopic(topic.id),
        },
        {
          label: "No",
        },
      ],
    });
  };

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (error) {
    content = <p>{error.message}</p>;
  } else {
    content = topics?.map((topic) => {
      return (
        <li key={topic.id}>
          {topic.name}
          <FontAwesomeIcon
            icon={faPenToSquare}
            onClick={() => router.push(`/topics/${topic.id}/edit`)}
          />
          <FontAwesomeIcon
            icon={faCircleXmark}
            onClick={() => handleDeleteTopicClick(topic)}
          />
          <FontAwesomeIcon
            icon={faEye}
            onClick={() => router.push(`/topics/${topic.id}/vote`)}
          />
        </li>
      );
    });
  }

  return (
    <div>
      <p>Topics List</p>
      <ul>{content}</ul>
      <Link href="/createtopic">Create New Topic</Link>
    </div>
  );
};

export default TopicList;
