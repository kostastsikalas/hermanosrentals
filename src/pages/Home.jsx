import React, { useEffect } from 'react';
import HeroDualChoice from '../components/home/HeroDualChoice';
import FeaturesHighlight from '../components/home/FeaturesHighlight';
import ReviewsSection from '../components/home/ReviewsSection';
import ContactSection from '../components/home/ContactSection';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="w-full">
      <HeroDualChoice />
      <FeaturesHighlight />
      <ReviewsSection />
      <ContactSection />
    </div>
  );
};

export default Home;
