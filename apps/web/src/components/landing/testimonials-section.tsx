"use client";

import { useRef, useState, useCallback } from "react";

const REVIEWS = [
  {
    stars: 5,
    text: "Sarah a fait un travail exceptionnel sur notre installation électrique. Professionnelle, ponctuelle et très compétente. Je recommande vivement !",
    name: "Marie Lefevre",
    location: "Propriétaire à Paris",
    initials: "ML",
  },
  {
    stars: 5,
    text: "Karim est intervenu rapidement pour une fuite urgente. Travail propre et prix très raisonnable. Un vrai professionnel !",
    name: "Thomas Bernard",
    location: "Locataire à Lyon",
    initials: "TB",
  },
  {
    stars: 5,
    text: "Amina a transformé notre salon avec un travail de peinture impeccable. Elle a su nous conseiller sur les couleurs et le résultat est magnifique.",
    name: "Sophie Moreau",
    location: "Propriétaire à Marseille",
    initials: "SM",
  },
  {
    stars: 4,
    text: "Marc a réalisé nos meubles sur mesure avec un savoir-faire remarquable. Le résultat dépasse nos attentes. Merci !",
    name: "Lucas Petit",
    location: "Propriétaire à Bordeaux",
    initials: "LP",
  },
  {
    stars: 5,
    text: "Service impeccable du début à la fin. La plateforme est intuitive et les artisans sont vraiment de confiance.",
    name: "Camille Durand",
    location: "Propriétaire à Lille",
    initials: "CD",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    if (!scrollRef.current) return;
    const card = scrollRef.current.children[idx] as HTMLElement;
    if (card) {
      scrollRef.current.scrollTo({
        left: card.offsetLeft - scrollRef.current.offsetLeft,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <section id="testimonials" className="lp-section" aria-labelledby="testimonials-title">
      <div className="lp-container">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">💬 Témoignages</div>
          <h2 id="testimonials-title" className="lp-section-title">
            Ce que disent nos clients
          </h2>
          <p className="lp-section-subtitle">
            Des milliers de clients satisfaits partagent leur expérience.
          </p>
        </div>

        <div className="lp-reviews-scroll lp-reveal" ref={scrollRef}>
          {REVIEWS.map((r, i) => (
            <article key={i} className="lp-review-card">
              <div className="lp-review-stars" aria-label={`${r.stars} étoiles sur 5`}>
                {Array.from({ length: r.stars }, (_, j) => (
                  <span key={j} aria-hidden="true">★</span>
                ))}
              </div>
              <p className="lp-review-text">&ldquo;{r.text}&rdquo;</p>
              <div className="lp-review-author">
                <div className="lp-review-avatar" aria-hidden="true">
                  {r.initials}
                </div>
                <div>
                  <div className="lp-review-name">{r.name}</div>
                  <div className="lp-review-location">{r.location}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Dots */}
        <div className="lp-dots" role="tablist" aria-label="Navigation des témoignages">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              className={`lp-dot${active === i ? " is-active" : ""}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={active === i}
              aria-label={`Témoignage ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
