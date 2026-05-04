import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // <-- Importamos o Dashboard a sério!
import  Outdoor from './pages/Outdoor';
import CreateOutdoorRoute from './pages/CreateOutdoorRoute';
import OutdoorDetails from './pages/OutdoorDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gyms" element={<Dashboard />} />
          <Route path = "/outdoor" element = {<Outdoor />} />
          <Route path = "/outdoor/create" element = {<CreateOutdoorRoute />} />
          <Route path = "/outdoor/:id" element = {<OutdoorDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;