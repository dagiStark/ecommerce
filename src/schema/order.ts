import { z } from "zod";

export type CreateOrderType = z.infer<typeof CreateOrderSchema>;

export const CreateOrderSchema = z.object({
  netAmount: z.number(),
  address: z.string(),
});

export const UpdateOrderSchema = z.object({
  netAmount: z.number(),
  address: z.string(),
});


export const OrderEventStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);
