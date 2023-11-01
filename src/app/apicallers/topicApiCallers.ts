import { Topic } from "@/types/topic";
import { MutatorOptions } from "swr";
import { Item } from "@/types/item";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import { VoteCount } from "@/types/voteCount";

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

export const getVotesForTopic = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the topics.",
    ) as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.counts as VoteCount[];
};

export const addVote = async (
  itemId: string,
  topicId: string,
  currentVoteCount: VoteCount,
): Promise<any> => {
  const res = await fetch(`${TOPICS_API_ENDPOINT}/${topicId}/votes`, {
    method: "POST",
    body: JSON.stringify({ itemId: itemId }),
  });

  //TODO: Test this error handling
  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the topics.",
    ) as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  const data = await res.json();

  return {
    itemId: data.itemId,
    voteCount: currentVoteCount.voteCount + 1,
  };
};

export const addVoteOptions = (currentVC: VoteCount): MutatorOptions => {
  return {
    optimisticData: (voteCounts: VoteCount[]) => {
      return voteCounts.map((vc) => {
        const newVc: VoteCount = { itemId: vc.itemId, voteCount: vc.voteCount };
        if (newVc.itemId === currentVC.itemId) newVc.voteCount++;
        return newVc;
      });
    },
    revalidate: false,
    populateCache: (newVote, voteCounts: VoteCount[]) => {
      return voteCounts.map((vc: VoteCount) => {
        const newVc: VoteCount = { itemId: vc.itemId, voteCount: vc.voteCount };
        if (newVc.itemId === newVote.itemId) newVc.voteCount++;
        return newVc;
      });
    },
  };
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

export const deleteTopic = async (topicId: string) => {
  const res = await fetch(`${TOPICS_API_ENDPOINT}/${topicId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = new Error(
      "An error occurred while deleting the topic.",
    ) as FetchError;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return await res.json();
};

export const deleteTopicOptions = (topicIdToRemove: string): MutatorOptions => {
  return {
    optimisticData: (topics: Topic[]) =>
      topics.filter((topic: Topic) => topic.id !== topicIdToRemove),
    revalidate: false,
    populateCache: (deletedTopic, topics) =>
      topics.filter((topic: Topic) => topic.id !== deletedTopic.id),
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
