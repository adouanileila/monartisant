"use client";

import { authClient } from "@/lib/auth-client";
import { FileText, Heart, MessageCircle, Plus } from "lucide-react";
import "../dashboard.css";

export default function ClientDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const firstName = session.user.name?.split(" ")[0] || "";

  return (
    <div className="db-container">
      <h1 className="db-greeting">Bonjour {firstName} 👋</h1>

      <div className="db-stats-grid">
        <div className="db-stat-card">
          <FileText className="db-stat-icon" size={22} />
          <div className="db-stat-value">0</div>
          <div className="db-stat-label">Demandes en cours</div>
        </div>
        <div className="db-stat-card">
          <Heart className="db-stat-icon" size={22} />
          <div className="db-stat-value">0</div>
          <div className="db-stat-label">Artisans favoris</div>
        </div>
        <div className="db-stat-card">
          <MessageCircle className="db-stat-icon" size={22} />
          <div className="db-stat-value">0</div>
          <div className="db-stat-label">Messages non lus</div>
        </div>
      </div>

      <button className="db-primary-btn" disabled>
        <Plus size={18} />
        Nouvelle demande
        <span className="db-soon-badge">Bientôt disponible</span>
      </button>

      <div className="db-section">
        <h2 className="db-section-title">Historique des demandes</h2>
        <div className="db-empty-state">
          <FileText size={32} className="db-empty-icon" />
          <p>Aucune demande pour le moment.</p>
        </div>
      </div>
    </div>
  );
}