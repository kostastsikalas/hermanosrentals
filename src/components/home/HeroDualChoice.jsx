import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Bike, Home as HomeIcon } from 'lucide-react';

const HeroDualChoice = () => {
  const [hoveredSide, setHoveredSide] = useState(null); // 'scooter', 'apartment', or null

  return (
    <section className="relative min-h-screen pt-24 pb-12 flex flex-col justify-center items-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* Dynamic Overlay */}
      <div 
        className={`absolute inset-0 transition-colors duration-700 ease-in-out ${
          hoveredSide === 'scooter' ? 'bg-cyan-950/50' : 
          hoveredSide === 'apartment' ? 'bg-emerald-950/50' : 
          'bg-slate-900/30'
        }`}
      />

      <div className="relative z-10 text-center mb-8 md:mb-12 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <img 
          src="/logo_white.png" 
          alt="Hermanos Logo" 
          className="w-full max-w-[280px] md:max-w-md lg:max-w-lg object-contain mb-8 md:mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] opacity-95 animate-float"
        />
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight drop-shadow-lg">
          Your Complete Island Experience
        </h1>
        <p className="text-base md:text-xl text-slate-300 font-light">
          Ride with freedom. Stay in comfort.
        </p>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        
        {/* Scooter Card */}
        <div 
          className={`relative group rounded-3xl overflow-hidden transition-all duration-500 ease-out transform ${
            hoveredSide === 'scooter' ? 'scale-[1.02] z-20 shadow-2xl shadow-cyan-500/20' : 
            hoveredSide === 'apartment' ? 'scale-95 opacity-50 blur-[1px]' : 'hover:scale-[1.02]'
          }`}
          onMouseEnter={() => setHoveredSide('scooter')}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop" 
            alt="Scooter Rentals" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="relative z-20 h-full min-h-[350px] md:min-h-[450px] p-6 md:p-12 flex flex-col justify-end">
            <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 text-cyan-50 w-fit px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 flex items-center gap-2">
              <Bike size={16} /> Explore with Freedom
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 group-hover:text-cyan-400 transition-colors">
              Scooter Rentals
            </h2>
            <p className="text-sm md:text-base text-slate-300 mb-6 md:mb-8 max-w-sm">
              Discover hidden beaches and scenic routes with our premium fleet of reliable, well-maintained scooters.
            </p>
            <Link 
              to="/scooters" 
              className="inline-flex items-center justify-center w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all transform group-hover:translate-x-2 text-sm md:text-base"
            >
              View Scooters & Availability <ChevronRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Apartment Card */}
        <div 
          className={`relative group rounded-3xl overflow-hidden transition-all duration-500 ease-out transform ${
            hoveredSide === 'apartment' ? 'scale-[1.02] z-20 shadow-2xl shadow-emerald-500/20' : 
            hoveredSide === 'scooter' ? 'scale-95 opacity-50 blur-[1px]' : 'hover:scale-[1.02]'
          }`}
          onMouseEnter={() => setHoveredSide('apartment')}
          onMouseLeave={() => setHoveredSide(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2068&auto=format&fit=crop" 
            alt="Holiday Apartments" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="relative z-20 h-full min-h-[350px] md:min-h-[450px] p-6 md:p-12 flex flex-col justify-end">
            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-50 w-fit px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 flex items-center gap-2">
              <HomeIcon size={16} /> Stay in Comfort
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 group-hover:text-emerald-400 transition-colors">
              Luxury Apartments
            </h2>
            <p className="text-sm md:text-base text-slate-300 mb-6 md:mb-8 max-w-sm">
              Relax in our beautifully designed seafront and central apartments, offering the perfect retreat.
            </p>
            <Link 
              to="/apartments" 
              className="inline-flex items-center justify-center w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all transform group-hover:translate-x-2 text-sm md:text-base"
            >
              Explore Apartments <ChevronRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroDualChoice;
