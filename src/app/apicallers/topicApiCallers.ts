import { Topic } from "@/types/topic";
import { MutatorOptions } from "swr";
import { Item } from "@/types/item";
import {
  INVITED_TOPICS_API_ENDPOINT,
  TOPICS_API_ENDPOINT,
} from "@/app/config/paths";
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

export const getInvitedTopics = async () => {
  try {
    const res = await fetch(INVITED_TOPICS_API_ENDPOINT);

    if (!res.ok) {
      const error = new Error(
        "An error occurred while fetching the invited topics.",
      ) as FetchError;
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return (await res.json()) as Topic[];
  } catch (error) {
    return { error: error };
  }
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

  try {
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
  } catch (error) {
    return { error: error };
  }
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
  const emailAddresses = newTopic.invitedUsers?.map((user) => {
    return user.email;
  });
  const data = {
    name: newTopic.name,
    items: items,
    invitedUsers: emailAddresses,
  };

  try {
    const res = await fetch(TOPICS_API_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = new Error(
        "An error occurred while creating a new topic.",
      ) as FetchError;
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }
    return await res.json();
  } catch (error) {
    return { error: error };
  }
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

  try {
    if (!res.ok) {
      const error = new Error(
        "An error occurred while deleting the topic.",
      ) as FetchError;
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return await res.json();
  } catch (error) {
    return { error: error };
  }
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

  try {
    if (!res.ok) {
      const error = new Error(
        "An error occurred while fetching the items.",
      ) as FetchError;
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return (await res.json()) as Item[];
  } catch (error) {
    return { error: error };
  }
};

export const updateTopic = async (updatedTopic: Topic) => {
  const data = {
    name: updatedTopic.name,
    items: updatedTopic.items,
    invitedUsers:
      updatedTopic.invitedUsers?.map((invitedUser) => invitedUser.email) || [],
  };
  const res = await fetch(`${TOPICS_API_ENDPOINT}/${updatedTopic.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  try {
    if (!res.ok) {
      const error = new Error(
        "An error occurred while updating the topic.",
      ) as FetchError;
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }

    return await res.json();
  } catch (error) {
    return { error: error };
  }
};
