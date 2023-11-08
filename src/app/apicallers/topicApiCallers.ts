import { Topic } from "@/types/topic";
import { MutatorOptions } from "swr";
import { Item } from "@/types/item";
import {
  INVITED_TOPICS_API_ENDPOINT,
  TOPICS_API_ENDPOINT,
} from "@/app/config/paths";
import { VoteCount } from "@/types/voteCount";
import {
  createClientSideFetchError,
  createClientSideUnknownError,
} from "@/app/helpers/clientSideErrorHandling";

export const getTopics = async () => {
  let res;
  try {
    res = await fetch(TOPICS_API_ENDPOINT);
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while fetching the topics",
    );
  }

  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while fetching the topics",
    );
  }

  return (await res.json()) as Topic[];
};

export const getInvitedTopics = async () => {
  let res;
  try {
    res = await fetch(INVITED_TOPICS_API_ENDPOINT);
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while fetching the invited topics.",
    );
  }

  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while fetching the invited topics.",
    );
  }

  return (await res.json()) as Topic[];
};

export const getVotesForTopic = async (url: string) => {
  let res;
  try {
    res = await fetch(url);
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while fetching the votes",
    );
  }

  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while fetching the votes",
    );
  }

  const data = await res.json();
  return data.counts as VoteCount[];
};

export const addVote = async (
  itemId: string,
  topicId: string,
  currentVoteCount: VoteCount,
): Promise<any> => {
  let res;
  try {
    res = await fetch(`${TOPICS_API_ENDPOINT}/${topicId}/votes`, {
      method: "POST",
      body: JSON.stringify({ itemId: itemId }),
    });
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while adding a vote",
    );
  }
  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while adding a vote",
    );
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

//TODO: Decide what to do if user tries to add a user that doesn't exist in the DB yet
export const addTopic = async (newTopic: Topic) => {
  const items = newTopic.items.map((item) => {
    return { name: item.name };
  });

  const data = {
    name: newTopic.name,
    items: items,
    invitedUsers: newTopic.invitedUsers || [],
  };

  let res;
  try {
    res = await fetch(TOPICS_API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while creating new topic",
    );
  }
  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while creating the topic",
    );
  }
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
  let res;
  try {
    res = await fetch(`${TOPICS_API_ENDPOINT}/${topicId}`, {
      method: "DELETE",
    });
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while deleting a topic",
    );
  }
  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while deleting a topic",
    );
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
  let res;
  try {
    res = await fetch(`${TOPICS_API_ENDPOINT}/${topicId}/items`);
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while fetching the items",
    );
  }
  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while fetching the items",
    );
  }

  return (await res.json()) as Item[];
};

export const updateTopic = async (updatedTopic: Topic) => {
  const data = {
    name: updatedTopic.name,
    items: updatedTopic.items,
    invitedUsers: updatedTopic.invitedUsers || [],
  };

  let res;
  try {
    res = await fetch(`${TOPICS_API_ENDPOINT}/${updatedTopic.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } catch (error) {
    throw createClientSideUnknownError(
      error,
      "Unknown error occurred while updating the topic",
    );
  }
  if (!res.ok) {
    throw await createClientSideFetchError(
      res,
      "An error occurred while updating the topic",
    );
  }

  return await res.json();
};
