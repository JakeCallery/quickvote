import { Item } from "@/types/item";
import { InvitedUser } from "@/types/invitedUser";

export type Topic = {
  id: string;
  name: string;
  items: Item[];
  isOpen?: boolean;
  userId?: string;
  invitedUsers?: InvitedUser[];
};
