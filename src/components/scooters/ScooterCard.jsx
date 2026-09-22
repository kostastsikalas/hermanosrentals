import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bike, CheckCircle2 } from 'lucide-react';

const ScooterCard = ({ scooter }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentFeatures = i18n.language.startsWith('el') 
    ? (scooter.features_el || scooter.features || [])
    : (scooter.features_en || scooter.features || []);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img 
          src={scooter.image} 
          alt={scooter.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-slate-900 shadow-sm border border-white/20">
          €{scooter.price}<span className="text-sm font-medium text-slate-500">{t('scootersPage.perDay')}</span>
        </div>
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 w-max">
            <Bike size={14} />
            {scooter.category}
          </div>
          {scooter.status === 'on_request' ? (
             <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 w-max">
               {t('scootersPage.onRequest')}
             </div>
          ) : (
             <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 w-max">
               {t('scootersPage.available')}
             </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{scooter.name}</h3>
        
        <div className="mb-6 flex-grow">
          <p className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">{t('scootersPage.features')}</p>
          <ul className="space-y-2">
            {currentFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start text-sm text-slate-600">
                <CheckCircle2 size={16} className="text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => navigate('/book', { state: { vehicleName: scooter.name, vehicleId: scooter.id } })}
          className="w-full bg-slate-900 hover:bg-cyan-500 text-white font-medium py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-md"
        >
          {t('scootersPage.bookBtn')}
        </button>
      </div>
    </div>
  );
};

export default ScooterCard;
