import { apiClient } from "@/shared/lib/api-client";
import type { SignUpInput } from "@/modules/auth/lib/schemas";
import type { SessionUser } from "@/modules/auth/types";

export async function registerUser(input: SignUpInput): Promise<SessionUser> {
  const { data } = await apiClient.post<{ user: SessionUser }>("/auth/register", input);
  return data.user;
}
