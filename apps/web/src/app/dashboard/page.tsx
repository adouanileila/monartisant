import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "artisan") {
    redirect("/dashboard/artisan");
  } else if (role === "admin") {
    redirect("/dashboard/admin");
  } else if (role === "client") {
    redirect("/dashboard/client");
  } else {
    redirect("/onboarding");
  }
}
