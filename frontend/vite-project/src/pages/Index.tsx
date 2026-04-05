import heroSky from "../../src/assets/GoldenSky.png";
import Navbar from "../../components/Navbar";
import HeroSection from "../../components/HeroSection";
import FloatingPetals from "../../components/FloatingPetals";
import FeaturesSection from "../../components/FeaturesSelection";
import FinalCTA from "../../components/FinalCTA";
import React from "react";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img src={heroSky} alt="" className="h-full w-full object-cover" />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom right, rgba(0,0,0,0.55), rgba(0,0,0,0.35), rgba(0,0,0,0.15))",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.25) 100%)",
          }}
        />
      </div>

      <FloatingPetals />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <FinalCTA />
    </div>
  );
};

export default Index;
