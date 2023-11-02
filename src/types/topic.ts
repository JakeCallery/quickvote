import { Item } from "@/types/item";

export type Topic = {
  id: string;
  name: string;
  items: Item[];
  isOpen?: boolean;
  userId?: string;
};
