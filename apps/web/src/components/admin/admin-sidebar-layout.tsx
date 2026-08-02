"use client";


import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  Wrench,
  Users,
  ShieldCheck,
  FileText,
  ShieldAlert,
  CreditCard,
  Settings,
  User,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  {
    label: "Catégories & Services",
    href: "/dashboard/admin/categories",
    icon: Tag,
  },
  {
    label: "Vérification des artisans",
    href: "/dashboard/admin/verifications",
    icon: ShieldCheck,
    badge: 5,
  },
  {
    label: "Gestion des demandes",
    href: "/dashboard/admin/demandes",
    icon: FileText,
    badge: 12,
  },
  {
    label: "Réclamations",
    href: "/dashboard/admin/reclamations",
    icon: ShieldAlert,
  },
  {
    label: "Paiements",
    href: "/dashboard/admin/paiements",
    icon: CreditCard,
  },
];

const bottomItems = [
  { label: "Paramètres", href: "/dashboard/admin/parametres", icon: Settings },
  { label: "Mon profil", href: "/dashboard/admin/profil", icon: User },
];

export function AdminSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/dashboard/admin") return pathname === href;
    return pathname?.startsWith(href);
  };

  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-white font-['Outfit',sans-serif]">
      {/* Logo */}
      <Link
        href="/"
        className={`flex items-center ${collapsed ? "justify-center px-0" : "gap-3 px-6"} py-6 group border-b border-slate-100`}
      >
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
          <Image
            src="/images/logo.png"
            alt="Mon Artisan Logo"
            fill
            className="object-contain"
            sizes="36px"
          />
        </div>
        {!collapsed && (
          <span className="text-xl font-extrabold text-slate-800 tracking-tight whitespace-nowrap">
            Mon Artisan
          </span>
        )}
      </Link>

      {/* Nav Items */}
      <nav
        className={`flex-1 overflow-y-auto scrollbar-hide py-4 ${collapsed ? "px-2 space-y-1" : "px-3 space-y-0.5"}`}
      >
        {navItems.map((item) => {
          const active = isItemActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center relative ${
                collapsed
                  ? "justify-center px-0 py-3 rounded-xl"
                  : "justify-between px-3 py-2.5 rounded-xl"
              } transition-all duration-200 group ${
                active
                  ? "bg-[#1dbf73]/10 text-[#1dbf73]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                  className={active ? "text-[#1dbf73]" : ""}
                />
                {!collapsed && (
                  <span
                    className={`text-[14px] ${active ? "font-semibold text-[#1dbf73]" : "font-medium"}`}
                  >
                    {item.label}
                  </span>
                )}
              </div>
              {!collapsed && item.badge && (
                <span className="bg-[#1dbf73] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1dbf73] rounded-full ring-2 ring-white" />
              )}
            </Link>
          );
        })}

        <div
          className={`my-4 border-t border-slate-100 ${collapsed ? "mx-1" : "mx-2"}`}
        />

        {bottomItems.map((item) => {
          const active = isItemActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 ${
                collapsed
                  ? "justify-center px-0 py-3 rounded-xl"
                  : "px-3 py-2.5 rounded-xl"
              } transition-all duration-200 ${
                active
                  ? "bg-[#1dbf73]/10 text-[#1dbf73]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                className={active ? "text-[#1dbf73]" : ""}
              />
              {!collapsed && (
                <span
                  className={`text-[14px] ${active ? "font-semibold text-[#1dbf73]" : "font-medium"}`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        <button
          title={collapsed ? "Déconnexion" : undefined}
          className={`w-full flex items-center gap-3 ${
            collapsed
              ? "justify-center px-0 py-3 rounded-xl"
              : "px-3 py-2.5 rounded-xl"
          } transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-500 group mt-1`}
        >
          <LogOut
            size={20}
            strokeWidth={2}
            className="group-hover:text-red-500 transition-colors"
          />
          {!collapsed && (
            <span className="text-[14px] font-medium group-hover:text-red-500 transition-colors">
              Déconnexion
            </span>
          )}
        </button>
      </nav>

      {/* User Card */}
      <div
        className={`p-3 border-t border-slate-100 ${collapsed ? "px-2" : "px-3"}`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center p-2" : "gap-3 p-3"} rounded-xl hover:bg-slate-50 transition-colors cursor-pointer`}
        >
          <div className="relative w-9 h-9 rounded-full shrink-0 bg-[#1dbf73] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 truncate leading-tight">
                Admin
              </p>
              <p className="text-[12px] text-[#1dbf73] font-medium truncate">
                Administrateur
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa] font-['Outfit',sans-serif]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 border-r border-slate-100 bg-white z-20 transition-all duration-300 ease-in-out ${
          isDesktopCollapsed ? "w-[72px]" : "w-[240px]"
        }`}
      >
        <SidebarContent collapsed={isDesktopCollapsed} />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-[260px] max-w-[85%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <button
              className="absolute top-5 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <button
              className="hidden md:block p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors"
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              title={
                isDesktopCollapsed ? "Développer le menu" : "Réduire le menu"
              }
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1dbf73] rounded-full ring-2 ring-white" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1dbf73] flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
