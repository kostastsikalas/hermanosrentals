import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import ScootersPage from './pages/ScootersPage';
import ApartmentsPage from './pages/ApartmentsPage';
import AdminScooters from './pages/AdminScooters';

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
            <Route path="/admin" element={<AdminScooters />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
