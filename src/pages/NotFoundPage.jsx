import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { i18n } = useTranslation();
  const isGreek = i18n.language.startsWith('el');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {isGreek ? 'Η σελίδα δεν βρέθηκε' : 'Page Not Found'}
        </h1>
        <p className="text-slate-500 mb-8">
          {isGreek 
            ? 'Η σελίδα που ψάχνετε δεν υπάρχει ή έχει μετακινηθεί.' 
            : 'The page you are looking for does not exist or has been moved.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <Home size={18} />
            {isGreek ? 'Αρχική Σελίδα' : 'Go Home'}
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            {isGreek ? 'Πίσω' : 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
