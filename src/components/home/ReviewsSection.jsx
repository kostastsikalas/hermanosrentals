import React, { useState } from 'react';
import ReviewCard from '../common/ReviewCard';
import { reviews } from '../../data/reviews';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReviewsSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');

  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'booking') return review.source === 'Booking.com';
    if (activeTab === 'airbnb') return review.source === 'Airbnb';
    return true;
  });

  return (
    <section id="reviews" className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4">{t('reviews.title')}</h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8 md:mb-10">
            {t('reviews.subtitle')}
          </p>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'all' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t('reviews.allReviews', 'All Reviews')}
            </button>
            <button 
              onClick={() => setActiveTab('booking')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'booking' 
                ? 'bg-[#003580] text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Booking.com <span className="bg-white/20 px-2 py-0.5 rounded text-xs">9.8/10</span>
            </button>
            <button 
              onClick={() => setActiveTab('airbnb')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'airbnb' 
                ? 'bg-[#FF5A5F] text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Airbnb <span className="bg-white/20 px-2 py-0.5 rounded text-xs flex items-center gap-1"><Star size={10} className="fill-white"/> 4.95</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <div key={review.id} className="h-full">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ReviewsSection;
