import { Topic } from "@/types/topic";
import { MutatorOptions } from "swr";
import { Item } from "@/types/item";

export const TOPICS_API_ENDPOINT = "/api/topics";

export const getTopics = async () => {
  const res = await fetch(TOPICS_API_ENDPOINT);
  const data = (await res.json()) as Topic[];
  return data;
};

export const addTopic = async (newTopic: Topic) => {
  const items = newTopic.items.map((item) => {
    return { name: item.name };
  });
  const data = { name: newTopic.name, items: items };

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

export const getItems = async (topicId: string) => {
  const res = await fetch(`${TOPICS_API_ENDPOINT}/${topicId}/items`);
  const data = (await res.json()) as Item[];
  return data;
};

export const updateTopic = async (updatedTopic: Topic) => {
  // const items = updatedTopic.items.map((item) => {
  //   return { name: item.name };
  // });
  const data = { name: updatedTopic.name, items: updatedTopic.items };

  const res = await fetch(`${TOPICS_API_ENDPOINT}/${updatedTopic.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  return resData;
};
