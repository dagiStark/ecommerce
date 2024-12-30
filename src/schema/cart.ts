import { z } from "zod";

export type CreateCartType = z.infer<typeof CreateCartSchema>;

export const CreateCartSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
});

export const ChangeCartItemQuantitySchema = z.object({
  quantity: z.number(),
});