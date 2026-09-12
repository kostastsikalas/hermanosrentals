import React from 'react';
import { ShieldCheck, Clock, CalendarCheck, Award } from 'lucide-react';

const FeaturesHighlight = () => {
  const features = [
    {
      icon: <Award className="text-cyan-500" size={32} />,
      title: "Verified Superhost",
      description: "Recognized for outstanding hospitality across major platforms."
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={32} />,
      title: "Best Rates Guaranteed",
      description: "Direct booking means no hidden fees and the best price available."
    },
    {
      icon: <Clock className="text-orange-500" size={32} />,
      title: "24/7 Support",
      description: "Round-the-clock assistance during your entire stay and rental period."
    },
    {
      icon: <CalendarCheck className="text-purple-500" size={32} />,
      title: "Seamless Booking",
      description: "Quick, secure, and hassle-free online reservations in minutes."
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Hermanos</h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
            We combine premium quality with exceptional service to ensure your island holiday is perfect.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesHighlight;
