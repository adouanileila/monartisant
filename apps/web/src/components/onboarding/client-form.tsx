"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import OnboardingNavbar from "./onboarding-navbar";

export default function ClientForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const { data: session } = authClient.useSession();
  
  const onboardClient = useMutation({
    ...orpc.onboardClient.mutationOptions(),
    onSuccess: () => {
      toast.success("Profil mis à jour !");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast.error("Une erreur est survenue.");
      console.error(err);
    }
  });

  useEffect(() => {
    if (session?.user?.telephone) {
      setPhone(session.user.telephone);
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onboardClient.mutate({ phone });
  };

  return (
    <>
      <OnboardingNavbar currentStep={1} totalSteps={1} />
      <div className="ob-card-wrapper ob-animate-enter">
        <div className="ob-form-container">
        <div className="ob-form-header">
          <h2 className="ob-form-title">Complète ton profil</h2>
          <p className="ob-form-subtitle">Dernière étape avant de trouver le bon artisan.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ob-form-group">
            <label htmlFor="phone" className="ob-label">Numéro de téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="ob-input"
              placeholder="+33 6 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="ob-btn" disabled={onboardClient.isPending}>
            {onboardClient.isPending ? "Enregistrement..." : (
              <>Terminer <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
