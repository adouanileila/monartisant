"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Wrench,
  FileText,
  CalendarDays,
  Tag,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const stats = [
  {
    label: "Utilisateurs",
    value: 256,
    sub: "+12 ce mois",
    icon: Users,
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    label: "Artisans",
    value: 124,
    sub: "+8 ce mois",
    icon: Wrench,
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    label: "Demandes",
    value: 32,
    sub: "+5 en attente",
    icon: FileText,
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    label: "Réservations",
    value: 89,
    sub: "+15 ce mois",
    icon: CalendarDays,
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    label: "Catégories",
    value: 18,
    sub: "Total",
    icon: Tag,
    color: "#10b981",
    bg: "#ecfdf5",
  },
];

const demandesRecentes = [
  {
    nom: "Sarah Ben Ali",
    initiale: "S",
    service: "Plomberie",
    statut: "En attente",
    date: "20/07/2024",
    bg: "#e0f2fe",
    tc: "#0369a1",
  },
  {
    nom: "Mohamed Trabelsi",
    initiale: "M",
    service: "Electricité",
    statut: "Acceptée",
    date: "20/07/2024",
    bg: "#dcfce7",
    tc: "#166534",
  },
  {
    nom: "Leila Kchaou",
    initiale: "L",
    service: "Peinture",
    statut: "En attente",
    date: "19/07/2024",
    bg: "#e0f2fe",
    tc: "#0369a1",
  },
  {
    nom: "Youssef Hannachi",
    initiale: "Y",
    service: "Menuiserie",
    statut: "Refusée",
    date: "19/07/2024",
    bg: "#fee2e2",
    tc: "#991b1b",
  },
  {
    nom: "Amira Zoghlami",
    initiale: "A",
    service: "Nettoyage",
    statut: "Acceptée",
    date: "18/07/2024",
    bg: "#dcfce7",
    tc: "#166534",
  },
];

const artisansRecents = [
  {
    nom: "Ahmed Ben Salem",
    metier: "Plombier",
    statut: "En attente",
    date: "20/07/2024",
  },
  {
    nom: "Karim Baccar",
    metier: "Electricien",
    statut: "Vérifié",
    date: "19/07/2024",
  },
  {
    nom: "Faten Jebali",
    metier: "Peintre",
    statut: "Vérifié",
    date: "19/07/2024",
  },
  {
    nom: "Sami Ben Amor",
    metier: "Menuisier",
    statut: "En attente",
    date: "18/07/2024",
  },
  {
    nom: "Nadia Kooli",
    metier: "Nettoyage",
    statut: "Vérifié",
    date: "18/07/2024",
  },
];

const topCategories = [
  { nom: "Plomberie", services: 45, emoji: "🔧", color: "#3b82f6" },
  { nom: "Électricité", services: 38, emoji: "⚡", color: "#f59e0b" },
  { nom: "Peinture", services: 32, emoji: "🎨", color: "#8b5cf6" },
  { nom: "Menuiserie", services: 28, emoji: "🪚", color: "#f97316" },
  { nom: "Nettoyage", services: 22, emoji: "🧹", color: "#10b981" },
];

const donutData = [
  { label: "En attente", value: 32, percent: 40, color: "#f59e0b" },
  { label: "Acceptées", value: 38, percent: 47.5, color: "#1dbf73" },
  { label: "Refusées", value: 10, percent: 12.5, color: "#ef4444" },
];

