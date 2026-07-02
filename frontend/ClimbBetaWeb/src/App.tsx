import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import type { JSX } from 'react';
import Register from './pages/Register';

// --- ROUTE GUARD ---
// Wraps the Dashboard. If the owner has no token, they are kicked out to Login.
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div>Loading your session...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}

// --- GUEST-ONLY GUARD ---
// Wraps /login and /register. If the user is already authenticated, bounce them to the
// Dashboard, so the browser Back button can never land on the login page while logged in.
function GuestRoute({ children }: { children: JSX.Element }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div>Loading your session...</div>;
  if (token) return <Navigate to="/gyms" replace />;

  return children;
}

function App() {
  return (
    // The AuthProvider wraps the whole app to share the token
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

          {/* The gyms route is PROTECTED */}
          <Route
            path="/gyms"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
