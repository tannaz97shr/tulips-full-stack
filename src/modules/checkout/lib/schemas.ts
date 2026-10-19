import { z } from "zod";
import { CONTENT } from "@/modules/checkout/content";
import { isTodayOrFutureIso, parseDisplayDate } from "@/shared/utils/calendarDate";

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

/** API contract (POST /api/checkout/session): deliveryDate is ISO "YYYY-MM-DD", today or later in shop time. */
export const checkoutSchema = z.object({
  recipientName: z.string().min(1, CONTENT.validation.recipientNameRequired),
  deliveryAddress: deliveryAddressSchema,
  deliveryDate: z.string().refine((value) => isTodayOrFutureIso(value), CONTENT.validation.deliveryDateInvalid),
  items: z.array(checkoutItemSchema).min(1, CONTENT.validation.itemsRequired),
});

export type CheckoutFormInput = z.infer<typeof checkoutSchema>;

/**
 * Checkout form (client): same fields minus `items`, but the customer types
 * the delivery date as dd/mm/yyyy. Converted to ISO with `parseDisplayDate`
 * before it is sent to the API.
 */
export const checkoutDetailsFormSchema = checkoutSchema.omit({ items: true }).extend({
  deliveryDate: z
    .string()
    .refine((value) => parseDisplayDate(value) !== null, CONTENT.validation.deliveryDateFormat)
    .refine((value) => {
      const iso = parseDisplayDate(value);
      return iso !== null && isTodayOrFutureIso(iso);
    }, CONTENT.validation.deliveryDateInvalid),
});

export type CheckoutDetailsFormInput = z.infer<typeof checkoutDetailsFormSchema>;
