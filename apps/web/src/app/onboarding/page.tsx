"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RoleSelection from "@/components/onboarding/role-selection";
import ClientForm from "@/components/onboarding/client-form";
import ArtisanAssistant from "@/components/onboarding/artisan-assistant";
import { authClient } from "@/lib/auth-client";
import "./onboarding.css";

export default function OnboardingPage() {
  const [role, setRole] = useState<"client" | "artisan" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    // Not logged in → back to landing
    if (!session?.user) {
      router.replace("/");
      return;
    }

    // Already has a role → skip onboarding, go to dashboard
    const userRole = session.user.role;
    if (userRole === "client" || userRole === "artisan") {
      router.replace("/dashboard");
      return;
    }

    setIsLoading(false);
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <main className="ob-container">
        <div style={{ textAlign: "center", color: "#6b7280" }}>Chargement...</div>
      </main>
    );
  }

  return (
    <main className="ob-container">
      {role === null && (
        <RoleSelection onSelectRole={setRole} />
      )}

      {role === "client" && (
        <ClientForm />
      )}

      {role === "artisan" && (
        <ArtisanAssistant />
      )}
    </main>
  );
}