const reservationsData = [8, 14, 10, 18, 12, 22, 16, 28, 20, 32, 24, 30, 26, 38];

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart() {
  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const r = 52;
  const strokeW = 22;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = donutData.map((d) => {
    const dash = (d.percent / 100) * circumference;
    const gap = circumference - dash;
    const seg = { ...d, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((s, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${s.gap}`}
          strokeDashoffset={-s.offset + circumference / 4}
          strokeLinecap="butt"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      ))}
    </svg>
  );
}

// ─── Sparkline Chart ──────────────────────────────────────────────────────────

function SparklineChart() {
  const w = 370;
  const h = 130;
  const pad = { top: 20, right: 12, bottom: 28, left: 30 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const min = Math.min(...reservationsData);
  const max = Math.max(...reservationsData);
  const range = max - min || 1;

  const pts = reservationsData.map((v, i) => ({
    x: pad.left + (i / (reservationsData.length - 1)) * innerW,
    y: pad.top + innerH - ((v - min) / range) * innerH,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  // Smooth area path
  const areaPath =
    `M${pts[0].x},${pts[0].y} ` +
    pts
      .slice(1)
      .map((p, i) => {
        const prev = pts[i];
        const cx = (prev.x + p.x) / 2;
        return `C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
      })
      .join(" ") +
    ` L${pts[pts.length - 1].x},${pad.top + innerH} L${pts[0].x},${pad.top + innerH} Z`;

  const linePath =
    `M${pts[0].x},${pts[0].y} ` +
    pts
      .slice(1)
      .map((p, i) => {
        const prev = pts[i];
        const cx = (prev.x + p.x) / 2;
        return `C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
      })
      .join(" ");

  const gridValues = [0, 10, 20, 30, 40];
  const labels = [
    "22 Juin",
    "29 Juin",
    "6 Juil.",
    "13 Juil.",
    "20 Juil.",
  ];
  const labelIndices = [0, 2, 5, 9, 13];

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1dbf73" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1dbf73" stopOpacity="0.01" />
        </linearGradient>
        <clipPath id="chart-clip">
          <rect
            x={pad.left}
            y={pad.top}
            width={innerW}
            height={innerH}
          />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {gridValues.map((v) => {
        const y = pad.top + innerH - ((v - 0) / 40) * innerH;
        return (
          <g key={v}>
            <line
              x1={pad.left}
              y1={y}
              x2={pad.left + innerW}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth="1"
            />
            <text
              x={pad.left - 6}
              y={y + 4}
              fontSize="9"
              fill="#aaa"
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#chart-clip)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#1dbf73"
        strokeWidth="2"
        strokeLinecap="round"
        clipPath="url(#chart-clip)"
      />

      {/* X labels */}
      {labelIndices.map((idx, i) => (
        <text
          key={i}
          x={pts[idx].x}
          y={h - 4}
          fontSize="9"
          fill="#aaa"
          textAnchor="middle"
        >
          {labels[i]}
        </text>
      ))}
    </svg>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "En attente": { bg: "#fff7ed", color: "#c2410c" },
    Acceptée: { bg: "#f0fdf4", color: "#166534" },
    Refusée: { bg: "#fef2f2", color: "#991b1b" },
    Vérifié: { bg: "#f0fdf4", color: "#166534" },
  };
  const style = map[statut] ?? { bg: "#f4f4f5", color: "#52525b" };
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: "11px",
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
      }}
    >
      {statut}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 900;
    const steps = 40;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedValues(stats.map((s) => Math.round(s.value * ease)));
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 800,
            color: "#111827",
            marginBottom: "4px",
          }}
        >
          Tableau de bord Administrateur
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Bienvenue, admin ! Voici un aperçu de votre plateforme.
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #f0f0f0",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 6px 16px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "none";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 1px 4px rgba(0,0,0,0.04)";
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color={s.color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: 500,
                    marginBottom: "2px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.1,
                  }}
                >
                  {animatedValues[i]}
                </div>
                <div style={{ fontSize: "12px", color: s.color, fontWeight: 500, marginTop: "2px" }}>
                  {s.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Donut Chart */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "16px",
            }}
          >
            Demandes par statut
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <DonutChart />
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}
            >
              {donutData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: d.color,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: "#374151", fontWeight: 500 }}>
                      {d.label}
                    </span>
                  </div>
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>
                    {d.value} ({d.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "12px",
            }}
          >
            Réservations{" "}
            <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "13px" }}>
              (30 derniers jours)
            </span>
          </h2>
          <div style={{ width: "100%", height: "130px" }}>
            <SparklineChart />
          </div>
        </div>

        {/* Top Categories */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "16px",
            }}
          >
            Top catégories
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topCategories.map((cat, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      background: `${cat.color}15`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    {cat.emoji}
                  </span>
                  <span style={{ fontWeight: 600, color: "#111827" }}>
                    {cat.nom}
                  </span>
                </div>
                <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: 500 }}>
                  {cat.services} services
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
      >
        {/* Demandes récentes */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              Demandes récentes
            </h2>
            <button
              style={{
                fontSize: "13px",
                color: "#1dbf73",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {demandesRecentes.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 90px 90px 80px",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 8px",
                  borderRadius: "10px",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: d.bg,
                    color: d.tc,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                >
                  {d.initiale}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#111827",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {d.nom}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.service}
                </span>
                <StatusBadge statut={d.statut} />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    fontWeight: 400,
                    textAlign: "right",
                  }}
                >
                  {d.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Artisans récemment inscrits */}
        <div
          style={{
            background: "white",
            border: "1px solid #f0f0f0",
            borderRadius: "14px",
            padding: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
              Artisans récemment inscrits
            </h2>
            <button
              style={{
                fontSize: "13px",
                color: "#1dbf73",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              Voir tout <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {artisansRecents.map((a, i) => {
              const initiale = a.nom.charAt(0);
              const colors = [
                { bg: "#dbeafe", tc: "#1d4ed8" },
                { bg: "#dcfce7", tc: "#15803d" },
                { bg: "#fae8ff", tc: "#7e22ce" },
                { bg: "#ffedd5", tc: "#c2410c" },
                { bg: "#d1fae5", tc: "#065f46" },
              ];
              const c = colors[i % colors.length];
              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr 80px 70px 80px",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 8px",
                    borderRadius: "10px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: c.bg,
                      color: c.tc,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    {initiale}
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#111827",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {a.nom}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.metier}
                  </span>
                  <StatusBadge statut={a.statut} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      fontWeight: 400,
                      textAlign: "right",
                    }}
                  >
                    {a.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}