import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const ApartmentCard = ({ apartment }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const isGreek = i18n.language === 'el';
  const title = isGreek ? apartment.title_el : apartment.title_en;
  const floor = isGreek ? apartment.floor_el : apartment.floor_en;
  const amenities = isGreek ? apartment.amenities_el : apartment.amenities_en;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % apartment.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev === 0 ? apartment.images.length - 1 : prev - 1));
  };

  const handleBookNow = () => {
    navigate('/book', { state: { vehicleName: title, service: 'apartment' } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {apartment.images && apartment.images.length > 0 ? (
          <img
            src={apartment.images[currentImageIdx]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Building2 size={48} />
          </div>
        )}
        
        {/* Carousel Controls */}
        {apartment.images && apartment.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-slate-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              {currentImageIdx + 1} / {apartment.images.length}
            </div>
          </>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-500" />
            <span>{apartment.capacity} {t('apartmentsPage.guests')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-orange-500" />
            <span>{floor}</span>
          </div>
        </div>

        <div className="flex-grow mb-6">
          <ul className="space-y-2">
            {amenities && amenities.map((amenity, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-600">
                <Check className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                <span className="text-sm">{amenity}</span>
              </li>
            ))}
          </ul>
        </div>

        <button 
          onClick={handleBookNow}
          className="w-full mt-auto bg-slate-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-500 transition-colors duration-300"
        >
          {t('apartmentsPage.bookBtn')}
        </button>
      </div>
    </div>
  );
};

export default ApartmentCard;
