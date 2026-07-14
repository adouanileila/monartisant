"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, MapPin, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import Image from "next/image";
import OnboardingNavbar from "./onboarding-navbar";

const CATEGORIES = [
  "Plomberie", "Électricité", "Menuiserie", "Peinture", 
  "Jardinage", "Nettoyage", "Serrurerie", "Maçonnerie"
];

export default function ArtisanAssistant() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [photoBase64, setPhotoBase64] = useState<string>("");

  // Step 2 State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const onboardArtisan = useMutation({
    ...orpc.onboardArtisan.mutationOptions(),
    onSuccess: () => {
      toast.success("Profil mis à jour !");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast.error("Une erreur est survenue.");
      console.error(err);
    }
  });

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onboardArtisan.mutate({
      description,
      experience: Number(experience),
      adresse: address,
      ville: city,
      photoBase64: photoBase64 || undefined
    });
  };

  const toggleCategory = (cat: string) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size validation (e.g. max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoBase64("");
  };

  return (
    <>
      <OnboardingNavbar currentStep={step} totalSteps={2} />
      <div className={`ob-card-wrapper ${step === 2 ? "ob-animate-enter" : "ob-animate-enter"}`}>
        <div className="ob-form-container">

        <div className="ob-form-header">
          <h2 className="ob-form-title">
            {step === 1 ? "Ton activité" : "Où interviens-tu ?"}
          </h2>
          <p className="ob-form-subtitle">
            {step === 1 
              ? "Étape 1/2 : Parle-nous de ton savoir-faire." 
              : "Étape 2/2 : Précise ta zone d'intervention."}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext}>
            {/* Photo Upload */}
            <div className="ob-form-group">
              <label className="ob-label">Photo de profil (Optionnel)</label>
              <div className="flex items-center gap-4 mt-2">
                {photoBase64 ? (
                  <div className="relative">
                    <img 
                      src={photoBase64} 
                      alt="Aperçu" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-green-500 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
                      title="Supprimer la photo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                    <Upload size={24} />
                  </div>
                )}
                
                <div className="flex-1">
                  <label 
                    htmlFor="photo-upload"
                    className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-sm text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    Choisir une photo
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Format JPG, PNG. Taille maximale 5 Mo.
                  </p>
                  <input 
                    id="photo-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
            </div>

            <div className="ob-form-group">
              <label htmlFor="description" className="ob-label">Description de ton activité</label>
              <textarea
                id="description"
                className="ob-input"
                placeholder="Ex: Artisan peintre avec 10 ans d'expérience, spécialisé en rénovation d'intérieur..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="ob-form-group">
              <label htmlFor="experience" className="ob-label">Années d'expérience</label>
              <input
                type="number"
                id="experience"
                className="ob-input"
                placeholder="Ex: 5"
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
            </div>

            <div className="ob-form-group">
              <label className="ob-label">Catégorie(s) de service</label>
              <div className="ob-cat-grid">
                {CATEGORIES.map(cat => (
                  <div 
                    key={cat}
                    role="button"
                    tabIndex={0}
                    className={`ob-cat-btn ${selectedCats.includes(cat) ? "selected" : ""}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="ob-btn" disabled={selectedCats.length === 0}>
              Suivant <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="ob-trust-msg">
              <ShieldCheck className="ob-trust-icon" size={24} />
              <p className="ob-trust-text">
                <strong>Ton profil sera vérifié par notre équipe sous 24-48h.</strong><br/>
                Cette étape est indispensable pour garantir la confiance de nos clients et mettre en valeur ton expertise.
              </p>
            </div>

            <div className="ob-form-group">
              <label htmlFor="address" className="ob-label">Adresse</label>
              <div style={{ position: "relative" }}>
                <MapPin size={18} style={{ position: "absolute", left: 14, top: 16, color: "#9ca3af" }} />
                <input
                  type="text"
                  id="address"
                  className="ob-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="Ex: 123 rue de la République..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="ob-form-group">
              <label htmlFor="city" className="ob-label">Ville</label>
              <input
                type="text"
                id="city"
                className="ob-input"
                placeholder="Ex: Paris"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                type="button" 
                className="ob-btn" 
                style={{ background: "#f3f4f6", color: "#374151", flex: "0 0 120px" }}
                onClick={() => setStep(1)}
              >
                Retour
              </button>
              <button type="submit" className="ob-btn" style={{ flex: 1 }} disabled={onboardArtisan.isPending}>
                {onboardArtisan.isPending ? "Enregistrement..." : (
                  <>Terminer mon profil <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  );
}
