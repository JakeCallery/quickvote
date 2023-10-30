import { Topic } from "@/app/components/TopicList/topic";
import { mutate, MutatorOptions } from "swr";

export const TOPICS_API_ENDPOINT = "/api/topics";

export const getTopics = async () => {
  const res = await fetch(TOPICS_API_ENDPOINT);
  const data = (await res.json()) as Topic[];
  return data;
};

export const addTopic = async (newTopic: Topic) => {
  const data = { name: newTopic.name };

  const res = await fetch(TOPICS_API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  return resData;
};

export const addTopicOptions = (newTopic: Topic): MutatorOptions => {
  return {
    optimisticData: (topics: Topic[]) => [...topics, newTopic],
    revalidate: false,
    populateCache: (added, topics) => [...topics, added],
  };
};
