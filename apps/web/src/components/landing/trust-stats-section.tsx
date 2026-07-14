"use client";

export default function TrustStatsSection() {
  const stats = [
    { number: "2 000+", label: "Artisans vérifiés" },
    { number: "15 000+", label: "Projets terminés" },
    { number: "4.8 / 5", label: "Note moyenne" },
    { number: "98 %", label: "Clients satisfaits" },
  ];

  return (
    <section className="lp-stats" aria-label="Chiffres clés">
      <div className="lp-container">
        <div className="lp-stats-grid lp-reveal">
          {stats.map((s) => (
            <div key={s.label} className="lp-stats-item">
              <div className="lp-stats-number">{s.number}</div>
              <div className="lp-stats-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
