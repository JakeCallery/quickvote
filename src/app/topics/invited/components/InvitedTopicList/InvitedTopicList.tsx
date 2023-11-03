"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import { getInvitedTopics } from "@/app/apicallers/topicApiCallers";

const InvitedTopicList = () => {
  const router = useRouter();

  const {
    isLoading,
    error,
    mutate,
    data: invitedTopics,
  } = useSWR(TOPICS_API_ENDPOINT, getInvitedTopics);

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (error) {
    content = <p>{error.message}</p>;
  } else {
    content = (
      <div>
        {invitedTopics &&
        !("error" in invitedTopics) &&
        invitedTopics.length > 0 ? (
          <ul>
            {invitedTopics?.map((topic) => {
              return (
                <li
                  key={topic.id}
                  className={`mb-2  ${topic.isOpen ? "hover:bg-base-300" : ""}`}
                >
                  <div
                    className={`flex flex-row items-center border pl-2 ${
                      !topic.isOpen ? "text-base-300" : ""
                    }`}
                  >
                    <span className="flex-grow">{topic.name}</span>
                    {topic.isOpen ? (
                      <button
                        className="btn btn-primary"
                        onClick={() => router.push(`/topics/${topic.id}/vote`)}
                      >
                        VOTE
                      </button>
                    ) : (
                      <button className="btn btn-disabled">CLOSED</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p> You have not been invited to any topics </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div>{content}</div>
      {error && <h1>{error}</h1>}
    </>
  );
};

export default InvitedTopicList;
