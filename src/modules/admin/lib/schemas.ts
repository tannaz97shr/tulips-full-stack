import { z } from "zod";
import { CATEGORIES, COLORS, OCCASIONS, SEASONS, SIZES } from "@/modules/catalog/constants";
import { CONTENT } from "@/modules/admin/content";

export const productWriteSchema = z.object({
  slug: z
    .string()
    .min(1, CONTENT.validation.slugRequired)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, CONTENT.validation.slugInvalid),
  name: z.string().min(1, CONTENT.validation.nameRequired),
  description: z.string().min(1, CONTENT.validation.descriptionRequired),
  sku: z.string().min(1, CONTENT.validation.skuRequired),
  category: z.enum(CATEGORIES, CONTENT.validation.categoryRequired),
  colors: z.array(z.enum(COLORS)).min(1, CONTENT.validation.colorsRequired),
  occasions: z.array(z.enum(OCCASIONS)).min(1, CONTENT.validation.occasionsRequired),
  species: z.string().optional(),
  size: z.enum(SIZES, CONTENT.validation.sizeRequired),
  season: z.enum(SEASONS, CONTENT.validation.seasonRequired),
  tags: z.array(z.string().min(1)),
  isFeatured: z.boolean(),
  price: z.number().int().positive(CONTENT.validation.priceInvalid),
  stockCount: z.number().int().nonnegative(CONTENT.validation.stockInvalid),
});

export const productFormSchema = productWriteSchema.omit({ price: true }).extend({
  priceDollars: z.coerce.number().positive(CONTENT.validation.priceInvalid),
});

export type ProductWriteInput = z.infer<typeof productWriteSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
