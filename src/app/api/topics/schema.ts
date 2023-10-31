import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1),
});

const schema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema),
});

export default schema;
