"use client";

const PLATFORM_LINKS = [
  "Comment ça marche",
  "Catégories",
  "Artisans vérifiés",
  "Tarifs",
  "Blog",
];

const SUPPORT_LINKS = [
  "Centre d'aide",
  "Contactez-nous",
  "FAQ",
  "Signaler un problème",
  "Conditions de paiement",
];

const LEGAL_LINKS = [
  "Conditions d'utilisation",
  "Politique de confidentialité",
  "Mentions légales",
];

export default function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-container">
        <div className="lp-footer-grid">
          {/* Brand */}
          <div className="lp-footer-brand">
            <a href="/" className="lp-footer-logo" aria-label="Mon Artisan">
              <img src="/images/logo.png" alt="Logo Mon Artisan" style={{ height: "42px", objectFit: "contain", borderRadius: "8px", background: "white" }} />
              <span className="lp-footer-logo-name">Mon Artisan</span>
            </a>
            <p className="lp-footer-desc">
              La plateforme de confiance pour connecter particuliers et artisans
              qualifiés partout en France. Simple, rapide et sécurisé.
            </p>
            <div className="lp-footer-socials" aria-label="Réseaux sociaux">
              {["f", "𝕏", "ig", "in"].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="lp-footer-social-btn"
                  aria-label={icon}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Plateforme */}
          <nav aria-label="Liens plateforme">
            <p className="lp-footer-col-label">Plateforme</p>
            <div className="lp-footer-links">
              {PLATFORM_LINKS.map((l) => (
                <a key={l} href="#" className="lp-footer-link">
                  {l}
                </a>
              ))}
            </div>
          </nav>

          {/* Support */}
          <nav aria-label="Liens support">
            <p className="lp-footer-col-label">Support</p>
            <div className="lp-footer-links">
              {SUPPORT_LINKS.map((l) => (
                <a key={l} href="#" className="lp-footer-link">
                  {l}
                </a>
              ))}
            </div>
          </nav>

          {/* Newsletter */}
          <div>
            <p className="lp-footer-col-label">Newsletter</p>
            <p className="lp-footer-desc" style={{ marginBottom: "4px" }}>
              Recevez nos dernières actualités et offres exclusives.
            </p>
            <form
              className="lp-newsletter-input-wrap"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Inscription newsletter"
            >
              <input
                type="email"
                className="lp-newsletter-input"
                placeholder="Votre adresse email"
                aria-label="Adresse email pour la newsletter"
                required
              />
              <button type="submit" className="lp-newsletter-btn">
                S&apos;inscrire
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="lp-footer-bottom">
          <p className="lp-footer-copy">
            © {new Date().getFullYear()} Mon Artisan. Tous droits réservés.
          </p>
          <nav className="lp-footer-legal" aria-label="Liens légaux">
            {LEGAL_LINKS.map((l) => (
              <a key={l} href="#" className="lp-footer-link">
                {l}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
