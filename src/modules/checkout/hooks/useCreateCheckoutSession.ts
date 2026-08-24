import { useMutation } from "@tanstack/react-query";
import { createCheckoutSession } from "@/modules/checkout/api";

export function useCreateCheckoutSession() {
  return useMutation({ mutationFn: createCheckoutSession });
}
