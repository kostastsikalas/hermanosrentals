import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ApartmentsPage = () => {
  const { t } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('pages.apartmentsTitle').split('|')[0]}</h1>
        <p className="text-slate-600">{t('pages.comingSoon')}</p>
      </div>
    </div>
  );
};

export default ApartmentsPage;
