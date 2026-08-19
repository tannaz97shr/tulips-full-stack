import { redirect } from "next/navigation";
import { ROUTES } from "@/shared/routes";

export default function AdminPage() {
  redirect(ROUTES.adminProducts);
}
