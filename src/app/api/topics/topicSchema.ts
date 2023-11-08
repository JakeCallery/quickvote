import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
});

const invitedUsersSchema = z.object({
  email: z.string().email(),
  id: z.string().optional(),
});

const topicSchema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema),
  invitedUsers: z.array(invitedUsersSchema).optional(),
});

export default topicSchema;
