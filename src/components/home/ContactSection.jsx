import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'both',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for actual form submission
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({ name: '', email: '', service: 'both', message: '' });
  };

  return (
    <section id="contact" className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">Get in Touch</h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
            Have a question about a rental or your upcoming stay? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          
          {/* Contact Info & Map placeholder */}
          <div className="p-6 md:p-12 h-full flex flex-col order-2 lg:order-1">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8">Contact Information</h3>
            
            <div className="space-y-6 mb-12 flex-grow">
              <div className="flex items-start space-x-4">
                <div className="bg-cyan-100 p-3 rounded-full text-cyan-600">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Call / WhatsApp</h4>
                  <p className="text-slate-600 mt-1">+30 210 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Email Us</h4>
                  <p className="text-slate-600 mt-1">hello@hermanos.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Our Location</h4>
                  <p className="text-slate-600 mt-1">123 Island View Road<br />Paradise Bay, 80100</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-slate-200 rounded-2xl overflow-hidden relative border border-slate-300 flex items-center justify-center">
              <div className="text-slate-500 flex flex-col items-center">
                <MapPin size={32} className="mb-2 opacity-50" />
                <span className="font-medium text-sm">Interactive Map Placeholder</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900 p-8 md:p-12 text-white">
            <h3 className="text-2xl font-bold mb-8">Send an Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Interested In</label>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors appearance-none"
                >
                  <option value="scooter">Scooter Rental Only</option>
                  <option value="apartment">Apartment Stay Only</option>
                  <option value="both">Both (Ride & Stay)</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Send Message <Send size={18} />
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
