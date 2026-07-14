"use client";

import {
  Wrench, Zap, Hammer, Paintbrush,
  Building2, TreePine, LayoutGrid, Lock,
} from "lucide-react";

const CATEGORIES = [
  { icon: Wrench,     name: "Plomberie",    count: "340+ artisans" },
  { icon: Zap,        name: "Électricité",  count: "280+ artisans" },
  { icon: Hammer,     name: "Menuiserie",   count: "195+ artisans" },
  { icon: Paintbrush, name: "Peinture",     count: "250+ artisans" },
  { icon: Building2,  name: "Maçonnerie",   count: "160+ artisans" },
  { icon: TreePine,   name: "Jardinage",    count: "210+ artisans" },
  { icon: LayoutGrid, name: "Carrelage",    count: "145+ artisans" },
  { icon: Lock,       name: "Serrurerie",   count: "120+ artisans" },
];

function CatCard({ cat }: { cat: typeof CATEGORIES[0] }) {
  const Icon = cat.icon;
  return (
    <a href="#" className="lp-cat-card" aria-label={`Voir les artisans : ${cat.name}`}>
      <div className="lp-cat-icon">
        <Icon aria-hidden="true" />
      </div>
      <div className="lp-cat-info">
        <div className="lp-cat-name">{cat.name}</div>
        <div className="lp-cat-count">{cat.count}</div>
      </div>
    </a>
  );
}

export default function CategoriesSection() {
  return (
    <section id="categories" className="lp-section">
      <div className="lp-container">
        <div className="lp-section-head lp-reveal">
          <div className="lp-section-tag">🏠 Services</div>
          <h2 className="lp-section-title">Catégories populaires</h2>
          <p className="lp-section-subtitle">
            Des professionnels qualifiés pour chaque besoin de votre maison.
          </p>
        </div>

        {/* Desktop grid */}
        <div className="lp-categories-grid lp-reveal" role="list">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} role="listitem">
              <CatCard cat={cat} />
            </div>
          ))}
        </div>

        {/* Mobile horizontal scroll */}
        <div className="lp-categories-scroll" role="list">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} role="listitem">
              <CatCard cat={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
