"use client";
import React, { useState } from "react";
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
  faLockOpen,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import { Topic } from "@/types/topic";

const TopicList = () => {
  const router = useRouter();

  const {
    isLoading,
    error,
    mutate,
    data: topics,
  } = useSWR(TOPICS_API_ENDPOINT, getTopics);

  console.log("Topics: ", topics);

  const [topicToDelete, setTopicToDelete] = useState<Topic>();

  const callDeleteTopic = async (topicId: string) => {
    try {
      await mutate(deleteTopic(topicId), deleteTopicOptions(topicId));
    } catch (error) {
      console.error("[JAC]Error: ", error);
    }
  };

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (error) {
    content = <p>{error.message}</p>;
  } else {
    content = (
      <table className="table">
        {/*<thead>*/}
        {/*  <tr>*/}
        {/*    <th></th>*/}
        {/*    <th>Topic</th>*/}
        {/*    <th>Edit</th>*/}
        {/*    <th>Delete</th>*/}
        {/*  </tr>*/}
        {/*</thead>*/}
        <tbody>
          {topics?.map((topic) => {
            return (
              <tr
                key={topic.id}
                className="hover"
                onClick={() => router.push(`/topics/${topic.id}/vote`)}
                style={{ cursor: "pointer" }}
              >
                {topic.isOpen ? (
                  <td className="text-center">
                    <FontAwesomeIcon icon={faLockOpen} />
                  </td>
                ) : (
                  <td className="text-center">
                    <FontAwesomeIcon icon={faLock} />
                  </td>
                )}
                <td key={topic.id}>{topic.name}</td>
                <td className="text-center">
                  <FontAwesomeIcon
                    icon={faPenToSquare}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/topics/${topic.id}/edit`);
                    }}
                  />
                </td>
                <td className="text-center">
                  <FontAwesomeIcon
                    icon={faCircleXmark}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (document) {
                        setTopicToDelete(topic);
                        (
                          document.getElementById(
                            "delete_topic_modal",
                          ) as HTMLFormElement
                        ).showModal();
                      }
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="overflow-x-auto">
      {content}
      <Link className="btn btn-primary mt-5" href="/createtopic">
        Create New Topic
      </Link>
      <dialog id="delete_topic_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Permanently delete topic?</h3>
          <p className="py-4">{topicToDelete?.name}</p>
          <div className="modal-action">
            <form method="dialog" className="flex-row space-x-2">
              <button className="btn btn-primary">Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (topicToDelete) callDeleteTopic(topicToDelete.id);
                }}
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default TopicList;
