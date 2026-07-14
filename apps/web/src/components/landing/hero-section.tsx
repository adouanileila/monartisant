"use client";

import { Search } from "lucide-react";

const TAGS = ["Plombier", "Électricien", "Peintre", "Menuisier", "Carreleur"];

export default function HeroSection() {
  return (
    <section className="lp-hero" aria-labelledby="hero-title">
      {/* Background image + dark overlay */}
      <div className="lp-hero-bg" aria-hidden="true">
        <img
          src="/images/hero-artisan.png"
          alt=""
          role="presentation"
        />
      </div>

      <div className="lp-container">
        <div className="lp-hero-content lp-reveal">
          <p className="lp-hero-eyebrow">
            <span aria-hidden="true" />
            +2 000 artisans vérifiés partout en France
          </p>

          <h1 id="hero-title" className="lp-hero-title">
            Trouvez le bon <em>artisan</em>,<br />plus vite.
          </h1>

          <p className="lp-hero-subtitle">
            Connectez-vous avec des artisans locaux qualifiés et vérifiés pour
            tous vos projets maison. Devis gratuit, avis authentiques.
          </p>

          {/* Search bar — Fiverr style */}
          <div className="lp-hero-search" role="search">
            <input
              id="hero-search-input"
              className="lp-hero-search-input"
              type="text"
              placeholder="Quel service recherchez-vous ?"
              aria-label="Rechercher un service"
            />
            <div className="lp-hero-search-divider" aria-hidden="true" />
            <select
              className="lp-hero-search-select"
              aria-label="Ville ou région"
            >
              <option value="">Partout en France</option>
              <option value="paris">Paris</option>
              <option value="lyon">Lyon</option>
              <option value="marseille">Marseille</option>
              <option value="bordeaux">Bordeaux</option>
              <option value="toulouse">Toulouse</option>
            </select>
            <button className="lp-hero-search-btn" type="button">
              <Search size={18} aria-hidden="true" />
              Rechercher
            </button>
          </div>

          {/* Popular tags */}
          <div className="lp-hero-tags">
            <span className="lp-hero-tags-label">Populaire :</span>
            {TAGS.map((tag) => (
              <button key={tag} className="lp-hero-tag" type="button">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
