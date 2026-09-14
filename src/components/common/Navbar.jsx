import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('el') ? 'en' : 'el';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.scooters'), path: '/scooters' },
    { name: t('nav.apartments'), path: '/apartments' },
    { name: t('nav.reviews'), path: '/#reviews' },
    { name: t('nav.contact'), path: '/#contact' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-center items-center">
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium text-sm transition-colors ${
                  location.pathname === link.path ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              {t('nav.bookNow')}
            </button>
            
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-sm font-medium"
            >
              <Globe size={18} />
              {i18n.language.startsWith('el') ? 'EL' : 'EN'}
            </button>

            <Link to="/admin" className="text-white/50 hover:text-white transition-colors">
              <User size={20} />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden absolute right-4 flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-md shadow-lg absolute w-full left-0 top-full border-t border-white/10">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 py-4 mt-2">
              <button className="w-full bg-cyan-500 text-slate-900 px-5 py-3 rounded-full font-bold shadow-md">
                {t('nav.bookNow')}
              </button>
            </div>
            <div className="px-3 py-2 flex justify-between border-t border-white/10 pt-4">
               <button 
                onClick={() => {
                  toggleLanguage();
                  setIsOpen(false);
                }} 
                className="text-white/80 hover:text-white flex items-center gap-2"
              >
                <Globe size={18} />
                {i18n.language.startsWith('el') ? 'Ελληνικά (EL)' : 'English (EN)'}
              </button>
               <Link to="/admin" onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white flex items-center gap-2">
                <User size={18} /> {t('nav.adminLogin')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
