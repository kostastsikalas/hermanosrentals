import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, User, MessageSquare, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ContactSection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'both',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for actual form submission
    alert(t('contact.alert'));
    setFormData({ name: '', email: '', service: 'both', message: '' });
  };

  return (
    <section id="contact" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">{t('contact.title')}</h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
          
          {/* Contact Info & Map placeholder */}
          <div className="flex flex-col order-2 lg:order-1">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8">{t('contact.infoTitle')}</h3>
            
            <div className="space-y-8 mb-12 flex-grow">
              <div className="flex items-start space-x-4">
                <div className="text-sky-500 mt-1">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">{t('contact.call')}</h4>
                  <p className="text-slate-500 mt-1">+30 210 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-sky-500 mt-1">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">{t('contact.email')}</h4>
                  <p className="text-slate-500 mt-1">hello@hermanos.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-sky-500 mt-1">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">{t('contact.location')}</h4>
                  <p className="text-slate-500 mt-1">{t('contact.address1')}<br />{t('contact.address2')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          {/* Contact Form */}
          <div className="order-1 lg:order-2 bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 relative z-10">{t('contact.formTitle')}</h3>
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>

              <div className="relative group">
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-5 pr-12 text-slate-700 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="scooter">{t('contact.serviceScooter')}</option>
                  <option value="apartment">{t('contact.serviceApartment')}</option>
                  <option value="both">{t('contact.serviceBoth')}</option>
                  <option value="other">{t('contact.serviceOther')}</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute top-4 left-4 flex items-start pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                  <MessageSquare size={18} />
                </div>
                <textarea 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all duration-300 resize-none"
                  placeholder={t('contact.msgPlaceholder')}
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-sky-500 text-white font-medium py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] transform hover:-translate-y-0.5"
              >
                {t('contact.sendBtn')} <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
