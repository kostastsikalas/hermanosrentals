import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MessageSquare, Car, CheckCircle, Loader2, Home as HomeIcon, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useScooters } from '../hooks/useScooters';
import { useApartments } from '../hooks/useApartments';

const BookingPage = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { scooters } = useScooters();
  const { apartments } = useApartments();
  const isGreek = i18n.language === 'el';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [selectedScooter, setSelectedScooter] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    // Populate selection if passed via state
    if (location.state && location.state.vehicleName) {
      const passedName = location.state.vehicleName;
      if (location.state.service === 'apartment') {
        const apt = apartments.find(a => a.title_en === passedName || a.title_el === passedName);
        if (apt) setSelectedApartment(apt);
      } else {
        const sct = scooters.find(s => s.name === passedName);
        if (sct) setSelectedScooter(sct);
      }
    }
  }, [location, apartments, scooters]);

  // Check availability when dates or selections change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.startDate || !formData.endDate) {
        setIsAvailable(true);
        return;
      }
      if (!selectedScooter && !selectedApartment) {
        setIsAvailable(true);
        return;
      }
      
      setCheckingAvailability(true);
      try {
        const vehicleNames = [];
        if (selectedScooter) vehicleNames.push(selectedScooter.name);
        if (selectedApartment) vehicleNames.push(isGreek ? selectedApartment.title_el : selectedApartment.title_en);
        
        let isOverlapping = false;

        for (const vName of vehicleNames) {
          const { data, error } = await supabase
            .from('bookings')
            .select('start_date, end_date, status')
            .eq('vehicle_name', vName)
            .neq('status', 'cancelled');

          if (error) continue;

          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          
          const hasOverlap = data.some(booking => {
            const bStart = new Date(booking.start_date);
            const bEnd = new Date(booking.end_date);
            return (start <= bEnd && end >= bStart);
          });

          if (hasOverlap) {
            isOverlapping = true;
            break;
          }
        }

        setIsAvailable(!isOverlapping);
      } catch (error) {
        console.error('Error checking availability:', error);
        setIsAvailable(true);
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [formData.startDate, formData.endDate, selectedScooter, selectedApartment, isGreek]);

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const days = calculateDays();
  const scooterPrice = selectedScooter ? parseFloat(selectedScooter.price || 0) : 0;
  const apartmentPrice = selectedApartment ? parseFloat(selectedApartment.price || 0) : 0;
  const totalPrice = days * (scooterPrice + apartmentPrice);

  const getCombinedName = () => {
    const names = [];
    if (selectedApartment) {
      names.push(isGreek ? selectedApartment.title_el : selectedApartment.title_en);
    }
    if (selectedScooter) {
      names.push(selectedScooter.name);
    }
    return names.join(' & ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScooter && !selectedApartment) {
      alert(t('bookingPage.selectWarning', 'Please select at least one scooter or apartment to book.'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const combinedName = getCombinedName();
      
      const { error } = await supabase
        .from('bookings')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          start_date: formData.startDate,
          end_date: formData.endDate,
          vehicle_name: combinedName,
          notes: formData.notes
        }]);

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-28 pb-12 md:pb-20 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('bookingPage.successTitle', 'Booking Request Sent!')}</h2>
          <p className="text-slate-600 mb-8">{t('bookingPage.successMessage', 'Thank you! We have received your request and will contact you shortly to confirm.')}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            {t('bookingPage.backHome', 'Return to Home')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-12 md:pb-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
          
          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            
            {/* 1. Personal Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">1. {t('bookingPage.personalDetails', 'Personal Details')}</h3>
              
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
            </div>

            {/* 2. Visual Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">2. {t('bookingPage.chooseOptions', 'Choose Accommodation & Vehicles')}</h3>
              <p className="text-sm text-slate-500">{t('bookingPage.selectHelp', 'You can select an apartment, a scooter, or both!')}</p>

              {/* Apartments */}
              <div>
                <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2"><HomeIcon size={18} /> {t('bookingPage.selectApartment', 'Select Apartment (Optional)')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {apartments.map(apt => {
                    const title = isGreek ? apt.title_el : apt.title_en;
                    const isSelected = selectedApartment?.id === apt.id;
                    const price = parseFloat(apt.price || 0).toFixed(2);
                    
                    return (
                      <div 
                        key={apt.id}
                        onClick={() => setSelectedApartment(isSelected ? null : apt)}
                        className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all relative group ${isSelected ? 'border-cyan-500 shadow-md ring-4 ring-cyan-500/10' : 'border-slate-200 hover:border-cyan-300 hover:shadow-sm'}`}
                      >
                        <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                          {apt.images && apt.images.length > 0 ? (
                            <img src={apt.images[0]} alt={title} className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><HomeIcon size={32} /></div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="font-semibold text-slate-900 text-sm truncate">{title}</p>
                          <p className="text-cyan-600 font-bold text-sm">€{price}<span className="text-xs text-slate-500 font-normal"> / {t('bookingPage.day', 'day')}</span></p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-1 shadow-sm">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Scooters */}
              <div className="pt-4">
                <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2"><Car size={18} /> {t('bookingPage.selectScooter', 'Select Scooter (Optional)')}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {scooters.map(scooter => {
                    const isSelected = selectedScooter?.id === scooter.id;
                    const price = parseFloat(scooter.price || 0).toFixed(2);
                    
                    return (
                      <div 
                        key={scooter.id}
                        onClick={() => setSelectedScooter(isSelected ? null : scooter)}
                        className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all relative group ${isSelected ? 'border-cyan-500 shadow-md ring-4 ring-cyan-500/10' : 'border-slate-200 hover:border-cyan-300 hover:shadow-sm'}`}
                      >
                        <div className="aspect-[4/3] bg-slate-100 overflow-hidden p-2">
                          {scooter.image ? (
                            <img src={scooter.image} alt={scooter.name} className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><Car size={32} /></div>
                          )}
                        </div>
                        <div className="p-3 bg-white border-t border-slate-50">
                          <p className="font-semibold text-slate-900 text-sm truncate">{scooter.name}</p>
                          <p className="text-cyan-600 font-bold text-sm">€{price}<span className="text-xs text-slate-500 font-normal"> / {t('bookingPage.day', 'day')}</span></p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-1 shadow-sm">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Availability Warning */}
            {(!isAvailable && formData.startDate && formData.endDate && (selectedScooter || selectedApartment)) && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{t('bookingPage.notAvailable', 'Sorry, one or more selected items are already booked for these dates.')}</p>
              </div>
            )}

            {/* 3. Notes & Total */}
            <div className="space-y-6 border-t pt-8">
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

              {/* Price Summary */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">{t('bookingPage.totalLabel', 'Estimated Total')}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-cyan-400">€{totalPrice.toFixed(2)}</span>
                    <span className="text-slate-400 text-sm">
                      {days > 0 ? `(${days} ${t('bookingPage.days', 'days')})` : ''}
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || checkingAvailability || !isAvailable || (!selectedScooter && !selectedApartment)}
                  className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  {(isSubmitting || checkingAvailability) ? <Loader2 className="animate-spin" size={20} /> : t('bookingPage.submitBtn')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
