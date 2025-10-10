import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import SuccessPage from './pages/SuccessPage';
import { DashboardPage } from './pages/DashboardPage';
import ScorecardPage from './pages/ScorecardPage';
import SimpleScorecardPage from './pages/SimpleScorecardPage';
import DrillPage from './pages/DrillPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/scorecard" element={<ScorecardPage />} />
              <Route path="/simple-scorecard" element={<SimpleScorecardPage />} />
              <Route path="/drill/:drillId" element={<DrillPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;