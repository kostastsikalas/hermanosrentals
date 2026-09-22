import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import ScootersPage from './pages/ScootersPage';
import ApartmentsPage from './pages/ApartmentsPage';
import AdminDashboard from './pages/AdminScooters';
import TermsPage from './pages/TermsPage';
import BookingPage from './pages/BookingPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scooters" element={<ScootersPage />} />
            <Route path="/apartments" element={<ApartmentsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
