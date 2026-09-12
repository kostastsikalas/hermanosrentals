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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
          
          {/* Contact Info & Map placeholder */}
          <div className="flex flex-col order-2 lg:order-1">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8">Contact Information</h3>
            
            <div className="space-y-8 mb-12 flex-grow">
              <div className="flex items-start space-x-4">
                <div className="text-sky-500 mt-1">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">Call / WhatsApp</h4>
                  <p className="text-slate-500 mt-1">+30 210 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-sky-500 mt-1">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">Email Us</h4>
                  <p className="text-slate-500 mt-1">hello@hermanos.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="text-sky-500 mt-1">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-lg">Our Location</h4>
                  <p className="text-slate-500 mt-1">123 Island View Road<br />Paradise Bay, 80100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="order-1 lg:order-2">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-8">Send an Inquiry</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>
              
              <div>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="Email Address"
                />
              </div>

              <div>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-slate-900 focus:outline-none focus:border-sky-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="scooter">Scooter Rental Only</option>
                  <option value="apartment">Apartment Stay Only</option>
                  <option value="both">Both (Ride & Stay)</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <textarea 
                  required
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full sm:w-auto bg-slate-900 hover:bg-sky-500 text-white font-semibold py-4 px-8 rounded-full transition-colors flex items-center justify-center gap-2 mt-4"
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
