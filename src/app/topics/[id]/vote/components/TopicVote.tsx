import React from "react";
import { Topic } from "@/types/topic";

const TopicVote = ({ topic }: { topic: Topic }) => {
  return (
    <div>
      <h1>Vote on topic: {topic.name}</h1>
    </div>
  );
};

export default TopicVote;
