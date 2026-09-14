import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ScooterList from '../components/scooters/ScooterList';

const ScootersPage = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Scooters Hero Section */}
      <div className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/productscooter.jpg" 
            alt="Scooter Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <img 
            src="/logoscooter.JPG" 
            alt="Hermanos Scooters" 
            className="w-full max-w-[200px] md:max-w-[280px] object-contain mb-8 shadow-2xl rounded-3xl animate-float border-[4px] border-white/20 bg-white"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-md">
            {t('scootersPage.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light">
            {t('scootersPage.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <ScooterList />
    </div>
  );
};

export default ScootersPage;
