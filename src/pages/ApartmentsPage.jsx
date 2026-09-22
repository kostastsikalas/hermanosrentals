import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApartments } from '../hooks/useApartments';
import ApartmentCard from '../components/apartments/ApartmentCard';
import { Loader2 } from 'lucide-react';

const ApartmentsPage = () => {
  const { t, i18n } = useTranslation();
  const { apartments, loading } = useApartments();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Apartments Hero Section */}
      <div className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2068&auto=format&fit=crop" 
            alt="Apartments Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Hermanos Apartments" 
            className="w-full max-w-[200px] md:max-w-[280px] object-contain mb-8 shadow-2xl rounded-3xl animate-float border-[4px] border-white/20 bg-white"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-md">
            {t('apartmentsPage.title')}
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light">
            {t('apartmentsPage.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Grid Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-cyan-500" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {apartments.filter(apt => apt.status !== 'hidden').map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ApartmentsPage;
