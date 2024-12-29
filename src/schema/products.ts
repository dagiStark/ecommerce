import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.string().transform((val) => parseFloat(val)), 
  tags: z.array(z.string()),
});
