import { z } from "zod";
import { CONTENT } from "@/modules/checkout/content";

const deliveryAddressSchema = z.object({
  line1: z.string().min(1, CONTENT.validation.line1Required),
  line2: z.string().optional(),
  suburb: z.string().min(1, CONTENT.validation.suburbRequired),
  state: z.string().min(1, CONTENT.validation.stateRequired),
  postcode: z.string().regex(/^\d{4}$/, CONTENT.validation.postcodeInvalid),
  country: z.literal("AU"),
});

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

function isTodayOrFuture(value: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date >= today;
}

export const checkoutSchema = z.object({
  recipientName: z.string().min(1, CONTENT.validation.recipientNameRequired),
  deliveryAddress: deliveryAddressSchema,
  deliveryDate: z.string().refine(isTodayOrFuture, CONTENT.validation.deliveryDateInvalid),
  items: z.array(checkoutItemSchema).min(1, CONTENT.validation.itemsRequired),
});

export type CheckoutFormInput = z.infer<typeof checkoutSchema>;
