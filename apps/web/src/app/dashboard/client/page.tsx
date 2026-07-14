import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { authClient } from "@/lib/auth-client";

import ClientDashboard from "./client-dashboard";

export default async function ClientDashboardPage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "client") {
    redirect("/dashboard");
  }

  return <ClientDashboard session={session} />;
}