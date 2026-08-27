import React, { useState, useEffect, Component } from 'react';
import { LandingPage } from './pages/LandingPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TenantPortalPage } from './pages/TenantPortalPage';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center space-y-4">
          <div className="p-6 max-w-xl w-full bg-slate-900 border border-rose-500/30 rounded-2xl space-y-3">
            <h2 className="text-xl font-bold text-rose-400 font-mono">⚠️ Runtime UI Error Detected</h2>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {this.state.error?.toString()}
            </p>
            <pre className="p-3 rounded-xl bg-black text-[10px] text-rose-300 font-mono overflow-x-auto max-h-48">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs"
            >
              Reload Dashboard View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  const renderContent = () => {
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
  };

  return (
    <ErrorBoundary>
      {renderContent()}
    </ErrorBoundary>
  );
}

export default App;
