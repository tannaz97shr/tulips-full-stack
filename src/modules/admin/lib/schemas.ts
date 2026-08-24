import { z } from "zod";
import { CATEGORIES, COLORS, OCCASIONS, SEASONS, SIZES } from "@/modules/catalog/constants";
import { CONTENT } from "@/modules/admin/content";

const productComponentSchema = z.object({
  productId: z.string().min(1, CONTENT.validation.componentProductRequired),
  quantity: z.number().int().positive(CONTENT.validation.componentQuantityInvalid),
});

/** Shared by any schema needing "components required when isComposite" so the message/path logic isn't duplicated. */
function requireComponentsWhenComposite(
  data: { isComposite: boolean; components?: { productId: string; quantity: number }[] },
  ctx: z.RefinementCtx
) {
  if (data.isComposite && (!data.components || data.components.length === 0)) {
    ctx.addIssue({ code: "custom", path: ["components"], message: CONTENT.validation.componentsRequired });
  }
}

export const productWriteSchema = z.object({
  slug: z
    .string()
    .min(1, CONTENT.validation.slugRequired)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, CONTENT.validation.slugInvalid),
  name: z.string().min(1, CONTENT.validation.nameRequired),
  description: z.string().min(1, CONTENT.validation.descriptionRequired),
  sku: z.string().min(1, CONTENT.validation.skuRequired),
  category: z.enum(CATEGORIES, CONTENT.validation.categoryRequired),
  isComposite: z.boolean(),
  components: z.array(productComponentSchema).optional(),
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

/** POST/create only — isComposite is in the same payload as components, so the refinement runs in one parse call. */
export const productCreateSchema = productWriteSchema.superRefine(requireComponentsWhenComposite);

export const productFormSchema = productWriteSchema
  .omit({ price: true })
  .extend({
    priceDollars: z.coerce.number().positive(CONTENT.validation.priceInvalid),
  })
  .superRefine(requireComponentsWhenComposite);

export type ProductWriteInput = z.infer<typeof productWriteSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
/** The raw pre-parse shape react-hook-form's `control`/`register` are keyed on (differs from `ProductFormInput` only in that `z.coerce` fields, e.g. `priceDollars`, accept `unknown` here). */
export type ProductFormValues = z.input<typeof productFormSchema>;
