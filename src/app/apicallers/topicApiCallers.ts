import { Topic } from "@/types/topic";
import { MutatorOptions } from "swr";
import { Item } from "@/types/item";

export const TOPICS_API_ENDPOINT = "/api/topics";

export const getTopics = async () => {
  const res = await fetch(TOPICS_API_ENDPOINT);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the topics.",
    ) as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return (await res.json()) as Topic[];
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

  return await res.json();
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

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the items.",
    ) as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return (await res.json()) as Item[];
};

export const updateTopic = async (updatedTopic: Topic) => {
  const data = { name: updatedTopic.name, items: updatedTopic.items };
  const res = await fetch(`${TOPICS_API_ENDPOINT}/${updatedTopic.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while updating the topic.",
    ) as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return await res.json();
};
