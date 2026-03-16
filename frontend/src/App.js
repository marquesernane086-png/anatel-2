import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
// Páginas ANATEL (Principal)
import AnatelHomePage from './pages/AnatelHomePage';
import AnatelDebitosPage from './pages/AnatelDebitosPage';
import AnatelPagamentoPage from './pages/AnatelPagamentoPage';
import AnatelConfirmacaoPage from './pages/AnatelConfirmacaoPage';
import AnatelEmDiaPage from './pages/AnatelEmDiaPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Redireciona "/" para "/anatel" */}
          <Route path="/" element={<Navigate to="/anatel" replace />} />
          
          {/* Rotas ANATEL - Sistema Principal */}
          <Route path="/anatel" element={<AnatelHomePage />} />
          <Route path="/anatel/debitos" element={<AnatelDebitosPage />} />
          <Route path="/anatel/pagamento" element={<AnatelPagamentoPage />} />
          <Route path="/anatel/confirmacao" element={<AnatelConfirmacaoPage />} />
          <Route path="/anatel/em-dia" element={<AnatelEmDiaPage />} />
          
          {/* Admin */}
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}

export default App;
