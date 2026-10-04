"use client";

import { useEffect, useState } from "react";
import { X, Mail } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

const PERKS = [
  "Plus de 20 catégories de services",
  "Artisans vérifiés et certifiés",
  "Devis gratuit et sans engagement",
  "Paiement sécurisé garanti",
];

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/onboarding`,
    });
  };

  const handleFacebookSignIn = async () => {
    await authClient.signIn.social({
      provider: "facebook",
      callbackURL: `${window.location.origin}/onboarding`,
    });
  };

  const handleEmailSignIn = async () => {
    setError("");
    setIsSubmitting(true);

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          // onboarding page guard will redirect to /dashboard if role already set
          window.location.href = "/onboarding";
        },
        onError: (ctx: any) => {
          setError(ctx.error.message || "Email ou mot de passe incorrect.");
          setIsSubmitting(false);
        },
      },
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="sm-overlay" role="dialog" aria-modal="true" aria-label="Se connecter">
      <div className="sm-backdrop" onClick={onClose} />

      <div className="sm-modal">
        {/* Close */}
        <button className="sm-close" onClick={onClose} aria-label="Fermer">
          <X size={20} />
        </button>

        {/* LEFT */}
        <div className="sm-left">
          <div className="sm-left-content">
            <h2 className="sm-left-title">
              Le succès
              <br />
              commence ici
            </h2>
            <ul className="sm-perks">
              {PERKS.map((p) => (
                <li key={p} className="sm-perk">
                  <span className="sm-perk-check">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <img src="/images/signup-hero.png" alt="Artisane au travail" className="sm-left-img" />
        </div>

        {/* RIGHT */}
        <div className="sm-right">
          <h3 className="sm-title">Se connecter à votre compte</h3>
          <p className="sm-subtitle">
            Pas encore de compte ?{" "}
            <button className="sm-switch-btn" onClick={onSwitchToSignup}>
              Rejoindre ici
            </button>
          </p>

          {!showEmailForm ? (
            <>
              {/* Google — full width */}
              <div className="sm-login-main">
                <button className="sm-provider-btn" onClick={handleGoogleSignIn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuer avec Google
                </button>

                {/* Email — full width */}
                <button className="sm-provider-btn" onClick={() => setShowEmailForm(true)}>
                  <Mail size={20} aria-hidden="true" />
                  Continuer avec email
                </button>
              </div>

              {/* OR divider */}
              <div className="sm-divider">
                <span>OU</span>
              </div>

              {/* Facebook only */}
              <div className="sm-login-social">
                <button className="sm-provider-btn" onClick={handleFacebookSignIn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#1877F2"
                      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                    />
                  </svg>
                  Continuer avec Facebook
                </button>
              </div>
            </>
          ) : (
            <form
              className="sm-email-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleEmailSignIn();
              }}
            >
              <div className="sm-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="sm-field">
                <label htmlFor="login-password">Mot de passe</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="sm-error">{error}</p>}

              <button type="submit" className="sm-email-btn" disabled={isSubmitting}>
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>

              <button type="button" className="sm-switch-btn" onClick={() => setShowEmailForm(false)}>
                ← Retour
              </button>
            </form>
          )}

          <p className="sm-legal" style={{ marginTop: "auto" }}>
            En vous connectant, vous acceptez les{" "}
            <a href="#" className="sm-legal-link">
              Conditions d&apos;utilisation
            </a>{" "}
            et la{" "}
            <a href="#" className="sm-legal-link">
              Politique de confidentialité
            </a>{" "}
            de Mon Artisan.
          </p>
        </div>
      </div>
    </div>
  );
}