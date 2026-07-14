"use client";

import { useState } from "react";
import { Search, Wrench, ArrowRight, Check } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import OnboardingNavbar from "./onboarding-navbar";

interface RoleSelectionProps {
  onSelectRole: (role: "client" | "artisan") => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [selected, setSelected] = useState<"client" | "artisan" | null>(null);
  const { data: session } = authClient.useSession();

  const firstName = session?.user?.name?.split(" ")[0] || "";

  const handleContinue = () => {
    if (!selected) return;
    onSelectRole(selected);
  };

  return (
    <>
      <OnboardingNavbar currentStep={0} totalSteps={0} showFinishLater={false} />
      <div className="ob-card-wrapper ob-animate-enter">
        <p className="ob-greeting" style={{ marginBottom: "32px", fontSize: "24px", fontWeight: "700", color: "var(--gray-900, #111827)" }}>
        {firstName ? `Bienvenue ${firstName} 👋` : "Bienvenue 👋"}
      </p>

      <div className="ob-roles-grid" style={{ marginTop: 0 }}>
        {/* Client Card */}
        <div
          className={`ob-role-card ob-role-card--client ${selected === "client" ? "selected" : ""}`}
          onClick={() => setSelected("client")}
          role="button"
          tabIndex={0}
          style={{ padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", borderRadius: "32px" }}
        >
          <div className="ob-role-check">
            {selected === "client" && <Check size={18} strokeWidth={3} />}
          </div>
          <div className="ob-role-icon-wrapper" style={{ marginBottom: "24px", width: "80px", height: "80px" }}>
            <Search size={40} className="ob-icon-anim" />
          </div>
          <h2 className="ob-role-label" style={{ margin: 0, fontSize: "28px", textAlign: "center", fontWeight: "800" }}>Client</h2>
          <p style={{ marginTop: "12px", color: "var(--gray-500)", fontSize: "16px", textAlign: "center" }}>Je cherche un artisan</p>
        </div>

        {/* Artisan Card */}
        <div
          className={`ob-role-card ob-role-card--artisan ${selected === "artisan" ? "selected" : ""}`}
          onClick={() => setSelected("artisan")}
          role="button"
          tabIndex={0}
          style={{ padding: "48px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "280px", borderRadius: "32px" }}
        >
          <div className="ob-role-check">
            {selected === "artisan" && <Check size={18} strokeWidth={3} />}
          </div>
          <div className="ob-role-icon-wrapper" style={{ marginBottom: "24px", width: "80px", height: "80px" }}>
            <Wrench size={40} className="ob-icon-anim" />
          </div>
          <h2 className="ob-role-label" style={{ margin: 0, fontSize: "28px", textAlign: "center", fontWeight: "800" }}>Artisan</h2>
          <p style={{ marginTop: "12px", color: "var(--gray-500)", fontSize: "16px", textAlign: "center" }}>Je propose mes services</p>
        </div>
      </div>

      <button
        className="ob-continue-btn"
        disabled={!selected}
        onClick={handleContinue}
        style={{ marginTop: "32px" }}
      >
        Continuer <ArrowRight size={18} />
      </button>
    </div>
    </>
  );
}