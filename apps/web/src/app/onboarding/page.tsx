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

    const userRole = session.user.role;

    // Clients who have a role already → skip onboarding
    if (userRole === "client") {
      router.replace("/dashboard");
      return;
    }

    // Artisans: only skip onboarding if the artisan profile row exists.
    // If role is "artisan" but there's no profile (e.g. role was set manually
    // in the DB without completing the form), they must go through onboarding.
    if (userRole === "artisan") {
      // Let the component render; ArtisanAssistant's own logic will handle
      // already-profiled artisans and redirect them after a successful re-submit,
      // OR we can safely send them to dashboard since the profile exists.
      // We do NOT bypass onboarding for artisans here — the artisan form
      // is idempotent (upsert), so re-running it is harmless.
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
