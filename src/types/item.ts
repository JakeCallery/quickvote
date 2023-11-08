import { BaseItem } from "@/types/baseItem";

export type Item = {
  userId?: string;
  topicId?: string;
  voteCount?: number;
} & BaseItem;
