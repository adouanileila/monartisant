"use client";

import React, { useState } from "react";
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
  Bell,
  Menu,
  X,
  Home,
  LogOut
} from "lucide-react";
import Image from "next/image";

const navItems = [
  { label: "Tableau de bord", href: "/dashboard/artisan", icon: LayoutDashboard },
  { label: "Mes demandes", href: "/dashboard/artisan/demandes", icon: ClipboardList },
  { label: "Mes services", href: "/dashboard/artisan/services", icon: Wrench },
  { label: "Messages", href: "/dashboard/artisan/messages", icon: MessageCircle, badge: 3 },
  { label: "Avis", href: "/dashboard/artisan/avis", icon: Star },
  { label: "Paiements", href: "/dashboard/artisan/paiements", icon: Wallet },
];

export function ArtisanSidebarLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  const activeColor = "text-[#1dbf73]";
  const activeBg = "bg-[#1dbf73]/10";
  const activeBorder = "border-[#1dbf73]";

  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-white font-['Outfit',sans-serif]">
      {/* Logo */}
      <Link href="/" className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-6'} py-8 group`}>
        <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
          <Image 
            src="/images/logo.png" 
            alt="MonArtisant Logo" 
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
      <nav className={`flex-1 overflow-y-auto scrollbar-hide ${collapsed ? 'px-2 space-y-2' : 'px-4 space-y-2'}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard/artisan");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center relative ${collapsed ? 'justify-center px-0 py-3 rounded-xl border-l-0' : 'justify-between px-3 py-3 rounded-xl border-l-4'} transition-all duration-200 group ${
                isActive
                  ? `${activeBg} ${activeColor} ${collapsed ? '' : activeBorder}`
                  : `${collapsed ? '' : 'border-transparent'} text-slate-500 hover:bg-slate-50 hover:text-slate-900`
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={collapsed && isActive ? activeColor : ''} />
                {!collapsed && (
                  <span className={`text-[15px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                )}
              </div>
              {!collapsed && item.badge && (
                <span className="bg-[#1dbf73] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#1dbf73] rounded-full ring-2 ring-white"></span>
              )}
            </Link>
          );
        })}

        <div className={`my-6 border-t border-slate-100 ${collapsed ? 'mx-2' : 'mx-3'}`} />

        <Link
          href="/dashboard/artisan/profil"
          title={collapsed ? "Mon profil" : undefined}
          className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0 py-3 rounded-xl border-l-0' : 'px-3 py-3 rounded-xl border-l-4'} transition-all duration-200 ${
            pathname?.startsWith("/dashboard/artisan/profil")
              ? `${activeBg} ${activeColor} ${collapsed ? '' : activeBorder}`
              : `${collapsed ? '' : 'border-transparent'} text-slate-500 hover:bg-slate-50 hover:text-slate-900`
          }`}
        >
          <User size={22} strokeWidth={pathname?.startsWith("/dashboard/artisan/profil") ? 2.5 : 2} className={collapsed && pathname?.startsWith("/dashboard/artisan/profil") ? activeColor : ''} />
          {!collapsed && <span className={`text-[15px] ${pathname?.startsWith("/dashboard/artisan/profil") ? 'font-semibold' : 'font-medium'}`}>Mon profil</span>}
        </Link>
        
        <button
          title={collapsed ? "Déconnexion" : undefined}
          className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-0 py-3 rounded-xl' : 'px-3 py-3 rounded-xl border-l-4 border-transparent'} transition-all duration-200 text-slate-500 hover:bg-red-50 hover:text-red-600 group mt-2`}
        >
          <LogOut size={22} strokeWidth={2} className="group-hover:text-red-600 transition-colors" />
          {!collapsed && <span className="text-[15px] font-medium group-hover:text-red-600 transition-colors">Déconnexion</span>}
        </button>
      </nav>

      {/* User Card */}
      <div className={`p-4 mt-auto border-t border-slate-50 ${collapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center p-2' : 'gap-3 p-3'} border border-slate-100 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer group shadow-sm bg-white`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
            <Image 
              src="/images/artisans/marc-carpenter.png" 
              alt="Profile" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
              sizes="40px"
            />
            {collapsed && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1dbf73] border-2 border-white"></span>}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-slate-800 truncate leading-tight">Marc Menuisier</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#1dbf73]"></span>
                <span className="text-xs font-medium text-slate-500">En ligne</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8f8] font-['Outfit',sans-serif]">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block shrink-0 border-r border-slate-200 bg-white shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20 transition-all duration-300 ease-in-out ${
          isDesktopCollapsed ? 'w-[80px]' : 'w-[260px]'
        }`}
      >
        <SidebarContent collapsed={isDesktopCollapsed} />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="relative w-[280px] max-w-[80%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <button 
              className="absolute top-6 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
              onClick={() => setIsMobileOpen(false)}
            >
              <X size={20} />
            </button>
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200 shrink-0 shadow-sm sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <button 
              className="hidden md:block p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors"
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              title={isDesktopCollapsed ? "Développer le menu" : "Réduire le menu"}
            >
              <Menu size={24} />
            </button>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors group">
              <Bell size={20} className="group-hover:animate-swing" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="w-9 h-9 rounded-full overflow-hidden relative border border-slate-200 cursor-pointer shadow-sm hover:ring-2 hover:ring-[#1dbf73]/20 transition-all">
              <Image src="/images/artisans/marc-carpenter.png" alt="Profile" fill className="object-cover" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
