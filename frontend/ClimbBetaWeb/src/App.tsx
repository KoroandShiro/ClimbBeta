import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// Componente temporário para o Ticket 2D
const TempDashboard = () => (
    <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>✅ Entraste no Dashboard do Ginásio!</h1>
        <p>O Token foi guardado com sucesso no navegador.</p>
    </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gyms" element={<TempDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;