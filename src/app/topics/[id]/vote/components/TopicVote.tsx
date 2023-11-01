"use client";
import React, { useState } from "react";
import { Topic } from "@/types/topic";
import { Item } from "@/types/item";
import useSWR from "swr";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import {
  addVote,
  addVoteOptions,
  getVotesForTopic,
} from "@/app/apicallers/topicApiCallers";

const TopicVote = ({ topic }: { topic: Topic }) => {
  const {
    isLoading,
    error,
    data: voteCounts,
    mutate,
  } = useSWR(`${TOPICS_API_ENDPOINT}/${topic.id}/votes`, getVotesForTopic);

  const [isVoteDisabled, setIsVoteDisabled] = useState(false);

  //TODO: Handle rapid clicking of "vote" button
  // currently the state doesn't update fast enough, so sending the current vote count
  // to use in the cache calculation doesn't really work in that situation.
  // Currently disabling all buttons until vote is complete.
  const handleVoteClick = async (item: Item) => {
    const currentVC = voteCounts?.find((vc) => vc.itemId === item.id);
    if (currentVC) {
      setIsVoteDisabled(true);
      await mutate(
        addVote(item.id!, topic.id, currentVC),
        addVoteOptions(currentVC),
      );
      setIsVoteDisabled(false);
    }
  };

  return (
    <div>
      <h1 className="font-extrabold">{topic.name}</h1>
      <ul>
        {topic.items.map((item) => {
          return (
            <li key={item.id}>
              <div className="flex-row space-x-2">
                <button
                  className="border rounded-2xl bg-sky-500 p-2"
                  onClick={() => handleVoteClick(item)}
                  disabled={isVoteDisabled}
                >
                  Add Vote
                </button>
                <span className="font-bold">{item.name}</span>
                <span>
                  {voteCounts?.find((vc) => vc.itemId === item.id)?.voteCount}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TopicVote;
