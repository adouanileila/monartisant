"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  MessageCircle,
  Star,
  Wallet,
  User,
  Bell,
} from "lucide-react";

const artisanNavItems = [
  { label: "Tableau de bord", href: "/dashboard/artisan", icon: LayoutDashboard },
  { label: "Mes demandes", href: "/dashboard/artisan/demandes", icon: ClipboardList },
  { label: "Mes services", href: "/dashboard/artisan/services", icon: Wrench },
  { label: "Messages", href: "/dashboard/artisan/messages", icon: MessageCircle },
  { label: "Avis", href: "/dashboard/artisan/avis", icon: Star },
  { label: "Paiements", href: "/dashboard/artisan/paiements", icon: Wallet },
  { label: "Mon profil", href: "/dashboard/artisan/profil", icon: User },
];

export function ArtisanNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-slate-100 px-6 py-3 bg-white sticky top-0 z-50">
      {/* Logo à gauche */}
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <Image src="/images/logo.png" alt="MonArtisant Logo" width={36} height={36} className="rounded-lg object-contain" />
        <span className="text-lg font-bold text-slate-800 hidden sm:inline">MonArtisant</span>
      </Link>

      {/* Liens de navigation au centre */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {artisanNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Cloche + Photo artisan à droite */}
      <div className="flex items-center gap-4 shrink-0">
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden relative border-2 border-emerald-400 cursor-pointer hover:scale-105 transition-transform">
          <Image src="/images/artisans/marc-carpenter.png" alt="Profile" fill className="object-cover" />
        </div>
      </div>
    </nav>
  );
}