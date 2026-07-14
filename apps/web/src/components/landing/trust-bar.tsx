"use client";

export default function TrustBar() {
  const brands = [
    "Leroy Merlin",
    "Saint-Gobain",
    "MAAF",
    "AXA",
    "Décathlon Pro",
    "Brico Dépôt",
  ];

  return (
    <div className="lp-trust-bar">
      <div className="lp-container">
        <div className="lp-trust-bar-inner">
          <span className="lp-trust-bar-label">PARTENAIRES DE CONFIANCE</span>
          <div className="lp-trust-bar-logos">
            {brands.map((b) => (
              <span key={b} className="lp-trust-bar-logo">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
