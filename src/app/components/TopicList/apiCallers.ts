import { Topic } from "@/app/components/TopicList/topic";

export const TOPICS_API_ENDPOINT = "/api/topics";

export const getTopics = async () => {
  const res = await fetch(TOPICS_API_ENDPOINT);
  const data = (await res.json()) as Topic[];
  console.log("Data: ", data);
  return data;
};
