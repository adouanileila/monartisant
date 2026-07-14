"use client";

import { MapPin } from "lucide-react";

interface Artisan {
  name: string;
  initials: string;
  level: string;
  title: string;
  rating: number;
  reviews: number;
  city: string;
  photo?: string;
  available: boolean;
}

const ARTISANS: Artisan[] = [
  {
    name: "Sarah Martin",
    initials: "SM",
    level: "Top Artisan",
    title: "Installation électrique, tableaux, prises & éclairage",
    rating: 4.9,
    reviews: 127,
    city: "Paris",
    photo: "/images/artisans/sarah-electrician.png",
    available: true,
  },
  {
    name: "Karim Benali",
    initials: "KB",
    level: "Artisan Certifié",
    title: "Plomberie, sanitaires, chauffage & dépannage urgence",
    rating: 4.8,
    reviews: 98,
    city: "Lyon",
    photo: "/images/artisans/karim-plumber.png",
    available: true,
  },
  {
    name: "Amina Diallo",
    initials: "AD",
    level: "Top Artisan",
    title: "Peinture intérieure & extérieure, ravalement de façade",
    rating: 4.9,
    reviews: 156,
    city: "Marseille",
    photo: "/images/artisans/amina-painter.png",
    available: false,
  },
  {
    name: "Marc Dubois",
    initials: "MD",
    level: "Artisan Certifié",
    title: "Menuiserie sur mesure, escaliers, parquet & agencement",
    rating: 4.7,
    reviews: 83,
    city: "Bordeaux",
    photo: "/images/artisans/marc-carpenter.png",
    available: true,
  },
  {
    name: "Pierre Lambert",
    initials: "PL",
    level: "Artisan Pro",
    title: "Maçonnerie, rénovation, extension et gros œuvre",
    rating: 4.8,
    reviews: 112,
    city: "Toulouse",
    available: true,
  },
  {
    name: "Nadia Rousseau",
    initials: "NR",
    level: "Artisan Certifié",
    title: "Jardinage, entretien espaces verts & création paysagère",
    rating: 4.9,
    reviews: 74,
    city: "Nantes",
    available: true,
  },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="lp-artisan-star">
          {i < full ? "★" : "☆"}
        </span>
      ))}
    </>
  );
}

function ArtisanCard({ artisan }: { artisan: Artisan }) {
  return (
    <article className="lp-artisan-card">
      {/* Photo */}
      <div className="lp-artisan-photo-wrap">
        {artisan.photo ? (
          <img src={artisan.photo} alt={`Photo de ${artisan.name}`} />
        ) : (
          <div className="lp-artisan-avatar">{artisan.initials}</div>
        )}
        {artisan.available && (
          <div className="lp-artisan-badge">
            <span className="lp-artisan-badge-dot" aria-hidden="true" />
            Disponible
          </div>
        )}
      </div>

      {/* Body */}
      <div className="lp-artisan-body">
        <div className="lp-artisan-seller">
          <div className="lp-artisan-avatar-sm">
            {artisan.photo ? (
              <img src={artisan.photo} alt="" aria-hidden="true" />
            ) : (
              artisan.initials
            )}
          </div>
          <div className="lp-artisan-seller-info">
            <div className="lp-artisan-name">{artisan.name}</div>
            <div className="lp-artisan-level">{artisan.level}</div>
          </div>
        </div>

        <p className="lp-artisan-title">{artisan.title}</p>

        <div className="lp-artisan-footer">
          <div className="lp-artisan-rating">
            <div className="lp-artisan-rating">
              <Stars rating={artisan.rating} />
            </div>
            <span className="lp-artisan-score">{artisan.rating}</span>
            <span className="lp-artisan-reviews">({artisan.reviews})</span>
          </div>
          <span className="lp-artisan-city">
            <MapPin size={12} aria-hidden="true" />
            {artisan.city}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedArtisansSection() {
  return (
    <section id="artisans" className="lp-section lp-section-alt">
      <div className="lp-container">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">⭐ Top Artisans</div>
          <h2 className="lp-section-title">Artisans à la une</h2>
          <p className="lp-section-subtitle">
            Découvrez nos artisans les mieux notés par la communauté.
          </p>
        </div>

        {/* Desktop grid */}
        <div className="lp-artisans-grid lp-reveal">
          {ARTISANS.map((a) => (
            <ArtisanCard key={a.name} artisan={a} />
          ))}
        </div>

        {/* Mobile scroll */}
        <div className="lp-artisans-scroll lp-reveal">
          {ARTISANS.map((a) => (
            <ArtisanCard key={`m-${a.name}`} artisan={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
