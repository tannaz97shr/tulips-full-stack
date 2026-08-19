import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/modules/auth/api";

export function useRegister() {
  return useMutation({
    mutationFn: registerUser,
  });
}
