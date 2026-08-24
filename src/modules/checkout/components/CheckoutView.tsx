"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { useState } from "react";
import { Button } from "@/shared/components/atoms/Button";
import { Input } from "@/shared/components/atoms/Input";
import { FormField } from "@/shared/components/molecules/FormField";
import { ROUTES } from "@/shared/routes";
import { formatPrice } from "@/shared/utils/formatPrice";
import { logError } from "@/shared/lib/log-error";
import { CONTENT } from "@/modules/checkout/content";
import { checkoutSchema, type CheckoutFormInput } from "@/modules/checkout/lib/schemas";
import { calculateTax } from "@/modules/checkout/lib/pricing";
import { useCreateCheckoutSession } from "@/modules/checkout/hooks/useCreateCheckoutSession";
import { useCart } from "@/modules/cart/hooks/useCart";

type CheckoutDetailsInput = Omit<CheckoutFormInput, "items">;

const detailsSchema = checkoutSchema.omit({ items: true });

export function CheckoutView() {
  const { items, subtotal } = useCart();
  const [formError, setFormError] = useState<string | null>(null);
  const createSession = useCreateCheckoutSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutDetailsInput>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      recipientName: "",
      deliveryAddress: { line1: "", line2: "", suburb: "", state: "", postcode: "", country: "AU" },
      deliveryDate: "",
    },
  });

  const tax = calculateTax(subtotal);
  const total = subtotal + tax;

  async function onSubmit(values: CheckoutDetailsInput) {
    setFormError(null);
    try {
      const { url } = await createSession.mutateAsync({
        ...values,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      window.location.assign(url);
    } catch (error) {
      logError(error, "CheckoutView.onSubmit");
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError(CONTENT.checkoutView.outOfStockError);
        return;
      }
      setFormError(CONTENT.checkoutView.genericError);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-md px-lg py-2xl text-center">
        <p className="text-lg text-foreground/70">{CONTENT.checkoutView.emptyCart}</p>
        <Button href={ROUTES.products.list}>{CONTENT.checkoutView.backToShop}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-lg py-lg">
      <h1 className="mb-lg text-2xl">{CONTENT.checkoutView.heading}</h1>
      <div className="grid grid-cols-1 gap-xl md:grid-cols-[1fr_20rem]">
        <form
          onSubmit={handleSubmit(onSubmit, () => setFormError(CONTENT.checkoutView.validationError))}
          className="flex flex-col gap-md"
          noValidate
        >
          <FormField label={CONTENT.fields.recipientName} error={errors.recipientName?.message}>
            {(id) => <Input id={id} type="text" {...register("recipientName")} />}
          </FormField>
          <FormField label={CONTENT.fields.line1} error={errors.deliveryAddress?.line1?.message}>
            {(id) => <Input id={id} type="text" {...register("deliveryAddress.line1")} />}
          </FormField>
          <FormField label={CONTENT.fields.line2} error={errors.deliveryAddress?.line2?.message}>
            {(id) => <Input id={id} type="text" {...register("deliveryAddress.line2")} />}
          </FormField>
          <div className="grid grid-cols-2 gap-md">
            <FormField label={CONTENT.fields.suburb} error={errors.deliveryAddress?.suburb?.message}>
              {(id) => <Input id={id} type="text" {...register("deliveryAddress.suburb")} />}
            </FormField>
            <FormField label={CONTENT.fields.state} error={errors.deliveryAddress?.state?.message}>
              {(id) => <Input id={id} type="text" {...register("deliveryAddress.state")} />}
            </FormField>
          </div>
          <FormField label={CONTENT.fields.postcode} error={errors.deliveryAddress?.postcode?.message}>
            {(id) => <Input id={id} type="text" inputMode="numeric" {...register("deliveryAddress.postcode")} />}
          </FormField>
          <FormField label={CONTENT.fields.deliveryDate} error={errors.deliveryDate?.message}>
            {(id) => <Input id={id} type="date" {...register("deliveryDate")} />}
          </FormField>
          {formError ? (
            <p className="text-base text-accent-700" role="alert">
              {formError}
            </p>
          ) : null}
          <Button type="submit" variant="primary" disabled={isSubmitting} block>
            {isSubmitting ? CONTENT.checkoutView.submitting : CONTENT.checkoutView.submit}
          </Button>
        </form>
        <div className="flex h-fit flex-col gap-sm rounded-lg border border-divider p-lg">
          <h2 className="mb-sm text-lg">{CONTENT.checkoutView.summaryHeading}</h2>
          <div className="flex justify-between text-base">
            <span className="text-foreground/70">{CONTENT.checkoutView.subtotal}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-foreground/70">{CONTENT.checkoutView.tax}</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-foreground/70">{CONTENT.checkoutView.shipping}</span>
            <span>{CONTENT.checkoutView.free}</span>
          </div>
          <div className="mt-sm flex justify-between border-t border-divider pt-sm font-heading text-xl">
            <span>{CONTENT.checkoutView.total}</span>
            <span className="text-accent-700">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
