import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MessageSquare, Car, CheckCircle, Loader2, Home as HomeIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useScooters } from '../hooks/useScooters';
import { apartments } from '../data/apartments';

const BookingPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [serviceType, setServiceType] = useState('scooter'); // 'scooter' or 'apartment'
  const { scooters } = useScooters();
  
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
      // Try to determine service type based on state if possible
      if (location.state.service) {
        setServiceType(location.state.service);
      }
    }
  }, [location]);

  // Check availability when dates or vehicle changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.startDate || !formData.endDate || !formData.vehicleName) {
        setIsAvailable(true);
        return;
      }
      
      setCheckingAvailability(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, start_date, end_date, status')
          .eq('vehicle_name', formData.vehicleName)
          .neq('status', 'cancelled'); // ignore cancelled bookings

        if (error) throw error;

        // Check for overlaps
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        
        const hasOverlap = data.some(booking => {
          const bStart = new Date(booking.start_date);
          const bEnd = new Date(booking.end_date);
          // Overlap condition: RequestStart <= BookingEnd AND RequestEnd >= BookingStart
          return (start <= bEnd && end >= bStart);
        });

        setIsAvailable(!hasOverlap);
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(true); // Default to true if check fails
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [formData.startDate, formData.endDate, formData.vehicleName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          start_date: formData.startDate,
          end_date: formData.endDate,
          vehicle_name: formData.vehicleName,
          notes: formData.notes
        }]);

      if (error) throw error;
      
      alert(t('bookingPage.alert', 'Your booking request has been sent successfully! We will contact you soon.'));
      navigate('/');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-12 md:pb-20 bg-slate-50 min-h-screen">
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

            {/* Service Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">{t('bookingPage.serviceTypeLabel', 'What would you like to book?')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setServiceType('scooter');
                    setFormData(prev => ({ ...prev, vehicleName: '' }));
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                    serviceType === 'scooter' 
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Car size={20} />
                  <span className="font-medium">{t('bookingPage.serviceScooter', 'Scooter')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceType('apartment');
                    setFormData(prev => ({ ...prev, vehicleName: '' }));
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                    serviceType === 'apartment' 
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <HomeIcon size={20} />
                  <span className="font-medium">{t('bookingPage.serviceApartment', 'Apartment')}</span>
                </button>
              </div>
            </div>

            <div className="relative group mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">{t('bookingPage.selectItemLabel', 'Select Option')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  {serviceType === 'scooter' ? <Car size={18} /> : <HomeIcon size={18} />}
                </div>
                <select 
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300 appearance-none"
                >
                  <option value="" disabled>{t('bookingPage.selectItemPlaceholder', '-- Select from list --')}</option>
                  {serviceType === 'scooter' && scooters.map(scooter => (
                    <option key={scooter.id} value={scooter.name}>{scooter.name}</option>
                  ))}
                  {serviceType === 'apartment' && apartments.map(apt => (
                    <option key={apt.id} value={t(apt.titleKey)}>{t(apt.titleKey)}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Availability Warning */}
            {(!isAvailable && formData.startDate && formData.endDate && formData.vehicleName) && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100 mb-6">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{t('bookingPage.notAvailable', 'Sorry, the selected dates are already booked for this option.')}</p>
              </div>
            )}

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
              disabled={isSubmitting || checkingAvailability || !isAvailable}
              className="w-full md:w-auto min-w-[200px] mx-auto bg-slate-900 hover:bg-cyan-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.23)] transform hover:-translate-y-0.5"
            >
              {(isSubmitting || checkingAvailability) ? <Loader2 className="animate-spin" size={20} /> : t('bookingPage.submitBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
