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
import toast from "react-hot-toast";
import { getFetchErrorMessage } from "@/app/helpers/clientSideErrorHandling";

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
  const onPlusVoteClick = async (item: Item) => {
    const currentVC = voteCounts?.find((vc) => vc.itemId === item.id);
    if (currentVC) {
      setIsVoteDisabled(true);
      try {
        await mutate(
          addVote(item.id!, topic.id, currentVC),
          addVoteOptions(currentVC),
        );
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
      }
      setIsVoteDisabled(false);
    }
  };

  const onMinusVoteClick = (item: Item) => {
    console.log("Minus Click: ", item.id);
  };

  return (
    <div className="flex flex-col space-y-2">
      {topic.items.map((item) => {
        return (
          <div className="flex space-x-2 items-center" key={item.id}>
            <div className="flex space-x-2">
              <button
                className="btn btn-circle btn-primary"
                onClick={() => onPlusVoteClick(item)}
                disabled={isVoteDisabled}
              >
                <span className="text-2xl font-bold">+</span>
              </button>
              <button
                className="btn btn-circle btn-primary"
                onClick={() => onMinusVoteClick(item)}
                disabled={isVoteDisabled || true}
              >
                <span className="text-2xl font-bold">-</span>
              </button>
            </div>
            <p className="text-xl font-semibold flex-grow">{item.name}</p>
            <p className="">
              {voteCounts?.find((vc) => vc.itemId === item.id)?.voteCount}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default TopicVote;
