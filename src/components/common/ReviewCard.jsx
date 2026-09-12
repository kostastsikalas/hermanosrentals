import React from 'react';
import { Star } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const { name, date, source, rating, text, rentedItem, flag } = review;
  
  const isBooking = source === 'Booking.com';
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl">
            {flag}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{name}</h4>
            <p className="text-xs text-slate-500">{date}</p>
          </div>
        </div>
        
        {/* Source Badge */}
        <div className={`px-2 py-1 rounded text-xs font-bold ${isBooking ? 'bg-[#003580] text-white' : 'bg-[#FF5A5F] text-white'}`}>
          {source}
        </div>
      </div>
      
      {/* Rating */}
      <div className="flex items-center space-x-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} 
          />
        ))}
        <span className="text-xs font-semibold ml-2 text-slate-700">{rating.toFixed(1)}</span>
      </div>
      
      {/* Review Text */}
      <p className="text-slate-600 text-sm flex-grow italic mb-4 leading-relaxed">
        "{text}"
      </p>
      
      {/* Rented Item Tag */}
      <div className="mt-auto pt-3 border-t border-slate-50">
        <span className="inline-block bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
          {rentedItem}
        </span>
      </div>
    </div>
  );
};

export default ReviewCard;
