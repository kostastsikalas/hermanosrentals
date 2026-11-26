import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MessageSquare, Car, CheckCircle, Loader2, Home as HomeIcon, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useScooters } from '../hooks/useScooters';
import { useApartments } from '../hooks/useApartments';
import { calculateDays, computePayment, getAvailableOptions, PAYMENT_OPTION_LABELS } from '../lib/pricing';

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
    birthDate: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [selectedScooter, setSelectedScooter] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [paymentOption, setPaymentOption] = useState(null);
  const [submitError, setSubmitError] = useState('');

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
            .ilike('vehicle_name', `%${vName}%`)
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

        // Check live Hosthub calendar for the selected apartment
        if (!isOverlapping && selectedApartment) {
          try {
            const hhRes = await fetch(
              `/api/hosthub-check?apartmentId=${encodeURIComponent(selectedApartment.id)}&hosthubId=${encodeURIComponent(selectedApartment.hosthub_id || '')}&startDate=${formData.startDate}&endDate=${formData.endDate}`
            );
            if (hhRes.ok) {
              const hhData = await hhRes.json();
              if (hhData && hhData.available === false) {
                isOverlapping = true;
              }
            }
          } catch {
            // Ignore transient check errors
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

  const days = calculateDays(formData.startDate, formData.endDate);
  const selection = { hasApartment: Boolean(selectedApartment), hasScooter: Boolean(selectedScooter) };
  const availableOptions = getAvailableOptions(selection);

  // Keep the chosen payment option valid when the selection changes
  useEffect(() => {
    if (!availableOptions.includes(paymentOption)) {
      setPaymentOption(availableOptions[0] || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.hasApartment, selection.hasScooter]);

  const payment = computePayment({
    apartmentPrice: selectedApartment?.price,
    scooterPrice: selectedScooter?.price,
    days,
    ...selection,
    option: paymentOption,
  });
  const totalPrice = payment.total;

  const optionDescriptions = {
    scooter_deposit: isGreek
      ? 'Πληρώνετε τώρα το 30% της μηχανής και το υπόλοιπο κατά την παραλαβή.'
      : 'Pay 30% of the scooter now and the rest at pickup.',
    full: isGreek ? 'Πληρώνετε ολόκληρο το ποσό τώρα.' : 'Pay the full amount now.',
    combo_deposit: isGreek
      ? 'Ολόκληρο το ποσό του δωματίου + 30% της μηχανής τώρα. Το υπόλοιπο της μηχανής κατά την παραλαβή.'
      : 'Full room price + 30% of the scooter now. Scooter balance at pickup.',
    full_refundable: isGreek
      ? 'Ολόκληρο το ποσό τώρα. Επιστροφή χρημάτων σε περίπτωση ακύρωσης σύμφωνα με τους όρους.'
      : 'Full amount now. Refund on cancellation according to our terms.',
    full_nonrefundable: isGreek
      ? 'Ολόκληρο το ποσό τώρα με έκπτωση 10%. Δεν επιστρέφονται χρήματα σε περίπτωση ακύρωσης.'
      : 'Full amount now with 10% off. No refund on cancellation.',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!selectedScooter && !selectedApartment) {
      setSubmitError(t('bookingPage.selectWarning', 'Please select at least one scooter or apartment to book.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/viva-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
          email: formData.email,
          phone: formData.phone,
          startDate: formData.startDate,
          endDate: formData.endDate,
          notes: formData.notes,
          apartmentId: selectedApartment?.id ?? null,
          scooterId: selectedScooter?.id ?? null,
          paymentOption: payment.option,
          lang: i18n.language,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok || !data?.checkoutUrl) {
        throw new Error(
          data?.error ||
            (isGreek
              ? 'Η πληρωμή δεν είναι διαθέσιμη αυτή τη στιγμή. Δοκιμάστε ξανά ή επικοινωνήστε μαζί μας.'
              : 'Online payment is not available right now. Please try again or contact us.')
        );
      }

      // Saved so the success page can send the confirmation emails after payment
      const p = data.payment || payment;
      const optionLabel = PAYMENT_OPTION_LABELS[p.option]?.[isGreek ? 'el' : 'en'] || p.option;
      sessionStorage.setItem(
        'hermanos_pending_booking',
        JSON.stringify({
          orderCode: data.orderCode,
          templateParams: {
            booking_code: data.bookingCode,
            first_name: formData.firstName,
            last_name: formData.lastName,
            birth_date: formData.birthDate || '-',
            email: formData.email,
            phone: formData.phone,
            start_date: formData.startDate,
            end_date: formData.endDate,
            vehicle_name: data.vehicleName,
            total_price: Number(p.total).toFixed(2),
            amount_paid: Number(p.dueNow).toFixed(2),
            amount_remaining: Number(p.remaining).toFixed(2),
            payment_option: optionLabel,
            refundable: p.refundable ? (isGreek ? 'Ναι' : 'Yes') : (isGreek ? 'Όχι' : 'No'),
            notes: `${formData.notes || '-'} | ${optionLabel} | ${isGreek ? 'Πληρώθηκε' : 'Paid'}: €${Number(p.dueNow).toFixed(2)} | ${isGreek ? 'Υπόλοιπο' : 'Balance'}: €${Number(p.remaining).toFixed(2)}`,
          },
        })
      );

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Error submitting booking:', error);
      setSubmitError(error.message || String(error));
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                    {t('bookingPage.birthDate', 'Date of Birth')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                      <Calendar size={18} />
                    </div>
                    <input 
                      type="date" 
                      required
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                      title={t('bookingPage.birthDate', 'Date of Birth')}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                    {t('bookingPage.email', 'Email Address')}
                  </label>
                  <div className="relative">
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
                </div>

                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                    {t('bookingPage.phone', 'Phone Number')}
                  </label>
                  <div className="relative">
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
              </div>
            </div>

            {/* 2. Book Dates */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">2. {t('bookingPage.bookDates', 'Book Dates')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                    {t('bookingPage.startDate', 'Start Date')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                      <Calendar size={18} />
                    </div>
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.startDate}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setFormData((prev) => {
                          // If end date is empty or before the new start date, update end date to start date + 1 day
                          let nextEnd = prev.endDate;
                          if (!nextEnd || nextEnd <= newStart) {
                            if (newStart) {
                              const d = new Date(newStart);
                              d.setDate(d.getDate() + 1);
                              nextEnd = d.toISOString().split('T')[0];
                            }
                          }
                          return { ...prev, startDate: newStart, endDate: nextEnd };
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                      title={t('bookingPage.startDate')}
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 ml-1">
                    {t('bookingPage.endDate', 'End Date')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                      <Calendar size={18} />
                    </div>
                    <input 
                      type="date" 
                      required
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                      title={t('bookingPage.endDate')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Choose Accommodation & Vehicles */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">3. {t('bookingPage.chooseOptions', 'Choose Accommodation & Vehicles')}</h3>
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
                          {apt?.images && apt?.images.length > 0 ? (
                            <img src={apt?.images[0]} alt={title} className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><HomeIcon size={32} /></div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <p className="font-semibold text-slate-900 text-sm truncate">{title}</p>
                          {days > 0 ? (
                            <p className="text-cyan-600 font-bold text-sm">
                              €{(parseFloat(apt.price || 0) * days).toFixed(2)}
                              <span className="text-xs text-slate-500 font-normal"> ({days} {t('bookingPage.days', 'days')})</span>
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 mt-1 italic">
                              {isGreek ? 'Επιλέξτε ημερομηνίες' : 'Select dates to view price'}
                            </p>
                          )}
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
                          {days > 0 ? (
                            <p className="text-cyan-600 font-bold text-sm">
                              €{(parseFloat(scooter.price || 0) * days).toFixed(2)}
                              <span className="text-xs text-slate-500 font-normal"> ({days} {t('bookingPage.days', 'days')})</span>
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 mt-1 italic">
                              {isGreek ? 'Επιλέξτε ημερομηνίες' : 'Select dates to view price'}
                            </p>
                          )}
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

            {/* Payment Option */}
            {availableOptions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">
                  4. {isGreek ? 'Τρόπος Πληρωμής' : 'Payment Option'}
                </h3>
                <div className="grid grid-cols-1 gap-3" role="radiogroup">
                  {availableOptions.map((opt) => {
                    const optPay = computePayment({
                      apartmentPrice: selectedApartment?.price,
                      scooterPrice: selectedScooter?.price,
                      days,
                      ...selection,
                      option: opt,
                    });
                    const checked = payment.option === opt;
                    return (
                      <label
                        key={opt}
                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          checked ? 'border-cyan-500 bg-cyan-50/40 ring-4 ring-cyan-500/10' : 'border-slate-200 hover:border-cyan-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentOption"
                          value={opt}
                          checked={checked}
                          onChange={() => setPaymentOption(opt)}
                          className="mt-1 accent-sky-500"
                        />
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">
                              {PAYMENT_OPTION_LABELS[opt][isGreek ? 'el' : 'en']}
                            </span>
                            {days > 0 && (
                              <span className="font-bold text-slate-900">
                                €{optPay.dueNow.toFixed(2)}
                                <span className="text-xs font-normal text-slate-500"> {isGreek ? 'τώρα' : 'now'}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{optionDescriptions[opt]}</p>
                          {opt === 'full_nonrefundable' && days > 0 && (
                            <p className="text-xs font-semibold text-green-700 mt-1">
                              {isGreek ? 'Κερδίζετε' : 'You save'} €{optPay.discount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Notes & Total */}
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

              {submitError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{submitError}</p>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full md:w-auto">
                  <p className="text-slate-400 text-sm font-medium mb-1">{isGreek ? 'Πληρωμή τώρα' : 'Pay now'}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-cyan-400">€{payment.dueNow.toFixed(2)}</span>
                    <span className="text-slate-400 text-sm">
                      {days > 0 ? `(${days} ${t('bookingPage.days', 'days')})` : ''}
                    </span>
                  </div>
                  {days > 0 && (selectedScooter || selectedApartment) && (
                    <div className="mt-2 text-sm text-slate-400 space-y-0.5">
                      <p>{isGreek ? 'Σύνολο κράτησης' : 'Booking total'}: €{totalPrice.toFixed(2)}{payment.discount > 0 ? ` (-€${payment.discount.toFixed(2)})` : ''}</p>
                      {payment.remaining > 0 && (
                        <p>{isGreek ? 'Υπόλοιπο κατά την παραλαβή' : 'Balance at pickup'}: €{payment.remaining.toFixed(2)}</p>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || checkingAvailability || !isAvailable || (!selectedScooter && !selectedApartment)}
                  className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-900 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  {(isSubmitting || checkingAvailability) ? <Loader2 className="animate-spin" size={20} /> : (isGreek ? 'Συνέχεια στην πληρωμή' : 'Continue to payment')}
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
