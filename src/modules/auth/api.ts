import { apiClient } from "@/shared/lib/api-client";
import { API_ROUTES } from "@/shared/lib/api-routes";
import type { SignUpInput } from "@/modules/auth/lib/schemas";
import type { SessionUser } from "@/modules/auth/types";

export async function registerUser(input: SignUpInput): Promise<SessionUser> {
  const { data } = await apiClient.post<{ user: SessionUser }>(API_ROUTES.auth.register, input);
  return data.user;
}
