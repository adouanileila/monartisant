"use client";

import { Search, Users, CalendarCheck } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Décrivez votre projet",
    desc: "Indiquez le type de travaux, votre localisation et vos disponibilités. C'est gratuit et sans engagement.",
  },
  {
    num: "02",
    icon: Users,
    title: "Comparez les artisans",
    desc: "Recevez des devis personnalisés, consultez les profils vérifiés et les avis clients authentiques.",
  },
  {
    num: "03",
    icon: CalendarCheck,
    title: "Réservez en confiance",
    desc: "Choisissez votre artisan, planifiez l'intervention et suivez l'avancement en temps réel.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="lp-section lp-section-alt">
      <div className="lp-container">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">🔧 Simple et rapide</div>
          <h2 className="lp-section-title">Comment ça marche ?</h2>
          <p className="lp-section-subtitle">
            En trois étapes simples, trouvez l&apos;artisan idéal pour votre projet.
          </p>
        </div>

        <div className="lp-steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`lp-step lp-reveal lp-reveal-d${i + 1}`}
              >
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-icon-wrap">
                  <Icon size={26} aria-hidden="true" />
                </div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
