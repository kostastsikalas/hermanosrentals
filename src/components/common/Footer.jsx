import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <img src="/logo_transparent.png" alt="Hermanos Logo" className="h-12 w-auto mb-6 brightness-0 invert opacity-95" />
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {t('footer.about')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/scooters" className="hover:text-cyan-400 transition-colors">{t('footer.scooters')}</Link></li>
              <li><Link to="/apartments" className="hover:text-emerald-400 transition-colors">{t('footer.apartments')}</Link></li>
              <li><Link to="/#reviews" className="hover:text-white transition-colors">{t('nav.reviews')}</Link></li>
              <li><Link to="/#contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-6">{t('nav.contact')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-cyan-500 mt-0.5 flex-shrink-0" />
                <span>123 Island View Road<br />Paradise Bay, 80100</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-cyan-500 flex-shrink-0" />
                <span>+30 210 123 4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-cyan-500 flex-shrink-0" />
                <a href="mailto:hermanosrentals@gmail.com" className="hover:text-white transition-colors">hermanosrentals@gmail.com</a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter / CTA */}
          <div>
             <h4 className="text-white font-semibold mb-6">{t('footer.stayUpdated')}</h4>
             <p className="text-sm text-slate-400 mb-4">{t('footer.newsletterDesc')}</p>
             <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder={t('footer.emailPlaceholder')}
                  className="bg-slate-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-r-md text-white transition-colors text-sm font-medium">
                  {t('footer.joinBtn')}
                </button>
             </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <Link to="/terms" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
            <Link to="/admin" className="hover:text-white transition-colors">{t('nav.adminLogin')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
