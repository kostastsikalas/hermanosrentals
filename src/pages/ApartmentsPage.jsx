import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apartments } from '../data/apartments';
import ApartmentCard from '../components/apartments/ApartmentCard';

const ApartmentsPage = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {t('apartmentsPage.title')}
          </h1>
          <p className="text-lg text-slate-600">
            {t('apartmentsPage.subtitle')}
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {apartments.map((apartment) => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ApartmentsPage;
