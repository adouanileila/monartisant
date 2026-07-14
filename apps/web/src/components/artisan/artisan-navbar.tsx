"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  MessageCircle,
  Star,
  Wallet,
  User,
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
    <nav className="flex items-center gap-1 border-b px-6 py-3">
      {artisanNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? "bg-green-100 text-green-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}