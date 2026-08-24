"use client";

import { CONTENT } from "@/modules/admin/content";
import {
  productFormSchema,
  type ProductFormInput,
  type ProductWriteInput,
} from "@/modules/admin/lib/schemas";
import {
  CATEGORIES,
  COLORS,
  OCCASIONS,
  SEASONS,
  SIZES,
} from "@/modules/catalog/constants";
import type { Product } from "@/modules/catalog/types";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { Select } from "@/shared/components/atoms/Select";
import { Textarea } from "@/shared/components/atoms/Textarea";
import { ChipMultiSelect } from "@/shared/components/molecules/ChipMultiSelect";
import { FormField } from "@/shared/components/molecules/FormField";
import { ROUTES } from "@/shared/routes";
import { logError } from "@/shared/lib/log-error";
import { dollarsToCents } from "@/shared/utils/dollarsToCents";
import { slugify } from "@/shared/utils/slugify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ProductComponentsField } from "./ProductComponentsField";
import { ProductImageGallery } from "./ProductImageGallery";

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
  /** Locked in edit mode — a product can't switch between standalone and composite after creation. */
  compositeLocked?: boolean;
  /** When set (edit mode only — a new product has no slug yet to attach images to), renders the image gallery panel for this product. */
  product?: Product;
  onSubmit: (payload: ProductWriteInput) => Promise<void>;
}

const EMPTY_DEFAULTS: ProductFormInput = {
  slug: "",
  name: "",
  description: "",
  sku: "",
  category: CATEGORIES[0],
  isComposite: false,
  components: [],
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

export function ProductForm({
  defaultValues,
  slugLocked = false,
  compositeLocked = false,
  product,
  onSubmit,
}: ProductFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(slugLocked);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const isComposite = watch("isComposite");

  useEffect(() => {
    if (isComposite) {
      setValue("category", "Bouquets");
      setValue("species", "");
    }
  }, [isComposite, setValue]);

  async function handleFormSubmit(values: ProductFormInput) {
    setFormError(null);
    const { priceDollars, components, ...rest } = values;
    const payload: ProductWriteInput = {
      ...rest,
      price: dollarsToCents(priceDollars),
      components: rest.isComposite ? components : undefined,
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      if (error instanceof ProductFormFieldError) {
        setError(error.field, { message: error.message });
        return;
      }
      logError(error, "ProductForm.handleFormSubmit");
      setFormError(CONTENT.productForm.genericError);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit, (formErrors) => {
        logError(formErrors, "ProductForm.handleFormSubmit:onInvalid", { level: "warn" });
        setFormError(CONTENT.productForm.validationError);
      })}
      className="flex flex-col gap-md"
      noValidate
    >
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
      <FormField label={CONTENT.fields.slug} error={errors.slug?.message}>
        {(id) => (
          <>
            <Input
              id={id}
              type="text"
              readOnly={slugLocked}
              className={
                slugLocked ? "cursor-not-allowed opacity-60" : undefined
              }
              {...register("slug", {
                onChange: () => setSlugTouched(true),
              })}
            />
            <span className="text-sm text-foreground/60">
              {slugLocked
                ? CONTENT.productForm.slugLockedHelp
                : CONTENT.productForm.slugHelp}
            </span>
          </>
        )}
      </FormField>
      {product ? <ProductImageGallery product={product} /> : null}
      <FormField
        label={CONTENT.fields.description}
        error={errors.description?.message}
      >
        {(id) => <Textarea id={id} {...register("description")} />}
      </FormField>
      <FormField label={CONTENT.fields.sku} error={errors.sku?.message}>
        {(id) => <Input id={id} type="text" {...register("sku")} />}
      </FormField>
      <FormField
        label={CONTENT.fields.category}
        error={errors.category?.message}
      >
        {(id) => (
          <Select
            id={id}
            options={CATEGORIES}
            placeholder="Select a category"
            disabled={isComposite}
            className={isComposite ? "cursor-not-allowed opacity-60" : undefined}
            {...register("category")}
          />
        )}
      </FormField>
      <div className="flex items-center gap-2">
        <input
          id="isComposite"
          type="checkbox"
          className="h-4 w-4"
          disabled={compositeLocked}
          {...register("isComposite")}
        />
        <label htmlFor="isComposite" className="text-base">
          {CONTENT.fields.isComposite}
        </label>
      </div>
      <span className="-mt-2 text-sm text-foreground/60">
        {compositeLocked ? CONTENT.productForm.compositeLockedHelp : CONTENT.productForm.compositeHelp}
      </span>
      <FormField label={CONTENT.fields.colors} error={errors.colors?.message}>
        {(id) => (
          <Controller
            control={control}
            name="colors"
            render={({ field }) => (
              <ChipMultiSelect
                id={id}
                options={COLORS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </FormField>
      <FormField
        label={CONTENT.fields.occasions}
        error={errors.occasions?.message}
      >
        {(id) => (
          <Controller
            control={control}
            name="occasions"
            render={({ field }) => (
              <ChipMultiSelect
                id={id}
                options={OCCASIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </FormField>
      {isComposite ? (
        <ProductComponentsField
          control={control}
          error={errors.components?.root?.message ?? errors.components?.message}
          excludeSlug={product?.slug}
          initialComponents={product?.components}
        />
      ) : (
        <FormField label={CONTENT.fields.species} error={errors.species?.message}>
          {(id) => <Input id={id} type="text" {...register("species")} />}
        </FormField>
      )}
      <FormField label={CONTENT.fields.size} error={errors.size?.message}>
        {(id) => (
          <Select
            id={id}
            options={SIZES}
            placeholder="Select a size"
            {...register("size")}
          />
        )}
      </FormField>
      <FormField label={CONTENT.fields.season} error={errors.season?.message}>
        {(id) => (
          <Select
            id={id}
            options={SEASONS}
            placeholder="Select a season"
            {...register("season")}
          />
        )}
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
                        .filter(Boolean),
                    )
                  }
                />
                <span className="text-sm text-foreground/60">
                  {CONTENT.productForm.tagsHelp}
                </span>
              </>
            )}
          />
        )}
      </FormField>
      <FormField
        label={CONTENT.fields.priceDollars}
        error={errors.priceDollars?.message}
      >
        {(id) => (
          <Input
            id={id}
            type="number"
            step="0.01"
            min="0.01"
            {...register("priceDollars")}
          />
        )}
      </FormField>
      <FormField
        label={CONTENT.fields.stockCount}
        error={errors.stockCount?.message}
      >
        {(id) => (
          <Input
            id={id}
            type="number"
            step="1"
            min="0"
            {...register("stockCount", { valueAsNumber: true })}
          />
        )}
      </FormField>
      <div className="flex items-center gap-2">
        <input
          id="isFeatured"
          type="checkbox"
          className="h-4 w-4"
          {...register("isFeatured")}
        />
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
          {isSubmitting
            ? CONTENT.productForm.submitting
            : CONTENT.productForm.submit}
        </Button>
        <Button variant="secondary" href={ROUTES.adminProducts}>
          {CONTENT.productForm.cancel}
        </Button>
      </div>
    </form>
  );
}
