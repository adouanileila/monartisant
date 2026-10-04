"use client";

import { useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth-client";
import { Home } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface OnboardingNavbarProps {
  currentStep: number;
  totalSteps: number;
  showFinishLater?: boolean;
}

export default function OnboardingNavbar({
  currentStep,
  totalSteps,
  showFinishLater = true,
}: OnboardingNavbarProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [showExitModal, setShowExitModal] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  // Progress percentage (safeguard division by zero)
  const progressPercent = totalSteps > 0 
    ? Math.min(100, Math.max(0, (currentStep / totalSteps) * 100))
    : 0;

  const handleFinishLater = () => {
    router.push("/dashboard");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 h-16 shadow-sm">
        <div className="h-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LEFT: Logo (Centered on mobile via absolute positioning, but let's use flex flex-1 for clean responsive layout) */}
          <div className="flex-1 flex justify-start sm:justify-start">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 group transition-opacity hover:opacity-80"
              title="Quitter l'onboarding"
            >
              <Image 
                src="/images/logo.png" 
                alt="Mon Artisan Logo" 
                width={140} 
                height={40} 
                className="h-8 w-auto object-contain" 
                priority
              />
            </button>
          </div>

          {/* CENTER: Logo on mobile only */}
          <div className="sm:hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="flex items-center gap-2 group transition-opacity hover:opacity-80"
            >
              <Image 
                src="/images/logo.png" 
                alt="Mon Artisan Logo" 
                width={140} 
                height={40} 
                className="h-8 w-auto object-contain" 
                priority
              />
            </button>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center justify-end gap-3 md:gap-6 flex-1">
            
            {showFinishLater && (
              <button
                type="button"
                onClick={handleFinishLater}
                className="hidden md:block text-sm text-gray-500 hover:text-gray-900 hover:underline underline-offset-4 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                Terminer plus tard
              </button>
            )}

            <div className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-gray-200 dark:border-gray-800">
              <ModeToggle />
              
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold border border-[#22C55E]/20">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                  {user?.name?.split(" ")[0] || "Profil"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        {totalSteps > 0 && (
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full bg-[#22C55E] transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </nav>

      {/* EXIT MODAL */}
      {showExitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                <Home size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">
              Quitter l'onboarding ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Ta progression sera sauvegardée. Tu pourras compléter ton profil plus tard depuis ton tableau de bord.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleFinishLater}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
