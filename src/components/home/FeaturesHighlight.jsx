import React from 'react';
import { ShieldCheck, Clock, CalendarCheck, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeaturesHighlight = () => {
  const { t } = useTranslation();
  
  const features = [
    {
      icon: <Award className="text-cyan-500" size={32} />,
      title: t('features.f1_title'),
      description: t('features.f1_desc')
    },
    {
      icon: <ShieldCheck className="text-emerald-500" size={32} />,
      title: t('features.f2_title'),
      description: t('features.f2_desc')
    },
    {
      icon: <Clock className="text-orange-500" size={32} />,
      title: t('features.f3_title'),
      description: t('features.f3_desc')
    },
    {
      icon: <CalendarCheck className="text-purple-500" size={32} />,
      title: t('features.f4_title'),
      description: t('features.f4_desc')
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">{t('features.title')}</h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start gap-4 group">
              <div className="w-12 h-12 flex items-center justify-start text-sky-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesHighlight;
