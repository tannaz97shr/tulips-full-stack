import { apiClient } from "@/shared/lib/api-client";
import { API_ROUTES } from "@/shared/lib/api-routes";
import type { CheckoutFormInput } from "@/modules/checkout/lib/schemas";
import type { CreateCheckoutSessionResponse } from "@/modules/checkout/types";

export async function createCheckoutSession(input: CheckoutFormInput): Promise<CreateCheckoutSessionResponse> {
  const { data } = await apiClient.post<CreateCheckoutSessionResponse>(API_ROUTES.checkout.session, input);
  return data;
}
