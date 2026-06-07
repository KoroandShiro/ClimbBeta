import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import type { JSX } from 'react';
import Register from './pages/Register';

// --- O GUARDIÃO DE ROTAS ---
// Este componente abraça a Dashboard. Se o Owner não tiver token, é expulso para o Login.
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div>A carregar a tua sessão...</div>;
  if (!token) return <Navigate to="/login" replace />;
  
  return children;
}

function App() {
  return (
    // O AuthProvider envolve a app toda para partilhar o Token
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* A rota dos ginásios agora está PROTEGIDA */}
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