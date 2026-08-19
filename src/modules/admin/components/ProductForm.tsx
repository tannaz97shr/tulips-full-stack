"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Select } from "@/shared/components/atoms/Select";
import { Textarea } from "@/shared/components/atoms/Textarea";
import { ChipMultiSelect } from "@/shared/components/molecules/ChipMultiSelect";
import { FormField } from "@/shared/components/molecules/FormField";
import { ROUTES } from "@/shared/routes";
import { dollarsToCents } from "@/shared/utils/dollarsToCents";
import { slugify } from "@/shared/utils/slugify";
import { CATEGORIES, COLORS, OCCASIONS, SEASONS, SIZES } from "@/modules/catalog/constants";
import { CONTENT } from "@/modules/admin/content";
import { productFormSchema, type ProductFormInput, type ProductWriteInput } from "@/modules/admin/lib/schemas";

/** Thrown by `onSubmit` to attach a server-side error to a specific field (e.g. a slug conflict). */
export class ProductFormFieldError extends Error {
  field: keyof ProductFormInput;

  constructor(field: keyof ProductFormInput, message: string) {
    super(message);
    this.field = field;
  }
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormInput>;
  slugLocked?: boolean;
  onSubmit: (payload: ProductWriteInput) => Promise<void>;
}

const EMPTY_DEFAULTS: ProductFormInput = {
  slug: "",
  name: "",
  description: "",
  sku: "",
  category: CATEGORIES[0],
  colors: [],
  occasions: [],
  species: "",
  size: SIZES[0],
  season: SEASONS[0],
  tags: [],
  isFeatured: false,
  stockCount: 0,
  priceDollars: 0,
};

export function ProductForm({ defaultValues, slugLocked = false, onSubmit }: ProductFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(slugLocked);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  async function handleFormSubmit(values: ProductFormInput) {
    setFormError(null);
    const { priceDollars, ...rest } = values;
    const payload: ProductWriteInput = { ...rest, price: dollarsToCents(priceDollars) };

    try {
      await onSubmit(payload);
    } catch (error) {
      if (error instanceof ProductFormFieldError) {
        setError(error.field, { message: error.message });
        return;
      }
      setFormError(CONTENT.productForm.genericError);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-md" noValidate>
      <FormField label={CONTENT.fields.name} error={errors.name?.message}>
        {(id) => (
          <Input
            id={id}
            type="text"
            {...register("name", {
              onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                if (!slugTouched) {
                  setValue("slug", slugify(event.target.value));
                }
              },
            })}
          />
        )}
      </FormField>
      <FormField
        label={CONTENT.fields.slug}
        error={errors.slug?.message}
      >
        {(id) => (
          <>
            <Input
              id={id}
              type="text"
              readOnly={slugLocked}
              className={slugLocked ? "cursor-not-allowed opacity-60" : undefined}
              {...register("slug", {
                onChange: () => setSlugTouched(true),
              })}
            />
            <span className="text-sm text-foreground/60">
              {slugLocked ? CONTENT.productForm.slugLockedHelp : CONTENT.productForm.slugHelp}
            </span>
          </>
        )}
      </FormField>
      <FormField label={CONTENT.fields.description} error={errors.description?.message}>
        {(id) => <Textarea id={id} {...register("description")} />}
      </FormField>
      <FormField label={CONTENT.fields.sku} error={errors.sku?.message}>
        {(id) => <Input id={id} type="text" {...register("sku")} />}
      </FormField>
      <FormField label={CONTENT.fields.category} error={errors.category?.message}>
        {(id) => <Select id={id} options={CATEGORIES} placeholder="Select a category" {...register("category")} />}
      </FormField>
      <FormField label={CONTENT.fields.colors} error={errors.colors?.message}>
        {(id) => (
          <Controller
            control={control}
            name="colors"
            render={({ field }) => (
              <ChipMultiSelect id={id} options={COLORS} value={field.value} onChange={field.onChange} />
            )}
          />
        )}
      </FormField>
      <FormField label={CONTENT.fields.occasions} error={errors.occasions?.message}>
        {(id) => (
          <Controller
            control={control}
            name="occasions"
            render={({ field }) => (
              <ChipMultiSelect id={id} options={OCCASIONS} value={field.value} onChange={field.onChange} />
            )}
          />
        )}
      </FormField>
      <FormField label={CONTENT.fields.species} error={errors.species?.message}>
        {(id) => <Input id={id} type="text" {...register("species")} />}
      </FormField>
      <FormField label={CONTENT.fields.size} error={errors.size?.message}>
        {(id) => <Select id={id} options={SIZES} placeholder="Select a size" {...register("size")} />}
      </FormField>
      <FormField label={CONTENT.fields.season} error={errors.season?.message}>
        {(id) => <Select id={id} options={SEASONS} placeholder="Select a season" {...register("season")} />}
      </FormField>
      <FormField label={CONTENT.fields.tags} error={errors.tags?.message}>
        {(id) => (
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <>
                <Input
                  id={id}
                  type="text"
                  value={field.value.join(", ")}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean)
                    )
                  }
                />
                <span className="text-sm text-foreground/60">{CONTENT.productForm.tagsHelp}</span>
              </>
            )}
          />
        )}
      </FormField>
      <FormField label={CONTENT.fields.priceDollars} error={errors.priceDollars?.message}>
        {(id) => <Input id={id} type="number" step="0.01" min="0.01" {...register("priceDollars")} />}
      </FormField>
      <FormField label={CONTENT.fields.stockCount} error={errors.stockCount?.message}>
        {(id) => (
          <Input id={id} type="number" step="1" min="0" {...register("stockCount", { valueAsNumber: true })} />
        )}
      </FormField>
      <div className="flex items-center gap-2">
        <input id="isFeatured" type="checkbox" className="h-4 w-4" {...register("isFeatured")} />
        <label htmlFor="isFeatured" className="text-base">
          {CONTENT.fields.isFeatured}
        </label>
      </div>
      {formError ? (
        <p className="text-base text-accent-700" role="alert">
          {formError}
        </p>
      ) : null}
      <div className="flex gap-sm">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? CONTENT.productForm.submitting : CONTENT.productForm.submit}
        </Button>
        <Button variant="secondary" href={ROUTES.adminProducts}>
          {CONTENT.productForm.cancel}
        </Button>
      </div>
    </form>
  );
}
