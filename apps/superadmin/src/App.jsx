import React, { useState } from 'react';
import { SuperadminLoginPage } from './pages/SuperadminLoginPage';
import { SuperadminPortalPage } from './pages/SuperadminPortalPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('jptl_superadmin_auth') === 'true';
  });

  if (!isAuthenticated) {
    return (
      <SuperadminLoginPage
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    );
  }

  return (
    <SuperadminPortalPage
      onLogout={() => {
        sessionStorage.removeItem('jptl_superadmin_auth');
        sessionStorage.removeItem('jptl_superadmin_user');
        setIsAuthenticated(false);
      }}
    />
  );
}

export default App;
