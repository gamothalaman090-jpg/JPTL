import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TenantPortalPage } from './pages/TenantPortalPage';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPath === '/register') {
    return <RegisterPage onNavigate={navigate} />;
  }

  if (currentPath === '/onboarding' || currentPath.startsWith('/onboarding')) {
    return <OnboardingPage onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPath === '/tenant' || currentPath.startsWith('/tenant')) {
    return <TenantPortalPage onNavigate={navigate} />;
  }

  if (currentPath === '/dashboard' || currentPath.startsWith('/dashboard')) {
    return <DashboardPage onNavigate={navigate} />;
  }

  return <LandingPage onNavigate={navigate} />;
}

export default App;
