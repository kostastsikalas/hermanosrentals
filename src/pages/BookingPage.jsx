import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MessageSquare, Car, CheckCircle } from 'lucide-react';

const BookingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    vehicleName: '',
    notes: ''
  });

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    // Populate vehicle name if passed via state
    if (location.state && location.state.vehicleName) {
      setFormData(prev => ({ ...prev, vehicleName: location.state.vehicleName }));
    }
  }, [location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t('bookingPage.alert'));
    navigate('/'); // Redirect to home after booking
  };

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{t('bookingPage.title')}</h1>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
            {t('bookingPage.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 relative z-10 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" />
            {t('bookingPage.formTitle')}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  placeholder={t('bookingPage.firstName')}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  placeholder={t('bookingPage.lastName')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  placeholder={t('bookingPage.email')}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  placeholder={t('bookingPage.phone')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  title={t('bookingPage.startDate')}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Calendar size={18} />
                </div>
                <input 
                  type="date" 
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  title={t('bookingPage.endDate')}
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <Car size={18} />
              </div>
              <input 
                type="text" 
                value={formData.vehicleName}
                readOnly
                className="w-full bg-slate-100 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-600 focus:outline-none cursor-not-allowed"
                placeholder={t('bookingPage.vehicle')}
              />
            </div>

            <div className="relative group">
              <div className="absolute top-4 left-4 flex items-start pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <MessageSquare size={18} />
              </div>
              <textarea 
                rows="4"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300 resize-none"
                placeholder={t('bookingPage.notes')}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="w-full md:w-auto min-w-[200px] mx-auto bg-slate-900 hover:bg-cyan-500 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.23)] transform hover:-translate-y-0.5"
            >
              {t('bookingPage.submitBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
