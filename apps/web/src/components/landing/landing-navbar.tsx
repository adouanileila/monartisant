"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Menu, X } from "lucide-react";
import SignupModal from "./signup-modal";
import LoginModal from "./login-modal";
import { useSearchParams } from "next/navigation";

const NAV_LINKS = [
  { label: "Comment ça marche", href: "#how-it-works" },
  { label: "Catégories", href: "#categories" },
  { label: "Artisans", href: "#artisans" },
  { label: "Témoignages", href: "#testimonials" },
];

function LandingNavbarContent() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const auth = searchParams.get("auth");
    if (auth === "signup") setSignupOpen(true);
    if (auth === "login") setLoginOpen(true);
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const scrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      setDrawerOpen(false);
    },
    []
  );

  const navClass = `lp-nav lp-nav--scrolled${scrolled ? " is-scrolled" : ""}`;

  return (
    <>
      <nav className={navClass} role="navigation" aria-label="Navigation principale">
        <div className="lp-nav-container">
          <div className="lp-nav-inner">
            {/* Logo */}
            <a href="/" className="lp-nav-logo" aria-label="Mon Artisan - Accueil">
              <img src="/images/logo.png" alt="Logo Mon Artisan" style={{ height: "42px", objectFit: "contain", borderRadius: "8px", background: "white" }} />
              <span className="lp-nav-logo-name">Mon Artisan</span>
            </a>

            {/* Desktop links */}
            <ul className="lp-nav-links" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="lp-nav-link"
                    onClick={(e) => scrollTo(e, link.href)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="lp-nav-actions">
              <button className="lp-nav-btn-ghost" onClick={() => setLoginOpen(true)}>Connexion</button>
              <button className="lp-nav-btn-primary" onClick={() => setSignupOpen(true)}>Inscription</button>
              {/* Mobile toggle */}
              <button
                className="lp-nav-toggle"
                onClick={() => setDrawerOpen(true)}
                aria-label="Ouvrir le menu"
                aria-expanded={drawerOpen}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`lp-nav-drawer${drawerOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu mobile"
      >
        <button
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            width: 40,
            height: 40,
            borderRadius: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gray-700)",
          }}
          onClick={() => setDrawerOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={22} />
        </button>

        <ul role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="lp-nav-drawer-link"
                onClick={(e) => scrollTo(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="lp-nav-drawer-actions">
          <button
            className="lp-nav-btn-ghost"
            style={{ borderColor: "var(--gray-200)", color: "var(--gray-800)" }}
            onClick={() => setDrawerOpen(false)}
          >
            Connexion
          </button>
          <button
            className="lp-nav-btn-primary"
            onClick={() => setDrawerOpen(false)}
          >
            Inscription gratuite
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 898,
          }}
          aria-hidden="true"
        />
      )}

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }}
      />
    </>
  );
}

export default function LandingNavbar() {
  return (
    <Suspense fallback={null}>
      <LandingNavbarContent />
    </Suspense>
  );
}
