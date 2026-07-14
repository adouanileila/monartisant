"use client";

import { useEffect } from "react";
import { MessageCircle } from "lucide-react";
import LandingNavbar from "@/components/landing/landing-navbar";
import HeroSection from "@/components/landing/hero-section";
import TrustBar from "@/components/landing/trust-bar";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import CategoriesSection from "@/components/landing/categories-section";
import FeaturedArtisansSection from "@/components/landing/featured-artisans-section";
import TrustStatsSection from "@/components/landing/trust-stats-section";
import TestimonialsSection from "@/components/landing/testimonials-section";
import CtaBannerSection from "@/components/landing/cta-banner-section";
import LandingFooter from "@/components/landing/landing-footer";

export default function LandingPage() {
  // Scroll-reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".lp-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <TrustBar />
        <HowItWorksSection />
        <CategoriesSection />
        <FeaturedArtisansSection />
        <TrustStatsSection />
        <TestimonialsSection />
        <CtaBannerSection />
      </main>
      <LandingFooter />

      {/* Floating help button */}
      <button
        className="lp-help-btn"
        aria-label="Besoin d'aide ?"
        title="Besoin d'aide ?"
      >
        <MessageCircle size={22} aria-hidden="true" />
      </button>
    </div>
  );
}
