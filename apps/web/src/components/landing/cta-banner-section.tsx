"use client";

import { Search, ArrowRight } from "lucide-react";

export default function CtaBannerSection() {
  return (
    <section className="lp-cta" aria-labelledby="cta-title">
      <div className="lp-container">
        <div className="lp-cta-grid">
          {/* Card Client */}
          <div className="lp-cta-card lp-cta-card-client lp-reveal">
            <p className="lp-cta-eyebrow">Pour les particuliers</p>
            <h2 id="cta-title" className="lp-cta-title">
              Trouvez l&apos;artisan<br />qu&apos;il vous faut
            </h2>
            <p className="lp-cta-desc">
              Comparez des devis gratuits, lisez les avis vérifiés et choisissez
              en toute confiance le professionnel qui convient à votre projet.
            </p>
            <button className="lp-cta-btn" type="button">
              <Search size={18} aria-hidden="true" />
              Trouver un Artisan
            </button>
          </div>

          {/* Card Artisan */}
          <div className="lp-cta-card lp-cta-card-artisan lp-reveal lp-reveal-d2">
            <p className="lp-cta-eyebrow">Pour les professionnels</p>
            <h2 className="lp-cta-title">
              Développez votre<br />activité
            </h2>
            <p className="lp-cta-desc">
              Rejoignez notre réseau de +2 000 artisans certifiés. Accédez à de
              nouveaux clients locaux et gérez votre planning facilement.
            </p>
            <button className="lp-cta-btn" type="button">
              Rejoindre Mon Artisan
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
