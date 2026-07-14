"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const pathname = usePathname();
  
  const links = [
    { to: "/home", label: "Accueil" },
    { to: "/dashboard", label: "Tableau de bord" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <nav className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Image 
                src="/images/logo.png" 
                alt="Mon Artisan Logo" 
                width={140} 
                height={40} 
                className="h-8 w-auto object-contain" 
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label }) => {
                const isActive = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <Link
                    key={to}
                    href={to}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <div className="pl-2 border-l border-gray-200 dark:border-gray-800">
              <UserMenu />
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
}