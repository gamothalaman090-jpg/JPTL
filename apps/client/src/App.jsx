import React, { useState, useEffect, useCallback, Component, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { notificationApi, systemApi } from './services/api';
import { DashboardSkeleton, TenantPortalSkeleton } from './components/ui/SkeletonLoader';

// Dynamic route-level code splitting via React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const StaffPortalPage = lazy(() => import('./pages/StaffPortalPage').then(m => ({ default: m.StaffPortalPage })));
const TenantPortalPage = lazy(() => import('./pages/TenantPortalPage').then(m => ({ default: m.TenantPortalPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage').then(m => ({ default: m.CookiePolicyPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

/* ─────────────────────────────────────────────
   Service Worker + Push Notification Registration
───────────────────────────────────────────── */
async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // Register the service worker and check for updates immediately
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    try { await registration.update(); } catch (_) {}

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Get VAPID public key from server
    const keyRes = await notificationApi.getVapidKey();
    const vapidPublicKey = keyRes?.publicKey;
    if (!vapidPublicKey) return;

    // Convert VAPID key to Uint8Array
    const urlB64ToUint8Array = (base64String) => {
      const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    };

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(vapidPublicKey),
    });

    // Send subscription to backend
    await notificationApi.subscribePush(subscription.toJSON());
  } catch (err) {
    // Non-fatal — push is optional enhancement
    console.warn('Push notification registration failed:', err.message);
  }
}

/* ─────────────────────────────────────────────
   Error Boundary
───────────────────────────────────────────── */
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
            <pre className="p-3 rounded-xl bg-black text-xs text-rose-300 font-mono overflow-x-auto max-h-48">
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

/* ─────────────────────────────────────────────
   Auth loading spinner
   Shown while AuthContext validates the saved
   sessionStorage token with GET /auth/me.
───────────────────────────────────────────── */
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-xs font-mono tracking-widest uppercase">Restoring session…</p>
      </div>
    </div>
  );
}

export const isTenantRoute = (path) => {
  if (!path) return false;
  const p = path.toLowerCase().split('?')[0].replace(/\/$/, '');
  return p.startsWith('/tenant') || p === '/tenant' || p.startsWith('/tenant-') || p.startsWith('/tenant/');
};

export const isLandlordRoute = (path) => {
  if (!path) return false;
  const p = path.toLowerCase().split('?')[0].replace(/\/$/, '');
  return p.startsWith('/dashboard') || p === '/dashboard' || p.startsWith('/dashboard-') || p.startsWith('/dashboard/') ||
         p.startsWith('/landlord') || p === '/landlord' || p.startsWith('/landlord-') || p.startsWith('/landlord/');
};

export const isStaffRoute = (path) => Boolean(path && path.toLowerCase().split('?')[0].replace(/\/$/, '') === '/staff');

function RouteLoadingFallback({ currentPath }) {
  if (isTenantRoute(currentPath)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto">
        <TenantPortalSkeleton />
      </div>
    );
  }
  if (isLandlordRoute(currentPath)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 p-4 sm:p-8 max-w-7xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }
  return <AuthLoadingScreen />;
}

