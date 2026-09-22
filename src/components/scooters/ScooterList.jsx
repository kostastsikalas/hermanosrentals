import React, { useState } from 'react';
import ScooterCard from './ScooterCard';
import { useScooters } from '../../hooks/useScooters';
import { useTranslation } from 'react-i18next';
import { Filter, Loader2 } from 'lucide-react';

const ScooterList = () => {
  const { t } = useTranslation();
  const { scooters, loading } = useScooters();
  const [activeCategory, setActiveCategory] = useState('All');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  // Derive unique categories from data
  const categories = ['All', ...new Set(scooters.map(s => s.category))];

  const filteredScooters = scooters.filter(scooter => {
    if (activeCategory === 'All') return true;
    return scooter.category === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      
      {/* Filters */}
      <div className="mb-10 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 text-slate-700 font-medium">
          <Filter size={20} className="text-cyan-500" />
          <span>{t('scootersPage.filterLabel', 'Category Filter:')}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeCategory === category
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredScooters.map(scooter => (
          <ScooterCard key={scooter.id} scooter={scooter} />
        ))}
      </div>
      
      {filteredScooters.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">{t('scootersPage.noResults', 'No scooters found in this category.')}</p>
        </div>
      )}
    </div>
  );
};

export default ScooterList;
