import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
});

const topicSchema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema),
  invitedUsers: z.array(z.string().email()).optional(),
});

export default topicSchema;