/* ─────────────────────────────────────────────
   Main router — auth-aware, role-aware
───────────────────────────────────────────── */
function AppRouter() {
  const { user, loading, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [maintenanceState, setMaintenanceState] = useState(null);

  const navigate = useCallback((path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check system status on mount & listen to maintenance events
  useEffect(() => {
    systemApi.getStatus()
      .then((data) => {
        if (data?.maintenance) {
          setMaintenanceState(data.message || 'Platform is currently undergoing scheduled maintenance.');
        }
      })
      .catch(() => {});

    const handleMaintenance = (e) => {
      setMaintenanceState(e.detail?.message || 'Platform is currently undergoing scheduled maintenance.');
    };
    window.addEventListener('jptl-maintenance-active', handleMaintenance);
    return () => window.removeEventListener('jptl-maintenance-active', handleMaintenance);
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Register push notifications once when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      registerPushNotifications();
    }
  }, [isAuthenticated, user?.id]);

  // Safe route guards in useEffect
  useEffect(() => {
    if (loading) return;
    const role = user?.role;
    const isStaff = isStaffRoute(currentPath);

    if (!isAuthenticated) {
      const publicPaths = [
        '/login', 
        '/', 
        '/register', 
        '/forgot-password', 
        '/privacy', 
        '/privacy-policy',
        '/terms',
        '/terms-of-service',
        '/cookies',
        '/cookie-policy'
      ];
      const isPublic =
        publicPaths.includes(currentPath) || currentPath.startsWith('/reset-password');
      const isProtected =
        isTenantRoute(currentPath) ||
        isLandlordRoute(currentPath) ||
        currentPath.startsWith('/onboarding');
      if (!isPublic && isProtected) {
        window.history.replaceState({}, '', '/login');
        setCurrentPath('/login');
      }
      return;
    }

    // Authenticated
    if (currentPath === '/login' || currentPath === '/') {
      const target = role === 'tenant' ? '/tenant' : role === 'staff' ? '/staff' : '/dashboard';
      window.history.replaceState({}, '', target);
      setCurrentPath(target);
      return;
    }

    if (role === 'tenant' && isLandlordRoute(currentPath)) {
      window.history.replaceState({}, '', '/tenant');
      setCurrentPath('/tenant');
      return;
    }

    if (role === 'staff' && !isStaff) {
      window.history.replaceState({}, '', '/staff');
      setCurrentPath('/staff');
      return;
    }

    if (role !== 'staff' && isStaff) {
      const target = role === 'tenant' ? '/tenant' : '/dashboard';
      window.history.replaceState({}, '', target);
      setCurrentPath(target);
      return;
    }

    if ((role === 'landlord' || role === 'superadmin') && isTenantRoute(currentPath)) {
      window.history.replaceState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
    }
  }, [loading, isAuthenticated, user?.role, currentPath]);

  // If maintenance mode is active, display lockdown screen regardless of cached session
  if (maintenanceState) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="p-8 max-w-md w-full bg-[#0D111D] border border-amber-500/30 rounded-3xl space-y-5 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              System Lockdown
            </span>
            <h1 className="text-xl font-extrabold font-grotesk tracking-tight text-white">
              Platform Maintenance Active
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            {maintenanceState}
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition btn-press cursor-pointer"
            >
              Check Again / Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Validating session
  if (loading) return <AuthLoadingScreen />;

  // 2. Authenticated user transitioning away from /login or /
  if (isAuthenticated && (currentPath === '/login' || currentPath === '/')) {
    return <AuthLoadingScreen />;
  }

  // 3. Unauthenticated user on protected route
  if (!isAuthenticated) {
    const protectedPrefixes = ['/dashboard', '/tenant', '/staff', '/onboarding'];
    const isProtected = protectedPrefixes.some(p => currentPath.startsWith(p));
    if (isProtected) {
      return <LoginPage onNavigate={navigate} />;
    }
  }

  // 4. Render matched route wrapped in Suspense for route code splitting
  return (
    <Suspense fallback={<RouteLoadingFallback currentPath={currentPath} />}>
      {(() => {
        if (currentPath === '/register') return <RegisterPage onNavigate={navigate} />;
        if (currentPath === '/onboarding' || currentPath.startsWith('/onboarding')) return <OnboardingPage onNavigate={navigate} />;
        if (currentPath === '/login') return <LoginPage onNavigate={navigate} />;
        if (currentPath === '/forgot-password' || currentPath.startsWith('/reset-password')) return <ForgotPasswordPage onNavigate={navigate} />;
        if (currentPath === '/privacy' || currentPath === '/privacy-policy') return <PrivacyPolicyPage onNavigate={navigate} />;
        if (currentPath === '/terms' || currentPath === '/terms-of-service') return <TermsOfServicePage onNavigate={navigate} />;
        if (currentPath === '/cookies' || currentPath === '/cookie-policy') return <CookiePolicyPage onNavigate={navigate} />;
        if (isTenantRoute(currentPath)) return <TenantPortalPage currentPath={currentPath} onNavigate={navigate} />;
        if (isStaffRoute(currentPath)) return <StaffPortalPage onNavigate={navigate} />;
        if (isLandlordRoute(currentPath)) return <DashboardPage currentPath={currentPath} onNavigate={navigate} />;
        if (currentPath === '/') return <LandingPage onNavigate={navigate} />;
        return <NotFoundPage onNavigate={navigate} />;
      })()}
    </Suspense>
  );
}

/* ─────────────────────────────────────────────
   Root
───────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <AppRouter />
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
