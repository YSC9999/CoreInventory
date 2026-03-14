import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth.actions";

export default async function HomePage() {
  const user = await getCurrentUser();
  
  if (user) {
    redirect("/inventory");
  } else {
    redirect("/login");
  }
}
