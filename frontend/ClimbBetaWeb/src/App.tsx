import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // <-- Importamos o Dashboard a sério!

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gyms" element={<Dashboard />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;