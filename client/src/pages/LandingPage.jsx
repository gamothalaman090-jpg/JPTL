import React, { useState } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Navbar } from '../components/common/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { BentoGrid01 } from '../components/ui/bento-grid-01';
import { RoleBreakdown } from '../components/landing/RoleBreakdown';
import { InteractiveWorkflow } from '../components/landing/InteractiveWorkflow';
import { Testimonials } from '../components/landing/Testimonials';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/common/Footer';
import { LoginModal } from '../components/common/LoginModal';

export const LandingPage = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRole, setLoginRole] = useState('tenant');

  // Trigger scroll-reveal animations for elements with .reveal-init class
  useScrollReveal();

  const handleOpenLogin = (role = 'tenant') => {
    setLoginRole(role);
    setLoginModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    console.log('Authenticated demo user:', user);
    setLoginModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#08080C] text-[#F3F3F8] font-sans selection:bg-blue-600/30 selection:text-blue-300">
      
      {/* 1. Header Navigation */}
      <Navbar onOpenLogin={handleOpenLogin} />

      {/* 2. Hero Section with Interactive Aurora Shader Canvas */}
      <HeroSection onOpenLogin={handleOpenLogin} />

      {/* 3. Integrated Shadcn Framer-Motion Bento Grid */}
      <BentoGrid01 />

      {/* 4. Role-Based Access Control Breakdown */}
      <RoleBreakdown onOpenLogin={handleOpenLogin} />

      {/* 5. Synchronous Integration Engine & Live Code Preview */}
      <InteractiveWorkflow />

      {/* 6. Operational Benchmarks */}
      <Testimonials />

      {/* 7. Call-to-Action Section */}
      <CTASection onOpenLogin={handleOpenLogin} />

      {/* 8. Footer */}
      <Footer />

      {/* Demo Portal Login Modal Overlay */}
      <LoginModal
        isOpen={loginModalOpen}
        initialRole={loginRole}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};
