import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { BentoGrid01 } from '../components/ui/bento-grid-01';
import { RoleBreakdown } from '../components/landing/RoleBreakdown';
import { Testimonials } from '../components/landing/Testimonials';
import { PricingSection } from '../components/landing/PricingSection';
import { Footer } from '../components/common/Footer';

export const LandingPage = ({ onNavigate = () => {} }) => {
  const { theme, toggleTheme } = useTheme();

  // Trigger scroll-reveal animations
  useScrollReveal();

  const handleOpenLogin = () => {
    onNavigate('/register');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08080C] text-slate-900 dark:text-[#F3F3F8] font-sans selection:bg-blue-600/30 selection:text-blue-300 transition-colors duration-300">
      
      {/* 1. Header Navigation */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={onNavigate}
      />

      {/* 2. Hero Section with Interactive Canvas */}
      <HeroSection
        theme={theme}
        onOpenLogin={handleOpenLogin}
      />

      {/* 3. System Capabilities Bento Grid */}
      <BentoGrid01 />

      {/* 4. Role-Based Access Control Breakdown */}
      <RoleBreakdown onOpenLogin={handleOpenLogin} />

      {/* 5. Testimonials Section */}
      <Testimonials />

      {/* 6. Pricing Section */}
      <PricingSection />

      {/* 7. System Footer */}
      <Footer />

    </div>
  );
};
